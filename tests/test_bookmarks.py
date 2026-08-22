def test_create_bookmark_success(client, register_and_login):
    headers = register_and_login()

    response = client.post(
        "/bookmarks",
        headers=headers,
        json={"url": "https://example.com", "title": "Example", "notes": "test note"},
    )

    assert response.status_code == 200

    body = response.json()
    assert body["url"] == "https://example.com"
    assert body["title"] == "Example"
    assert body["notes"] == "test note"
    assert "bookmark_id" in body


def test_create_bookmark_requires_auth(client):
    response = client.post(
        "/bookmarks",
        json={"url": "https://example.com", "title": "Example"},
    )

    assert response.status_code in (401, 403)


def test_create_bookmark_duplicate_url_for_same_user(client, register_and_login):
    headers = register_and_login()
    client.post(
        "/bookmarks",
        headers=headers,
        json={"url": "https://example.com", "title": "Example"},
    )

    response = client.post(
        "/bookmarks",
        headers=headers,
        json={"url": "https://example.com", "title": "Different title"},
    )

    assert response.status_code == 400


def test_same_url_allowed_for_different_users(client, register_and_login):
    alice_headers = register_and_login(username="alice", email="alice@example.com")
    bob_headers = register_and_login(username="bob", email="bob@example.com")

    response_alice = client.post(
        "/bookmarks",
        headers=alice_headers,
        json={"url": "https://example.com", "title": "Alice's bookmark"},
    )
    response_bob = client.post(
        "/bookmarks",
        headers=bob_headers,
        json={"url": "https://example.com", "title": "Bob's bookmark"},
    )

    assert response_alice.status_code == 200
    assert response_bob.status_code == 200


def test_get_bookmarks_only_returns_own(client, register_and_login):
    alice_headers = register_and_login(username="alice", email="alice@example.com")
    bob_headers = register_and_login(username="bob", email="bob@example.com")

    client.post(
        "/bookmarks",
        headers=alice_headers,
        json={"url": "https://alice.example.com", "title": "Alice's bookmark"},
    )
    client.post(
        "/bookmarks",
        headers=bob_headers,
        json={"url": "https://bob.example.com", "title": "Bob's bookmark"},
    )

    response = client.get("/bookmarks", headers=alice_headers)

    assert response.status_code == 200
    urls = [b["url"] for b in response.json()]
    assert urls == ["https://alice.example.com"]


def test_get_specific_bookmark_owned_by_other_user_returns_404(client, register_and_login):
    alice_headers = register_and_login(username="alice", email="alice@example.com")
    bob_headers = register_and_login(username="bob", email="bob@example.com")

    create_response = client.post(
        "/bookmarks",
        headers=alice_headers,
        json={"url": "https://alice.example.com", "title": "Alice's bookmark"},
    )
    bookmark_id = create_response.json()["bookmark_id"]

    response = client.get(f"/bookmarks/{bookmark_id}", headers=bob_headers)

    assert response.status_code == 404


def test_update_bookmark_owned_by_other_user_returns_404(client, register_and_login):
    alice_headers = register_and_login(username="alice", email="alice@example.com")
    bob_headers = register_and_login(username="bob", email="bob@example.com")

    create_response = client.post(
        "/bookmarks",
        headers=alice_headers,
        json={"url": "https://alice.example.com", "title": "Alice's bookmark"},
    )
    bookmark_id = create_response.json()["bookmark_id"]

    response = client.patch(
        f"/bookmarks/{bookmark_id}",
        headers=bob_headers,
        json={"title": "Hijacked"},
    )

    assert response.status_code == 404


def test_delete_bookmark_owned_by_other_user_returns_404(client, register_and_login):
    alice_headers = register_and_login(username="alice", email="alice@example.com")
    bob_headers = register_and_login(username="bob", email="bob@example.com")

    create_response = client.post(
        "/bookmarks",
        headers=alice_headers,
        json={"url": "https://alice.example.com", "title": "Alice's bookmark"},
    )
    bookmark_id = create_response.json()["bookmark_id"]

    response = client.delete(f"/bookmarks/{bookmark_id}", headers=bob_headers)

    assert response.status_code == 404


def test_update_bookmark_success(client, register_and_login):
    headers = register_and_login()
    create_response = client.post(
        "/bookmarks",
        headers=headers,
        json={"url": "https://example.com", "title": "Example"},
    )
    bookmark_id = create_response.json()["bookmark_id"]

    response = client.patch(
        f"/bookmarks/{bookmark_id}",
        headers=headers,
        json={"title": "Updated title"},
    )

    assert response.status_code == 200
    assert response.json()["title"] == "Updated title"


def test_delete_bookmark_success(client, register_and_login):
    headers = register_and_login()
    create_response = client.post(
        "/bookmarks",
        headers=headers,
        json={"url": "https://example.com", "title": "Example"},
    )
    bookmark_id = create_response.json()["bookmark_id"]

    delete_response = client.delete(f"/bookmarks/{bookmark_id}", headers=headers)
    assert delete_response.status_code == 204

    get_response = client.get(f"/bookmarks/{bookmark_id}", headers=headers)
    assert get_response.status_code == 404


def test_filter_bookmarks_by_tag(client, register_and_login):
    headers = register_and_login()
    tag_response = client.post("/tags", headers=headers, json={"tag": "work"})
    tag_id = tag_response.json()["tag_id"]

    bookmark_response = client.post(
        "/bookmarks",
        headers=headers,
        json={"url": "https://work.example.com", "title": "Work bookmark"},
    )
    bookmark_id = bookmark_response.json()["bookmark_id"]
    client.post(f"/bookmarks/{bookmark_id}/tags/{tag_id}", headers=headers)

    client.post(
        "/bookmarks",
        headers=headers,
        json={"url": "https://other.example.com", "title": "Other bookmark"},
    )

    response = client.get("/bookmarks", headers=headers, params={"tag": "work"})

    assert response.status_code == 200
    urls = [b["url"] for b in response.json()]
    assert urls == ["https://work.example.com"]


def test_search_bookmarks_by_keyword(client, register_and_login):
    headers = register_and_login()
    client.post(
        "/bookmarks",
        headers=headers,
        json={"url": "https://fastapi.example.com", "title": "FastAPI docs"},
    )
    client.post(
        "/bookmarks",
        headers=headers,
        json={"url": "https://other.example.com", "title": "Something else"},
    )

    response = client.get("/bookmarks", headers=headers, params={"q": "fastapi"})

    assert response.status_code == 200
    titles = [b["title"] for b in response.json()]
    assert titles == ["FastAPI docs"]


def test_link_and_unlink_tag(client, register_and_login):
    headers = register_and_login()
    tag_response = client.post("/tags", headers=headers, json={"tag": "work"})
    tag_id = tag_response.json()["tag_id"]
    bookmark_response = client.post(
        "/bookmarks",
        headers=headers,
        json={"url": "https://example.com", "title": "Example"},
    )
    bookmark_id = bookmark_response.json()["bookmark_id"]

    link_response = client.post(f"/bookmarks/{bookmark_id}/tags/{tag_id}", headers=headers)
    assert link_response.status_code == 204

    get_response = client.get(f"/bookmarks/{bookmark_id}", headers=headers)
    assert [t["tag_id"] for t in get_response.json()["tags"]] == [tag_id]

    unlink_response = client.delete(f"/bookmarks/{bookmark_id}/tags/{tag_id}", headers=headers)
    assert unlink_response.status_code == 204

    get_response = client.get(f"/bookmarks/{bookmark_id}", headers=headers)
    assert get_response.json()["tags"] == []


def test_link_tag_owned_by_other_user_returns_404(client, register_and_login):
    alice_headers = register_and_login(username="alice", email="alice@example.com")
    bob_headers = register_and_login(username="bob", email="bob@example.com")

    tag_response = client.post("/tags", headers=alice_headers, json={"tag": "work"})
    tag_id = tag_response.json()["tag_id"]

    bookmark_response = client.post(
        "/bookmarks",
        headers=bob_headers,
        json={"url": "https://example.com", "title": "Bob's bookmark"},
    )
    bookmark_id = bookmark_response.json()["bookmark_id"]

    response = client.post(f"/bookmarks/{bookmark_id}/tags/{tag_id}", headers=bob_headers)

    assert response.status_code == 404

def test_create_tag_success(client, register_and_login):
    headers = register_and_login()

    response = client.post("/tags", headers=headers, json={"tag": "work"})

    assert response.status_code == 200
    body = response.json()
    assert body["tag"] == "work"
    assert "tag_id" in body


def test_create_tag_requires_auth(client):
    response = client.post("/tags", json={"tag": "work"})

    assert response.status_code in (401, 403)


def test_create_duplicate_tag_for_same_user(client, register_and_login):
    headers = register_and_login()
    client.post("/tags", headers=headers, json={"tag": "work"})

    response = client.post("/tags", headers=headers, json={"tag": "work"})

    assert response.status_code == 400


def test_same_tag_name_allowed_for_different_users(client, register_and_login):
    alice_headers = register_and_login(username="alice", email="alice@example.com")
    bob_headers = register_and_login(username="bob", email="bob@example.com")

    response_alice = client.post("/tags", headers=alice_headers, json={"tag": "work"})
    response_bob = client.post("/tags", headers=bob_headers, json={"tag": "work"})

    assert response_alice.status_code == 200
    assert response_bob.status_code == 200


def test_get_tags_only_returns_own(client, register_and_login):
    alice_headers = register_and_login(username="alice", email="alice@example.com")
    bob_headers = register_and_login(username="bob", email="bob@example.com")

    client.post("/tags", headers=alice_headers, json={"tag": "alice-tag"})
    client.post("/tags", headers=bob_headers, json={"tag": "bob-tag"})

    response = client.get("/tags", headers=alice_headers)

    assert response.status_code == 200
    tag_names = [t["tag"] for t in response.json()]
    assert tag_names == ["alice-tag"]


def test_get_specific_tag_owned_by_other_user_returns_404(client, register_and_login):
    alice_headers = register_and_login(username="alice", email="alice@example.com")
    bob_headers = register_and_login(username="bob", email="bob@example.com")

    create_response = client.post("/tags", headers=alice_headers, json={"tag": "work"})
    tag_id = create_response.json()["tag_id"]

    response = client.get(f"/tags/{tag_id}", headers=bob_headers)

    assert response.status_code == 404


def test_update_tag_owned_by_other_user_returns_404(client, register_and_login):
    alice_headers = register_and_login(username="alice", email="alice@example.com")
    bob_headers = register_and_login(username="bob", email="bob@example.com")

    create_response = client.post("/tags", headers=alice_headers, json={"tag": "work"})
    tag_id = create_response.json()["tag_id"]

    response = client.patch(
        f"/tags/{tag_id}",
        headers=bob_headers,
        json={"tag": "hijacked"},
    )

    assert response.status_code == 404


def test_delete_tag_owned_by_other_user_returns_404(client, register_and_login):
    alice_headers = register_and_login(username="alice", email="alice@example.com")
    bob_headers = register_and_login(username="bob", email="bob@example.com")

    create_response = client.post("/tags", headers=alice_headers, json={"tag": "work"})
    tag_id = create_response.json()["tag_id"]

    response = client.delete(f"/tags/{tag_id}", headers=bob_headers)

    assert response.status_code == 404


def test_update_tag_success(client, register_and_login):
    headers = register_and_login()
    create_response = client.post("/tags", headers=headers, json={"tag": "work"})
    tag_id = create_response.json()["tag_id"]

    response = client.patch(f"/tags/{tag_id}", headers=headers, json={"tag": "personal"})

    assert response.status_code == 200
    assert response.json()["tag"] == "personal"


def test_delete_tag_success(client, register_and_login):
    headers = register_and_login()
    create_response = client.post("/tags", headers=headers, json={"tag": "work"})
    tag_id = create_response.json()["tag_id"]

    delete_response = client.delete(f"/tags/{tag_id}", headers=headers)
    assert delete_response.status_code == 204

    get_response = client.get(f"/tags/{tag_id}", headers=headers)
    assert get_response.status_code == 404


def test_get_specific_tag_includes_linked_bookmarks(client, register_and_login):
    headers = register_and_login()
    tag_response = client.post("/tags", headers=headers, json={"tag": "work"})
    tag_id = tag_response.json()["tag_id"]
    bookmark_response = client.post(
        "/bookmarks",
        headers=headers,
        json={"url": "https://example.com", "title": "Example"},
    )
    bookmark_id = bookmark_response.json()["bookmark_id"]
    client.post(f"/bookmarks/{bookmark_id}/tags/{tag_id}", headers=headers)

    response = client.get(f"/tags/{tag_id}", headers=headers)

    assert response.status_code == 200
    bookmark_ids = [b["bookmark_id"] for b in response.json()["bookmarks"]]
    assert bookmark_ids == [bookmark_id]

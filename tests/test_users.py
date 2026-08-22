def test_register_success(client):
    response = client.post(
        "/users/register",
        json={
            "username": "alice",
            "email": "alice@example.com",
            "password": "password123",
        },
    )

    assert response.status_code == 200

    body = response.json()
    assert body["username"] == "alice"
    assert body["email"] == "alice@example.com"
    assert "user_id" in body


def test_register_duplicate_email(client):
    client.post(
        "/users/register",
        json={
            "username": "alice",
            "email": "alice@example.com",
            "password": "password123",
        },
    )

    response = client.post(
        "/users/register",
        json={
            "username": "someone_else",
            "email": "alice@example.com",
            "password": "password123",
        },
    )

    assert response.status_code == 400


def test_register_duplicate_username(client):
    client.post(
        "/users/register",
        json={
            "username": "alice",
            "email": "alice@example.com",
            "password": "password123",
        },
    )

    response = client.post(
        "/users/register",
        json={
            "username": "alice",
            "email": "someone_else@example.com",
            "password": "password123",
        },
    )

    assert response.status_code == 400


def test_login_success(client):
    client.post(
        "/users/register",
        json={
            "username": "alice",
            "email": "alice@example.com",
            "password": "password123",
        },
    )

    response = client.post(
        "/users/login",
        json={
            "email": "alice@example.com",
            "password": "password123",
        },
    )

    assert response.status_code == 200

    body = response.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"


def test_login_wrong_password(client):
    client.post(
        "/users/register",
        json={
            "username": "alice",
            "email": "alice@example.com",
            "password": "password123",
        },
    )

    response = client.post(
        "/users/login",
        json={
            "email": "alice@example.com",
            "password": "wrongpassword",
        },
    )

    assert response.status_code == 401


def test_get_profile_success(client, register_and_login):
    headers = register_and_login()

    response = client.get("/users/profile", headers=headers)

    assert response.status_code == 200

    body = response.json()
    assert body["username"] == "alice"
    assert body["email"] == "alice@example.com"


def test_get_profile_no_token(client):
    response = client.get("/users/profile")

    assert response.status_code in (401, 403)


def test_update_profile_success(client, register_and_login):
    headers = register_and_login()

    response = client.patch(
        "/users/profile",
        headers=headers,
        json={"username": "alice_updated"},
    )

    assert response.status_code == 200

    body = response.json()
    assert body["username"] == "alice_updated"
    assert body["email"] == "alice@example.com"
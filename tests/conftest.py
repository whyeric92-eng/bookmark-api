import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.main import app
from app.db.engine import engine
from app.db.session import get_session


@pytest.fixture
def session():
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection, join_transaction_mode="create_savepoint")

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(session):
    def override_get_session():
        yield session

    app.dependency_overrides[get_session] = override_get_session

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()


@pytest.fixture
def register_and_login(client):
    def _register_and_login(username="alice", email="alice@example.com", password="password123"):
        client.post(
            "/users/register",
            json={"username": username, "email": email, "password": password},
        )
        login_response = client.post(
            "/users/login",
            json={"email": email, "password": password},
        )
        token = login_response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}

    return _register_and_login

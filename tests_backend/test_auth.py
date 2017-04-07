import auth
import pytest

# TODO: this is probably a bad design?
@pytest.fixture
def session():
    return auth.Session()

def test_wrong_password(session):
    '''Check that we can't log in with wrong credentials'''
    assert not session.login("promis", "sunfish"), "Wrong credentials work"

def test_unauth_access(session):
    '''Check that we can't access the API without authenticating first'''
    assert 400 <= session.get("http://localhost:8081/en/api/").status_code < 500, "Unauthenticated access possible"

@pytest.fixture
def superuser(session):
    session.login("promis", "swordfish")
    return session

# TODO: replace with test data instead
def test_potential_data(superuser):
    '''Check that Potential is correctly inserted'''
    json_data = superuser.get("http://localhost:8081/en/api/projects/1").json()
    assert "name" in json_data, "Invalid JSON recieved"
    assert json_data["name"] == "Potential", "Project #1 is not named Potential"

# 3 users with different access levels
@pytest.fixture
def john(session):
    session.login("john","test")
    return session

@pytest.fixture
def melanie(session):
    session.login("melanie","test")
    return session

@pytest.fixture
def connie(session):
    session.login("connie","test")
    return session

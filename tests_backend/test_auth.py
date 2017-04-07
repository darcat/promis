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
    assert 400 <= session.get("http://localhost:8081/api").status_code < 500, "Unauthenticated access possible"

import auth
import pytest

# TODO: this is probably a bad design?
@pytest.fixture
def session():
    return auth.Session()

def test_wrong_password(session):
    '''Check that we can't log in with wrong credentials'''
    assert not session.login("promis", "sunfish"), "Wrong credentials work"

# TODO: this behaviour may and will change!
def test_unauth_access(session):
    '''Check that we can't access the API without authenticating first'''
    assert 400 <= session.get("/en/api/").status_code < 500, "Unauthenticated access possible"

@pytest.fixture
def superuser(session):
    session.login("promis", "swordfish")
    return session

# TODO: replace with test data instead
def test_potential_data(superuser):
    '''Check that Potential is correctly inserted'''
    r = superuser.get("/en/api/projects/1")
    assert r.status_code == 200, "Invalid status code"
    json_data = r.json()
    assert "name" in json_data, "Invalid JSON recieved"
    assert json_data["name"] == "Potential", "Project #1 is not named Potential"

# 3 users with different access levels
@pytest.fixture
def john(session):
    session.login("john", "test")
    return session

@pytest.fixture
def melanie(session):
    session.login("melanie", "test")
    return session

@pytest.fixture
def connie(session):
    session.login("connie", "test")
    return session

# TODO: make it a parametrised fixture?
def count_listing(sess):
    r = sess.get("/en/api/sessions")
    assert r.status_code == 200, "Invalid status code"
    json_data = r.json()
    assert "count" in json_data, "Malformed JSON received"
    return json_data["count"]

# TODO: discuss what does default group mean exactly except hiding the sessions
# TODO: placeholder checks, may break with data changes
@pytest.mark.xfail
def test_default_listing(john):
    '''Check that a groupless user can only see old data'''
    assert count_listing(john) == 24, "Session count mismatch"

@pytest.mark.xfail
def test_level2_listing(melanie):
    '''Check that a level2 user can see both old and new data'''
    assert count_listing(melanie) == 219, "Session count mismatch"

@pytest.mark.xfail
def test_level1_listing(connie):
    '''Check that a level2 user can see both old and new data'''
    assert count_listing(connie) == 219, "Session count mismatch"

# TODO: generalise the code
def test_level2_access(melanie):
    '''Check that a level2 user can see only parameter fields'''
    r = melanie.get("/en/api/download/1")
    assert r.status_code == 200, "Invalid status code"
    json_data = r.json()
    assert "chn_doc" not in json_data, "Can see channels"
    assert "par_doc" in json_data, "Can't see parameters"

def test_level1_access(connie):
    '''Check that a level1 user can see all fields'''
    r = connie.get("/en/api/download/1")
    assert r.status_code == 200, "Invalid status code"
    json_data = r.json()
    assert "chn_doc" in json_data, "Can't see channels"
    assert "par_doc" in json_data, "Can't see parameters"
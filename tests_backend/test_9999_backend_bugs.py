import auth
import pytest

# TODO: make these shared with test_1
@pytest.fixture
def session():
    return auth.Session()

@pytest.fixture
def superuser(session):
    session.login("promis", "swordfish")
    return session

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

def test_per_project_sessions(connie):
    '''IonosatMicro/promis-backend#74'''
    for i in [ 1, 42000, 42001 ]:
        r = connie.get("/en/api/sessions?project=" + str(i))
        assert r.status_code == 200, "Invalid status code"
        json_data = r.json()
        assert all(res["satellite"] == i for res in json_data["results"]), "Satellite entries in session mixup" 

def test_super_user_access_level1(superuser):
    '''IonosatMicro/promis-backend#75, IonosatMicro/promis-backend#78'''
    r = superuser.get("/en/api/download/1")
    assert r.status_code == 200, "Invalid status code"
    json_data = r.json()
    assert "chn_doc" in json_data, "Can't see channels"
    assert "par_doc" in json_data, "Can't see parameters"
    # TODO: this doesn't perfectly verify the described behaviour, but I assume the root cause is the same
    
def test_unauth_session_401_data_url(session):
    '''IonosatMicro/promis-backend#76'''
    r = session.get("/en/api/download/1")
    assert r.status_code == 401, "Expecting 401 Please Authenticate"
    
def test_unauth_session_401_200_general_url(session):
    '''IonosatMicro/promis-backend#76, IonosatMicro/promis-backend#77'''
    r = session.get("/en/api") 
    assert r.status_code in [ 401, 200 ], "Expecting 401 Please Authenticate or 200 OK"
    
def test_per_project_sessions(session):
    '''IonosatMicro/promis-backend#77'''
    r = session.get("/en/api/sessions")
    assert r.status_code == 200, "Invalid status code"
    json_data = r.json()
    assert json_data["count"] > 0, "Can't see any session"

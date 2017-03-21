import pytest
import subprocess

@pytest.fixture
def data_fetch():
    return subprocess.run("./backend_command check_data_updates > /tmp/check_data_updates.log", shell=True)
    # TODO: return something more meaningful?

def test_data_fetch(data_fetch):
    assert data_fetch.returncode == 0

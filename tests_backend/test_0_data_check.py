import pytest
import subprocess
import sys
import os

@pytest.fixture
def data_fetch():
    cmd = "./backend_command check_data_updates > /tmp/check_data_updates.log"

    # Call semantics changed in 3.5
    if sys.version_info < (3,5):
        return subprocess.call(cmd, shell=True)
    else:
        return subprocess.run(cmd, shell=True).returncode
    # TODO: return something more meaningful?

@pytest.mark.skipif("CI" not in os.environ,
                    reason="Skipping data fetch for non CI-builds")
def test_data_fetch(data_fetch):
    assert data_fetch == 0

import os
import sys
import pytest
from fastapi.testclient import TestClient

# Add backend dir to sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app

@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client

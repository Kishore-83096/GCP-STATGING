import pytest

from app import app


@pytest.fixture
def client():
	app.config['TESTING'] = True
	with app.test_client() as client:
		yield client

def test_welcome(client):
	response = client.get('/api/welcome')
	assert response.status_code == 200
	assert response.json == {"message": "Welcome to the Zylo application!"}

def test_health(client):
	response = client.get('/api/health')
	assert response.status_code == 200
	assert response.json == {"status": "ok", "service": "zylo-backend"}

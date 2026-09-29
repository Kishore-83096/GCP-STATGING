import pytest

from app import app, database_uri, db


@pytest.fixture
def client():
	app.config['TESTING'] = True
	app.config['JWT_SECRET_KEY'] = 'test-secret-key-at-least-32-bytes-long'
	with app.app_context():
		db.drop_all()
		db.create_all()
	with app.test_client() as client:
		yield client
	with app.app_context():
		db.session.remove()
		db.drop_all()

def test_welcome(client):
	response = client.get('/api/welcome')
	assert response.status_code == 200
	assert response.json == {"message": "Welcome to the Zylo application!"}

def test_health(client):
	response = client.get('/api/health')
	assert response.status_code == 200
	assert response.json == {"status": "ok", "service": "zylo-backend"}
	assert response.headers['Access-Control-Allow-Origin'] == 'http://localhost:3000'


def test_postgres_url_uses_psycopg_three(monkeypatch):
	monkeypatch.setenv('DATABASE_URL', 'postgresql://user:pass@localhost/database')
	assert database_uri() == 'postgresql+psycopg://user:pass@localhost/database'


def register(client, username='zylo123', password='secret1!'):
	return client.post('/api/register', json={
		'username': username,
		'password': password,
		'confirm_password': password,
	})


def test_registration_persists_hashed_password_and_creates_unique_account(client):
	response = register(client)
	assert response.status_code == 201
	user = response.json['user']
	assert user['username'] == 'zylo123'
	assert user['email'] == 'zylo123@zylo.com'
	assert len(user['account_number']) == 10
	assert user['account_number'].isdigit()
	assert 'access_token' not in response.json

	from app import User
	stored_user = User.query.first()
	assert stored_user.password_hash != 'secret1!'
	assert 'secret1!' not in stored_user.password_hash


@pytest.mark.parametrize('username', ['Upper', 'has-dash', 'has space', 'with.dot'])
def test_registration_rejects_invalid_username(client, username):
	response = register(client, username=username)
	assert response.status_code == 400


@pytest.mark.parametrize('password', ['short!', 'longpassword1!', 'n0special', 'nospecial'])
def test_registration_rejects_invalid_password(client, password):
	response = register(client, password=password)
	assert response.status_code == 400


def test_registration_requires_matching_confirmation(client):
	response = client.post('/api/register', json={
		'username': 'zylo123',
		'password': 'secret1!',
		'confirm_password': 'different1!',
	})
	assert response.status_code == 400


def test_login_accepts_username_email_or_account_number_and_returns_profile(client):
	user = register(client).json['user']
	for identifier in (user['username'], user['email'], user['account_number']):
		login = client.post('/api/login', json={'identifier': identifier, 'password': 'secret1!'})
		assert login.status_code == 200
		assert login.json['user']['email'] == user['email']
		profile = client.get('/api/profile', headers={
			'Authorization': f"Bearer {login.json['access_token']}"
		})
		assert profile.status_code == 200
		assert profile.json['user']['account_number'] == user['account_number']
		assert 'password' not in profile.json['user']


def test_login_rejects_wrong_password_and_duplicate_registration(client):
	register(client)
	assert client.post('/api/login', json={
		'identifier': 'zylo123', 'password': 'wrong1!',
	}).status_code == 401
	assert register(client).status_code == 409

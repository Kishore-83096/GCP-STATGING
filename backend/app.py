import os
import re
import secrets
from datetime import timedelta

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    get_jwt_identity,
    jwt_required,
)
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError
from werkzeug.security import check_password_hash, generate_password_hash

load_dotenv()


def database_uri():
    uri = os.getenv('DATABASE_URL', 'sqlite:///zylo.db')
    if uri.startswith('postgresql://'):
        return uri.replace('postgresql://', 'postgresql+psycopg://', 1)
    return uri


app = Flask(__name__)
CORS(app, resources={r'/api/*': {'origins': os.getenv('FRONTEND_URL', 'http://localhost:3000')}})

app.config['SQLALCHEMY_DATABASE_URI'] = database_uri()
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {'pool_pre_ping': True}
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY') or secrets.token_urlsafe(32)
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=30)
db = SQLAlchemy(app)
jwt = JWTManager(app)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False, index=True)
    email = db.Column(db.String(80), unique=True, nullable=False, index=True)
    account_number = db.Column(db.String(10), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())


def public_user(user):
    return {
        'username': user.username,
        'email': user.email,
        'account_number': user.account_number,
        'created_at': user.created_at.isoformat() if user.created_at else None,
    }


def valid_password(password):
    return (
        isinstance(password, str)
        and 6 <= len(password) <= 12
        and re.search(r'\d', password)
        and re.search(r'[^A-Za-z0-9\s]', password)
    )

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'zylo-backend'}), 200

@app.route('/api/welcome', methods=['GET'])
def welcome():
    return jsonify({'message': 'Welcome to the Zylo application!'}), 200

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    username = data.get('username', '')
    password = data.get('password', '')
    confirm_password = data.get('confirm_password', '')

    if not isinstance(username, str) or not re.fullmatch(r'[a-z0-9]{1,64}', username):
        return jsonify({'error': 'Username must contain only lowercase letters and numbers.'}), 400
    if not valid_password(password):
        return jsonify({'error': 'Password must be 6-12 characters and include a number and a special character.'}), 400
    if password != confirm_password:
        return jsonify({'error': 'Passwords do not match.'}), 400

    email = f'{username}@zylo.com'
    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({'error': 'That username is already registered.'}), 409

    for _ in range(5):
        account_number = str(secrets.randbelow(9_000_000_000) + 1_000_000_000)
        user = User(
            username=username,
            email=email,
            account_number=account_number,
            password_hash=generate_password_hash(password),
        )
        db.session.add(user)
        try:
            db.session.commit()
            return jsonify({
                'message': 'Registration successful. Please log in.',
                'user': public_user(user),
            }), 201
        except IntegrityError:
            db.session.rollback()
            if User.query.filter((User.username == username) | (User.email == email)).first():
                return jsonify({'error': 'That username is already registered.'}), 409

    return jsonify({'error': 'Could not create a unique account number. Please try again.'}), 503

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    identifier = data.get('identifier', '')
    password = data.get('password', '')

    if not isinstance(identifier, str) or not identifier.strip() or not isinstance(password, str) or not password:
        return jsonify({'error': 'Login identifier and password are required.'}), 400

    identifier = identifier.strip().lower()
    user = User.query.filter(
        (User.username == identifier)
        | (User.email == identifier)
        | (User.account_number == identifier)
    ).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'error': 'Invalid login identifier or password.'}), 401

    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        'message': 'Login successful.',
        'access_token': access_token,
        'user': public_user(user),
    }), 200


@app.route('/api/profile', methods=['GET'])
@jwt_required()
def profile():
    user = db.session.get(User, int(get_jwt_identity()))
    if not user:
        return jsonify({'error': 'User account not found.'}), 404
    return jsonify({'user': public_user(user), 'status': 'Authenticated'}), 200


def initialize_database():
    with app.app_context():
        db.create_all()

if __name__ == '__main__':
    initialize_database()
    app.run(host=os.getenv('HOST', '0.0.0.0'), port=int(os.getenv('PORT', '5000')))
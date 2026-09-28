import os

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    get_jwt_identity,
    jwt_required,
)
from werkzeug.security import check_password_hash, generate_password_hash

app = Flask(__name__)
CORS(app)

# Configure JWT Secret Key
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'super-secret-key-change-in-prod')
jwt = JWTManager(app)

# In-memory user database (Replace with ORM/DB like SQLAlchemy in production)
USERS = {}

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'zylo-backend'}), 200

@app.route('/api/welcome', methods=['GET'])
def welcome():
    return jsonify({'message': 'Welcome to the Zylo application!'}), 200

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()

    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400

    if email in USERS:
        return jsonify({'error': 'User already exists.'}), 400

    # Hash the password for security
    hashed_password = generate_password_hash(password)
    USERS[email] = {'password': hashed_password}

    # Generate JWT token upon registration
    access_token = create_access_token(identity=email)

    return jsonify({
        'message': 'Registration successful!',
        'access_token': access_token,
        'user': {'email': email}
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()

    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400

    user = USERS.get(email)
    if not user or not check_password_hash(user['password'], password):
        return jsonify({'error': 'Invalid email or password.'}), 401

    # Generate JWT access token
    access_token = create_access_token(identity=email)

    return jsonify({
        'message': 'Login successful!',
        'access_token': access_token,
        'user': {'email': email}
    }), 200

# Example JWT Protected REST Endpoint
@app.route('/api/profile', methods=['GET'])
@jwt_required()
def profile():
    current_user_email = get_jwt_identity()
    return jsonify({
        'email': current_user_email,
        'status': 'Authenticated',
        'message': f'Welcome back, {current_user_email}!'
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
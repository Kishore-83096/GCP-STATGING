import os

from flask import Flask, jsonify

app = Flask(__name__)

@app.after_request
def add_cors_headers(response):
	response.headers['Access-Control-Allow-Origin'] = os.environ.get(
		'FRONTEND_URL', 'http://localhost:3000'
	)
	return response

@app.route('/api/welcome', methods=['GET'])
def welcome():
	return jsonify({"message": "Welcome to the Zylo application!"})

@app.route('/api/health', methods=['GET'])
def health():
	return jsonify({"status": "ok", "service": "zylo-backend"})

if __name__ == '__main__':
	app.run(
		host=os.environ.get('HOST', '0.0.0.0'),
		port=int(os.environ.get('PORT', '5000')),
	)

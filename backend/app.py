from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/welcome', methods=['GET'])
def welcome():
	return jsonify({"message": "Welcome to the Monorepo App!"})

if __name__ == '__main__':
	app.run(host='0.0.0.0', port=5000)

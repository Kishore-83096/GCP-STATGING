const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

async function getJson(path) {
	const response = await fetch(`${BACKEND_URL}${path}`);
	if (!response.ok) {
		throw new Error(`Backend request failed with status ${response.status}`);
	}
	return response.json();
}

export function checkBackendHealth() {
	return getJson('/api/health');
}

export function getWelcomeMessage() {
	return getJson('/api/welcome');
}
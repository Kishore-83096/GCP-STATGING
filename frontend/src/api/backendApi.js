const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

async function getJson(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);
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

export function fetchHealth() {
  return checkBackendHealth();
}

export async function registerUser(email, password) {
  const response = await fetch(`${API_BASE_URL}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Registration failed');
  }
  if (data.access_token) {
    localStorage.setItem('token', data.access_token);
  }
  return data;
}

export async function loginUser(email, password) {
  const response = await fetch(`${API_BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }
  if (data.access_token) {
    localStorage.setItem('token', data.access_token);
  }
  return data;
}

// Fetch protected user profile using JWT token
export async function fetchUserProfile() {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No auth token found');

  const response = await fetch(`${API_BASE_URL}/api/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.msg || data.error || 'Failed to fetch profile');
  }
  return data;
}

export function logoutUser() {
  localStorage.removeItem('token');
}
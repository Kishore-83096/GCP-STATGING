import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import App from './App';

beforeEach(() => {
	window.history.replaceState({}, '', '/');
	global.fetch = jest.fn((url) => Promise.resolve({
		ok: true,
		json: () => Promise.resolve(url.endsWith('/api/health')
			? { status: 'ok' }
			: { message: 'Welcome to the Zylo application!' }),
	}));
});

test('renders the Zylo landing page and checks both backend APIs', async () => {
	render(<App />);
	expect(screen.getByRole('link', { name: 'Zylo home' })).toBeInTheDocument();
	expect(screen.getByRole('heading', { name: /everything is in its place/i })).toBeInTheDocument();
	expect(screen.getByText('React active')).toBeInTheDocument();
	await waitFor(() => expect(screen.getAllByText('Connection successful')).toHaveLength(2));
	expect(screen.getByText('Welcome to the Zylo application!')).toBeInTheDocument();
	expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/health');
	expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/welcome');
});

test('rechecks backend status when requested', async () => {
	render(<App />);
	await waitFor(() => expect(screen.getAllByText('Connection successful')).toHaveLength(2));
	fireEvent.click(screen.getByRole('button', { name: 'Check again' }));
	await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(4));
});

test('opens separate login and registration pages from the landing header', () => {
	render(<App />);

	fireEvent.click(screen.getByRole('link', { name: 'Log in' }));
	expect(screen.getByRole('heading', { name: 'Log in' })).toBeInTheDocument();
	expect(screen.getByLabelText('Email address')).toBeInTheDocument();

	fireEvent.click(screen.getByRole('link', { name: 'Create an account' }));
	expect(screen.getByRole('heading', { name: 'Create account' })).toBeInTheDocument();
	expect(within(screen.getByRole('navigation', { name: 'Account' }))
		.getByRole('link', { name: 'Log in' })).toBeInTheDocument();
});

test('shows a failed backend connection when the health request fails', async () => {
	global.fetch = jest.fn((url) => url.endsWith('/api/health')
		? Promise.reject(new Error('Backend unavailable'))
		: Promise.resolve({
			ok: true,
			json: () => Promise.resolve({ message: 'Welcome to the Zylo application!' }),
		}));
	render(<App />);

	await waitFor(() => expect(screen.getAllByText('Connection failed')).toHaveLength(2));
	expect(screen.getByText('Connection failed', { selector: '.header-status' })).toHaveClass('status-offline');
	expect(screen.getByText('Connection failed', { selector: '.service-badge' })).toHaveClass('is-offline');
});

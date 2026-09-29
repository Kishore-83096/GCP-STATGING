import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import App from './App';

beforeEach(() => {
	window.history.replaceState({}, '', '/');
	localStorage.clear();
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
	expect(screen.getByLabelText('Log in with')).toBeInTheDocument();

	fireEvent.click(screen.getByRole('link', { name: 'Create an account' }));
	expect(screen.getByRole('heading', { name: 'Create account' })).toBeInTheDocument();
	expect(within(screen.getByRole('navigation', { name: 'Account' }))
		.getByRole('link', { name: 'Log in' })).toBeInTheDocument();
});

test('registers with a username and prefills selectable login identifiers', async () => {
	const registeredUser = {
		username: 'zylo123',
		email: 'zylo123@zylo.com',
		account_number: '1234567890',
		created_at: '2026-09-29T12:00:00',
	};
	global.fetch = jest.fn((url) => Promise.resolve({
		ok: true,
		json: () => Promise.resolve(url.endsWith('/api/register')
			? { user: registeredUser }
			: url.endsWith('/api/health')
				? { status: 'ok' }
				: { message: 'Welcome to the Zylo application!' }),
	}));
	render(<App />);

	fireEvent.click(screen.getByRole('link', { name: 'Register' }));
	fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'zylo123' } });
	fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret1!' } });
	fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'secret1!' } });
	fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

	await screen.findByRole('heading', { name: 'Log in' });
	expect(screen.getByLabelText('Username')).toHaveValue('zylo123');
	fireEvent.change(screen.getByLabelText('Log in with'), { target: { value: 'email' } });
	expect(screen.getByLabelText('Email address')).toHaveValue('zylo123@zylo.com');
	fireEvent.change(screen.getByLabelText('Log in with'), { target: { value: 'account_number' } });
	expect(screen.getByLabelText('Account number')).toHaveValue('1234567890');
});

test('successful login opens a dashboard with account details', async () => {
	const user = {
		username: 'zylo123',
		email: 'zylo123@zylo.com',
		account_number: '1234567890',
		created_at: '2026-09-29T12:00:00',
	};
	global.fetch = jest.fn((url) => Promise.resolve({
		ok: true,
		json: () => Promise.resolve(url.endsWith('/api/login')
			? { access_token: 'test-token', user }
			: url.endsWith('/api/health')
				? { status: 'ok' }
				: { message: 'Welcome to the Zylo application!' }),
	}));
	window.history.replaceState({}, '', '/login');
	render(<App />);
	fireEvent.change(screen.getByLabelText('Username'), { target: { value: user.username } });
	fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret1!' } });
	fireEvent.click(screen.getByRole('button', { name: 'Log in' }));

	expect(await screen.findByRole('heading', { name: 'Your account, in one place.' })).toBeInTheDocument();
	expect(screen.getByText(user.email)).toBeInTheDocument();
	expect(screen.getByText(user.account_number)).toBeInTheDocument();
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

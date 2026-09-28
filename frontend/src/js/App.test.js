import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

beforeEach(() => {
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
	await waitFor(() => expect(screen.getAllByText('Backend active')).toHaveLength(2));
	expect(screen.getByText('Welcome to the Zylo application!')).toBeInTheDocument();
	expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/health');
	expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/welcome');
});

test('rechecks backend status when requested', async () => {
	render(<App />);
	await waitFor(() => expect(screen.getAllByText('Backend active')).toHaveLength(2));
	fireEvent.click(screen.getByRole('button', { name: 'Check again' }));
	await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(4));
});

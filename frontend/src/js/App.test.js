import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
	global.fetch = jest.fn().mockResolvedValue({ ok: true });
});

test('renders the Zylo welcome storefront', () => {
	render(<App />);
	expect(screen.getByRole('link', { name: 'Zylo home' })).toBeInTheDocument();
	expect(screen.getByRole('heading', { name: /a little more/i })).toBeInTheDocument();
	expect(screen.getByRole('heading', { name: /good things, just in/i })).toBeInTheDocument();
});

test('adding a product updates the shopping bag count', () => {
	render(<App />);
	fireEvent.click(screen.getByRole('button', { name: /add cloud-knit sneaker to bag/i }));
	expect(screen.getByRole('button', { name: 'Shopping bag, 1 item' })).toBeInTheDocument();
});

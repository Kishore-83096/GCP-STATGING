import React, { useState } from 'react';
import { SiteFooter, SiteHeader } from './SiteChrome';

function AuthPage({ mode, onNavigate, onSubmit }) {
	const isRegister = mode === 'register';
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const alternatePath = isRegister ? '/login' : '/register';

	const handleSubmit = async (event) => {
		event.preventDefault();
		setError('');
		setIsSubmitting(true);
		try {
			await onSubmit(mode, email, password);
		} catch (requestError) {
			setError(requestError.message || 'Unable to complete your request.');
			setIsSubmitting(false);
		}
	};

	return (
		<div className="landing-page">
			<SiteHeader onNavigate={onNavigate} />
			<main className="landing-main auth-main">
				<section className="intro auth-intro" aria-labelledby="auth-page-title">
					<p className="eyebrow"><span className="eyebrow-mark" />{isRegister ? 'Get started' : 'Your account'}</p>
					<h1 id="auth-page-title">
						{isRegister ? <>Make room<br />for <span>what matters.</span></> : <>Welcome<br />back to <span>Zylo.</span></>}
					</h1>
					<p className="intro-copy">
						{isRegister
							? 'Create your account and bring everything into one clear view.'
							: 'Sign in to return to your Zylo account and pick up where you left off.'}
					</p>
					<div className="welcome-message auth-note">
						<span className="welcome-label">Secure access</span>
						<p>Your account is protected with token-based authentication.</p>
					</div>
				</section>

				<section className="service-panel auth-panel" aria-labelledby="auth-title">
					<div className="panel-heading">
						<div>
							<p className="panel-kicker">Account access <span>02 / 02</span></p>
							<h2 id="auth-title">{isRegister ? 'Create account' : 'Log in'}</h2>
						</div>
					</div>
					<form className="auth-form" onSubmit={handleSubmit}>
						<div className="auth-field">
							<label htmlFor="email">Email address</label>
							<input
								autoComplete="email"
								autoFocus
								id="email"
								name="email"
								required
								type="email"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								placeholder="you@example.com"
							/>
						</div>
						<div className="auth-field">
							<label htmlFor="password">Password</label>
							<input
								autoComplete={isRegister ? 'new-password' : 'current-password'}
								id="password"
								name="password"
								required
								type="password"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								placeholder="Enter your password"
							/>
						</div>
						{error && <p className="auth-feedback" role="alert">{error}</p>}
						<button className="auth-submit" type="submit" disabled={isSubmitting}>
							{isSubmitting ? 'Please wait...' : isRegister ? 'Create account' : 'Log in'}
						</button>
					</form>
					<p className="auth-switch">
						{isRegister ? 'Already have an account?' : 'New to Zylo?'}{' '}
						<a href={alternatePath} onClick={(event) => {
							event.preventDefault();
							onNavigate(alternatePath);
						}}>
							{isRegister ? 'Log in' : 'Create an account'}
						</a>
					</p>
				</section>
			</main>
			<SiteFooter />
		</div>
	);
}

export default AuthPage;
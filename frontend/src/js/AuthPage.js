import React, { useState } from 'react';
import { SiteFooter, SiteHeader } from './SiteChrome';

function AuthPage({ mode, onNavigate, onSubmit, prefillUser }) {
	const isRegister = mode === 'register';
	const [username, setUsername] = useState('');
	const [identifierType, setIdentifierType] = useState('username');
	const [identifier, setIdentifier] = useState(prefillUser?.username || '');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const alternatePath = isRegister ? '/login' : '/register';

	const handleSubmit = async (event) => {
		event.preventDefault();
		setError('');
		setIsSubmitting(true);
		try {
			await onSubmit(mode, isRegister
				? { username, password, confirmPassword }
				: { identifier, password });
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
						{isRegister ? (
							<div className="auth-field">
								<label htmlFor="username">Username</label>
								<div className="username-control">
									<input
										autoComplete="username"
										autoCapitalize="none"
										autoFocus
										id="username"
										maxLength={64}
										name="username"
										pattern="[a-z0-9]+"
										required
										spellCheck="false"
										type="text"
										value={username}
										onChange={(event) => setUsername(event.target.value)}
										placeholder="zylo123"
									/>
									<span>@zylo.com</span>
								</div>
							</div>
						) : (
							<>
								<div className="auth-field">
									<label htmlFor="identifier-type">Log in with</label>
									<select
										id="identifier-type"
										value={identifierType}
										onChange={(event) => {
											const nextType = event.target.value;
											setIdentifierType(nextType);
											setIdentifier(prefillUser?.[nextType] || '');
										}}
									>
										<option value="username">Username</option>
										<option value="email">Email address</option>
										<option value="account_number">Account number</option>
									</select>
								</div>
								<div className="auth-field">
									<label htmlFor="identifier">{identifierType === 'account_number' ? 'Account number' : identifierType === 'email' ? 'Email address' : 'Username'}</label>
									<input
										autoComplete="username"
										autoFocus
										id="identifier"
										name="identifier"
										required
										type="text"
										value={identifier}
										onChange={(event) => setIdentifier(event.target.value)}
										placeholder={identifierType === 'account_number' ? '10-digit account number' : identifierType === 'email' ? 'you@zylo.com' : 'Your username'}
									/>
								</div>
							</>
						)}
						<div className="auth-field">
							<label htmlFor="password">Password</label>
							<input
								autoComplete={isRegister ? 'new-password' : 'current-password'}
								id="password"
								name="password"
								minLength={isRegister ? 6 : undefined}
								maxLength={isRegister ? 12 : undefined}
								required
								type="password"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								placeholder="Enter your password"
							/>
							{isRegister && <span className="field-hint">6-12 characters, with a number and symbol</span>}
						</div>
						{isRegister && (
							<div className="auth-field">
								<label htmlFor="confirm-password">Confirm password</label>
								<input
									autoComplete="new-password"
									id="confirm-password"
									name="confirm-password"
									required
									type="password"
									value={confirmPassword}
									onChange={(event) => setConfirmPassword(event.target.value)}
									placeholder="Enter the password again"
								/>
							</div>
						)}
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
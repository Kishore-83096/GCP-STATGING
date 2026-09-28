import React from 'react';

function followRoute(event, path, onNavigate) {
	if (!onNavigate || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
	event.preventDefault();
	onNavigate(path);
}

export function SiteHeader({ backendStatus, currentUser, onLogout, onNavigate, statusLabel }) {
	return (
		<header className="landing-header">
			<a
				className="brand"
				href="/"
				aria-label="Zylo home"
				onClick={(event) => followRoute(event, '/', onNavigate)}
			>
				zylo<span>.</span>
			</a>
			<div className="header-actions">
				{statusLabel && (
					<div className={`header-status status-${backendStatus}`} aria-live="polite">
						<span className="status-indicator" />
						{statusLabel}
					</div>
				)}
				{currentUser ? (
					<div className="account-nav">
						<span className="account-email">{currentUser}</span>
						<button className="account-link" type="button" onClick={onLogout}>Log out</button>
					</div>
				) : (
					<nav className="account-nav" aria-label="Account">
						<a
							className="account-link"
							href="/login"
							onClick={(event) => followRoute(event, '/login', onNavigate)}
						>
							Log in
						</a>
						<a
							className="account-link account-link-primary"
							href="/register"
							onClick={(event) => followRoute(event, '/register', onNavigate)}
						>
							Register
						</a>
					</nav>
				)}
			</div>
		</header>
	);
}

export function SiteFooter() {
	return (
		<footer className="landing-footer">
			<span>ZYLO <span className="footer-divider">/</span> APPLICATION STATUS</span>
			<span>Frontend: React <span className="footer-divider">·</span> Backend: Flask</span>
		</footer>
	);
}
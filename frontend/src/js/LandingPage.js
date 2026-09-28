import React, { useEffect, useState } from 'react';
import { checkBackendHealth, getWelcomeMessage } from '../api/backendApi';
import { SiteFooter, SiteHeader } from './SiteChrome';
import '../css/LandingPage.css';

function LandingPage({ currentUser, onLogout, onNavigate }) {
	const [backendStatus, setBackendStatus] = useState('checking');
	const [welcomeMessage, setWelcomeMessage] = useState('Connecting to the Zylo backend...');
	const [lastChecked, setLastChecked] = useState(null);
	const [refreshKey, setRefreshKey] = useState(0);

	useEffect(() => {
		let isCurrent = true;
		setBackendStatus('checking');

		Promise.allSettled([checkBackendHealth(), getWelcomeMessage()]).then(([health, welcome]) => {
			if (!isCurrent) return;

			setBackendStatus(
				health.status === 'fulfilled' && health.value.status === 'ok' ? 'online' : 'offline'
			);
			setWelcomeMessage(
				welcome.status === 'fulfilled'
					? welcome.value.message
					: 'The welcome message is unavailable while the backend is offline.'
			);
			setLastChecked(new Date());
		});

		return () => {
			isCurrent = false;
		};
	}, [refreshKey]);

	const isChecking = backendStatus === 'checking';
	const statusLabel = isChecking ? 'Checking connection' : backendStatus === 'online' ? 'Connection successful' : 'Connection failed';

	return (
		<div className="landing-page">
			<SiteHeader
				backendStatus={backendStatus}
				currentUser={currentUser}
				onLogout={onLogout}
				onNavigate={onNavigate}
				statusLabel={statusLabel}
			/>

			<main className="landing-main" id="home">
				<section className="intro" aria-labelledby="page-title">
					<p className="eyebrow"><span className="eyebrow-mark" />Application overview</p>
					<h1 id="page-title">Everything is<br />in its <span>place.</span></h1>
					<p className="intro-copy">A clear view of Zylo, from the React interface to the service behind it.</p>
					<div className="welcome-message" aria-live="polite">
						<span className="welcome-label">A message from Zylo</span>
						<p>{welcomeMessage}</p>
					</div>
				</section>

				<section className="service-panel" aria-labelledby="service-title">
					<div className="panel-heading">
						<div>
							<p className="panel-kicker">Live diagnostics <span>01 / 02</span></p>
							<h2 id="service-title">Service status</h2>
						</div>
						<button
							className="refresh-button"
							type="button"
							disabled={isChecking}
							onClick={() => setRefreshKey((key) => key + 1)}
						>
							{isChecking ? 'Checking...' : 'Check again'}
						</button>
					</div>

					<div className="service-list">
						<article className="service-row">
							<span className="service-number">01</span>
							<div className="service-info">
								<h3>Frontend</h3>
								<p>React application</p>
							</div>
							<span className="service-badge is-online"><span />React active</span>
						</article>
						<article className="service-row">
							<span className="service-number">02</span>
							<div className="service-info">
								<h3>Backend</h3>
								<p>Flask API · /api/health</p>
							</div>
							<span className={`service-badge ${backendStatus === 'online' ? 'is-online' : backendStatus === 'offline' ? 'is-offline' : 'is-checking'}`}>
								<span />{statusLabel}
							</span>
						</article>
					</div>

					<div className="panel-footer">
						<span>{lastChecked ? `Last checked ${lastChecked.toLocaleTimeString()}` : 'Waiting for first check'}</span>
						<span className="api-label">HEALTH + WELCOME API</span>
					</div>
				</section>
			</main>

			<SiteFooter />
		</div>
	);
}

export default LandingPage;
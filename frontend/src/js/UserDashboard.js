import React from 'react';
import { SiteFooter, SiteHeader } from './SiteChrome';

function UserDashboard({ user, onLogout, onNavigate }) {
	return (
		<div className="landing-page">
			<SiteHeader currentUser={user} onLogout={onLogout} onNavigate={onNavigate} />
			<main className="landing-main dashboard-main">
				<section className="intro" aria-labelledby="dashboard-title">
					<p className="eyebrow"><span className="eyebrow-mark" />Account overview</p>
					<h1 id="dashboard-title">Your account,<br />in <span>one place.</span></h1>
					<p className="intro-copy">Your Zylo registration details and account identifiers.</p>
					<div className="welcome-message">
						<span className="welcome-label">Account status</span>
						<p>Authenticated and active</p>
					</div>
				</section>

				<section className="service-panel profile-panel" aria-labelledby="profile-title">
					<div className="panel-heading">
						<div>
							<p className="panel-kicker">Personal details <span>01 / 01</span></p>
							<h2 id="profile-title">Your profile</h2>
						</div>
					</div>
					<dl className="profile-list">
						<div className="profile-row">
							<dt>Username</dt>
							<dd>{user.username}</dd>
						</div>
						<div className="profile-row">
							<dt>Email</dt>
							<dd>{user.email}</dd>
						</div>
						<div className="profile-row">
							<dt>Account number</dt>
							<dd>{user.account_number}</dd>
						</div>
						<div className="profile-row">
							<dt>Member since</dt>
							<dd>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Today'}</dd>
						</div>
					</dl>
				</section>
			</main>
			<SiteFooter />
		</div>
	);
}

export default UserDashboard;
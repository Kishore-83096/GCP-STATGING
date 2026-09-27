import React, { useEffect, useState } from 'react';

function App() {
	const [message, setMessage] = useState('Loading...');

	useEffect(() => {
		fetch('/api/welcome')
			.then((res) => res.json())
			.then((data) => setMessage(data.message))
			.catch(() => setMessage('Welcome to the Frontend!'));
	}, []);

	return (
		<div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
			<h1>{message}</h1>
			<p>Monorepo setup with Flask & React.</p>
		</div>
	);
}

export default App;

import React, { useEffect, useState } from 'react';
import { loginUser, registerUser, fetchUserProfile, logoutUser } from '../api/backendApi';
import AuthPage from './AuthPage';
import LandingPage from './LandingPage';

function getCurrentPath() {
  return window.location.pathname.replace(/\/+$/, '') || '/';
}

function App() {
  const [path, setPath] = useState(getCurrentPath);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      fetchUserProfile()
        .then((profile) => setCurrentUser(profile.email))
        .catch(() => {
          logoutUser();
          setCurrentUser(null);
        });
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => setPath(getCurrentPath());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (nextPath) => {
    window.history.pushState({}, '', nextPath);
    setPath(nextPath);
  };

  const handleAuth = async (mode, email, password) => {
    const result = mode === 'register'
      ? await registerUser(email, password)
      : await loginUser(email, password);
    setCurrentUser(result.user.email);
    navigate('/');
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    navigate('/');
  };

  if (path === '/login' || path === '/register') {
    return (
      <AuthPage
        mode={path.slice(1)}
        onNavigate={navigate}
        onSubmit={handleAuth}
      />
    );
  }

  return (
    <LandingPage
      currentUser={currentUser}
      onLogout={handleLogout}
      onNavigate={navigate}
    />
  );
}

export default App;
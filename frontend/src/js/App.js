import React, { useEffect, useState } from 'react';
import { loginUser, registerUser, fetchUserProfile, logoutUser } from '../api/backendApi';
import AuthPage from './AuthPage';
import LandingPage from './LandingPage';
import UserDashboard from './UserDashboard';

function getCurrentPath() {
  return window.location.pathname.replace(/\/+$/, '') || '/';
}

function App() {
  const [path, setPath] = useState(getCurrentPath);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginPrefill, setLoginPrefill] = useState(null);
  const [isRestoring, setIsRestoring] = useState(Boolean(localStorage.getItem('token')));

  useEffect(() => {
    if (localStorage.getItem('token')) {
      fetchUserProfile()
        .then(setCurrentUser)
        .catch(() => {
          logoutUser();
          setCurrentUser(null);
        })
        .finally(() => setIsRestoring(false));
    } else {
      setIsRestoring(false);
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

  useEffect(() => {
    if (!isRestoring && path === '/dashboard' && !currentUser) navigate('/login');
  }, [currentUser, isRestoring, path]);

  const handleAuth = async (mode, credentials) => {
    if (mode === 'register') {
      const result = await registerUser(
        credentials.username,
        credentials.password,
        credentials.confirmPassword
      );
      setLoginPrefill(result.user);
      navigate('/login');
      return;
    }

    const result = await loginUser(credentials.identifier, credentials.password);
    setCurrentUser(result.user);
    setLoginPrefill(null);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    navigate('/');
  };

  if (path === '/login' || path === '/register') {
    return (
      <AuthPage
        key={path}
        mode={path.slice(1)}
        prefillUser={loginPrefill}
        onNavigate={navigate}
        onSubmit={handleAuth}
      />
    );
  }

  if (path === '/dashboard') {
    if (isRestoring || !currentUser) return null;
    return <UserDashboard user={currentUser} onLogout={handleLogout} onNavigate={navigate} />;
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
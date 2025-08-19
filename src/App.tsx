import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';

interface User {
  username: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('scraper_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('scraper_user');
      }
    }
  }, []);

  const handleLogin = async (credentials: { username: string; password: string }) => {
    setLoginLoading(true);
    setLoginError('');

    // Simulate API call with demo credentials
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (credentials.username === 'admin' && credentials.password === 'demo123') {
      const userData = { username: credentials.username };
      setUser(userData);
      localStorage.setItem('scraper_user', JSON.stringify(userData));
    } else {
      setLoginError('Invalid credentials. Please use demo login or check your username/password.');
    }

    setLoginLoading(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('scraper_user');
  };

  return (
    <ErrorBoundary>
      {!user ? (
        <LoginPage 
          onLogin={handleLogin}
          isLoading={loginLoading}
          error={loginError}
        />
      ) : (
        <Dashboard onLogout={handleLogout} />
      )}
    </ErrorBoundary>
  );
}

export default App;
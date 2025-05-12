import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Upload from './components/Upload';
import Download from './components/Download';
import ConnectivityTest from './components/ConnectivityTest';
import apiService from './services/api';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkLoginStatus = () => {
      const isUserLoggedIn = apiService.auth.isLoggedIn();
      setIsLoggedIn(isUserLoggedIn);
      setLoading(false);
    };

    checkLoginStatus();
  }, []);

  // Handle login
  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate('/dashboard');
  };

  // Handle logout
  const handleLogout = () => {
    apiService.auth.logout();
    setIsLoggedIn(false);
    navigate('/login');
  };

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return <div>Chargement...</div>;
    }
    
    if (!isLoggedIn) {
      return <Navigate to="/login" />;
    }
    
    return children;
  };

  return (
    <>
      {isLoggedIn && <Navbar onLogout={handleLogout} />}
      
      <Routes>
        <Route 
          path="/login" 
          element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/upload" 
          element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          } 
        />        <Route 
          path="/download" 
          element={
            <ProtectedRoute>
              <Download />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/connectivity-test" 
          element={
            <ProtectedRoute>
              <ConnectivityTest />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="*" 
          element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} />} 
        />
      </Routes>
    </>
  );
}

export default App;
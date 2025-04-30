import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'

// Components
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Upload from './components/Upload'
import Download from './components/Download'
import Navbar from './components/Navbar'

// Services
import apiService from './services/api'

// Theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    // Check if user is already logged in on app load
    useEffect(() => {
        const checkAuthStatus = () => {
            const isLoggedIn = apiService.auth.isLoggedIn();
            setIsAuthenticated(isLoggedIn);
            setIsLoading(false);
        };
        
        checkAuthStatus();
    }, []);
    
    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        apiService.auth.logout();
        setIsAuthenticated(false);
    };

    // Show loading state
    if (isLoading) {
        return <div>Chargement...</div>;
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                {isAuthenticated && <Navbar onLogout={handleLogout} />}
                <Routes>
                    <Route 
                        path="/login" 
                        element={
                            isAuthenticated ? 
                            <Navigate to="/dashboard" /> : 
                            <Login onLogin={handleLogin} />
                        } 
                    />
                    <Route 
                        path="/dashboard" 
                        element={
                            isAuthenticated ? 
                            <Dashboard /> : 
                            <Navigate to="/login" />
                        } 
                    />
                    <Route 
                        path="/upload" 
                        element={
                            isAuthenticated ? 
                            <Upload /> : 
                            <Navigate to="/login" />
                        } 
                    />
                    <Route 
                        path="/download" 
                        element={
                            isAuthenticated ? 
                            <Download /> : 
                            <Navigate to="/login" />
                        } 
                    />
                    <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)

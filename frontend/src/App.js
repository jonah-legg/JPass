import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Signup from './components/Signup';

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [vault, setVault] = React.useState(null);

  return (
    <Router>
    <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
          />
          <Route 
            path="/login" 
            element={
              <Login 
                onLoginSuccess={(vaultData) => {
                  setVault(vaultData);
                  setIsAuthenticated(true);
                }}
              />
            }
          />
          <Route 
            path="/signup" 
            element={
              <Signup 
                onSignupSuccess={(vaultData) => {
                  setVault(vaultData);
                  setIsAuthenticated(true);
                }}
              />
            }
          />
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

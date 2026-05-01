import React from 'react';
import Vault from './components/Vault';
import Login from './components/Login';
import Signup from './components/Signup';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    const [showLogin, setShowLogin] = React.useState(true);
    
    const [email, setEmail] = React.useState('');
    const [passwordHash, setPasswordHash] = React.useState('');
    const [encryptionKey, setEncryptionKey] = React.useState('');
    const [vault, setVault] = React.useState({ passwords: [] });
    const [clientSalt, setClientSalt] = React.useState('');

    const handleSignupSuccess = (email, passwordHash, encryptionKey, vault, clientSalt) => {
        setEmail(email);
        setPasswordHash(passwordHash);
        setEncryptionKey(encryptionKey);
        setVault(vault);
        setClientSalt(clientSalt);
        setIsAuthenticated(true);
    };

    const handleLoginSuccess = (email, passwordHash, encryptionKey, vault, clientSalt) => {
        setEmail(email);
        setPasswordHash(passwordHash);
        setEncryptionKey(encryptionKey);
        setVault(vault);
        setClientSalt(clientSalt);
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        setEmail('');
        setPasswordHash('');
        setEncryptionKey('');
        setVault({ passwords: [] });
        setClientSalt('');
        setIsAuthenticated(false);
    };

    if (isAuthenticated) {
        return (
            <Vault
                email={email}
                passwordHash={passwordHash}
                encryptionKey={encryptionKey}
                vault={vault}
                setVault={setVault}
                onLogout={handleLogout}
            />
        );
    }

    return (
        <div className="container d-flex flex-column align-items-center justify-content-center min-vh-100">
            <div className="card shadow p-4" style={{ maxWidth: '450px', width: '100%' }}>
                <h1 className="text-center mb-4 fw-bold">JPass</h1>
                
                <ul className="nav nav-pills nav-justified mb-4">
                    <li className="nav-item">
                        <button
                            className={`nav-link ${showLogin ? 'active' : ''}`}
                            onClick={() => setShowLogin(true)}
                        >
                            Login
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${!showLogin ? 'active' : ''}`}
                            onClick={() => setShowLogin(false)}
                        >
                            Sign Up
                        </button>
                    </li>
                </ul>

                {showLogin ? (
                    <Login onLoginSuccess={handleLoginSuccess} />
                ) : (
                    <Signup onSignupSuccess={handleSignupSuccess} />
                )}
            </div>
        </div>
    );
}

export default App;
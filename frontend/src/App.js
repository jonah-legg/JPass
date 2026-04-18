import React from 'react';
import Vault from './components/Vault';
import Login from './components/Login';
import Signup from './components/Signup';

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
        <div>
            <div>
                <h1>JPass</h1>
                
                <div>
                    <button onClick={() => setShowLogin(true)}>Login</button>
                    <button onClick={() => setShowLogin(false)}>Sign Up</button>
                </div>
            </div>

            {showLogin ? (
                <Login onLoginSuccess={handleLoginSuccess} />
            ) : (
                <Signup onSignupSuccess={handleSignupSuccess} />
            )}
        </div>
    );
}

export default App;

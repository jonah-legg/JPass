import React from 'react';
import axios from 'axios';
import { deriveKeys, decryptVault } from '../utils/crypto';

function Login({ onLoginSuccess }) {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const API_URL = process.env.REACT_APP_BACKEND;

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const saltResponse = await axios.post(`${API_URL}/api/get-salt`, {
                email: email
            });
            const clientSalt = saltResponse.data.clientSalt;

            const { passwordHash, encryptionKey } = await deriveKeys(password, clientSalt);

            const response = await axios.post(`${API_URL}/api/login`, {
                email: email,
                passwordHash: passwordHash
            });

            const encryptedVault = response.data.encryptedVault;
            const vault = await decryptVault(encryptedVault, encryptionKey);

            onLoginSuccess(email, passwordHash, encryptionKey, vault, clientSalt);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <input
                        type="email"
                        className="form-control"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <input
                        type="password"
                        className="form-control"
                        placeholder="Master Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {error && <p className="text-danger small">{error}</p>}

                <button type="submit" className="btn btn-primary w-100">Login</button>
            </form>
        </div>
    );
}

export default Login;
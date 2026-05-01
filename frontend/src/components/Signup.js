import React from 'react';
import axios from 'axios';
import { generateClientSalt, deriveKeys, encryptVault } from '../utils/crypto';

function Signup({ onSignupSuccess }) {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const API_URL = process.env.REACT_APP_BACKEND;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const clientSalt = generateClientSalt();
            const { passwordHash, encryptionKey } = await deriveKeys(password, clientSalt);
            const response = await axios.post(`${API_URL}/api/signup`, {
                email: email,
                passwordHash: passwordHash,
                clientSalt: clientSalt
            });

            console.log(response.data);

            const emptyVault = { passwords: [] };
            const encryptedVault = await encryptVault(emptyVault, encryptionKey);

            await axios.post(`${API_URL}/api/update-vault`, {
                email: email,
                passwordHash: passwordHash,
                encryptedVault: encryptedVault
            });

            onSignupSuccess(email, passwordHash, encryptionKey, emptyVault, clientSalt);
        } catch (err) {
            setError('Signup failed');
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

                <div className="mb-3">
                    <input
                        type="password"
                        className="form-control"
                        placeholder="Confirm Master Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>

                {error && <p className="text-danger small">{error}</p>}

                <button type="submit" className="btn btn-primary w-100">Sign Up</button>
            </form>
        </div>
    );
}

export default Signup;
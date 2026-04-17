import React from 'react';
import axios from 'axios';
import CryptoJS from 'crypto-js';

function Signup({ onSignupSuccess}) {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const API_URL = process.env.REACT_APP_BACKEND;

    const deriveKeys = (masterPassword, email) => {
        const derived = CryptoJS.PBKDF2(masterPassword, email, {
            keySize: 512/32,
            iterations: 100000
        });

        const words = CryptoJS.lib.WordArray.create(derived.words);
        const authHash = CryptoJS.lib.WordArray.create(words.words.slice(0,8));
        const encryptionKey = CryptoJS.lib.WordArray.create(words.words.slice(8, 16));

        return {
            authHash: authHash.toString(CryptoJS.enc.Hex),
            encryptionKey: encryptionKey.toString(CryptoJS.enc.Hex)
        };
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${API_URL}/api/auth/signup`, {
                email: email,
                password: password
            });

            onSignupSuccess(response.data.vault);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {error && <p>{error.message}</p>}

                <button type="submit">Signup</button>
            </form>
        </div>
    )
}

export default Signup;
import React from 'react';
import axios from 'axios';

function Login({ onLoginSuccess}) {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const API_URL = process.env.REACT_APP_BACKEND;

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${API_URL}/api/auth/login`, {
                email: email,
                password: password
            });

            onLoginSuccess(response.data.vault);
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

                <button type="submit">Login</button>
            </form>
        </div>
    )
}

export default Login;

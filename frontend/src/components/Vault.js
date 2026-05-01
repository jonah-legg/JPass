import React from 'react';
import axios from 'axios';
import { encryptVault } from '../utils/crypto';

function Vault({ email, passwordHash, encryptionKey, vault, setVault, onLogout }) {
    const [showAddForm, setShowAddForm] = React.useState(false);
    const [newEntry, setNewEntry] = React.useState({
        site: '',
        url: '',
        username: '',
        password: ''
    });
    const [visiblePasswords, setVisiblePasswords] = React.useState({});
    const API_URL = process.env.REACT_APP_BACKEND;

    const saveVaultToServer = async (updatedVault) => {
        try {
            const encryptedVault = await encryptVault(updatedVault, encryptionKey);
            const payload = {
                email: email,
                passwordHash: passwordHash,
                encryptedVault: encryptedVault
            };

            await axios.post(`${API_URL}/api/update-vault`, payload);
        } catch (err) {
            console.error('Save vault error:', err);
            console.error('Response data:', err.response?.data);
            alert('Failed to save vault: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleAddPassword = async (e) => {
        e.preventDefault();

        const updatedVault = {
            passwords: [
                ...vault.passwords,
                {
                    id: Date.now().toString(),
                    ...newEntry,
                    createdAt: new Date().toISOString()
                }
            ]
        };

        setVault(updatedVault);
        await saveVaultToServer(updatedVault);

        setNewEntry({ site: '', url: '', username: '', password: '' });
        setShowAddForm(false);
    };

    const handleDeletePassword = async (id) => {
        if (!window.confirm('Delete this password?')) return;

        const updatedVault = {
            passwords: vault.passwords.filter(p => p.id !== id)
        };

        setVault(updatedVault);
        await saveVaultToServer(updatedVault);
    };

    const togglePasswordVisibility = (id) => {
        setVisiblePasswords(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="mb-0">Your Password Vault</h2>
                <button className="btn btn-outline-danger" onClick={onLogout}>Logout</button>
            </div>

            <p className="text-muted mb-4">Logged in as: {email}</p>

            <button
                className={`btn ${showAddForm ? 'btn-secondary' : 'btn-primary'} mb-4`}
                onClick={() => setShowAddForm(!showAddForm)}
            >
                {showAddForm ? 'Cancel' : 'Add Password'}
            </button>

            {showAddForm && (
                <div className="card mb-4">
                    <div className="card-body">
                        <form onSubmit={handleAddPassword}>
                            <h3 className="card-title mb-3">Add New Password</h3>

                            <div className="mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Site Name"
                                    value={newEntry.site}
                                    onChange={(e) => setNewEntry({ ...newEntry, site: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="URL"
                                    value={newEntry.url}
                                    onChange={(e) => setNewEntry({ ...newEntry, url: e.target.value })}
                                />
                            </div>

                            <div className="mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Username/Email"
                                    value={newEntry.username}
                                    onChange={(e) => setNewEntry({ ...newEntry, username: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Password"
                                    value={newEntry.password}
                                    onChange={(e) => setNewEntry({ ...newEntry, password: e.target.value })}
                                    required
                                />
                            </div>

                            <button type="submit" className="btn btn-success">Save Password</button>
                        </form>
                    </div>
                </div>
            )}

            <h3 className="mb-3">Saved Passwords ({vault.passwords.length})</h3>

            {vault.passwords.length === 0 ? (
                <p className="text-muted">No passwords saved yet. Click "Add Password" to get started.</p>
            ) : (
                <div className="row g-3">
                    {vault.passwords.map((entry) => (
                        <div key={entry.id} className="col-12">
                            <div className="card">
                                <div className="card-body d-flex justify-content-between align-items-start">
                                    <div>
                                        <h4 className="card-title mb-1">{entry.site}</h4>
                                        {entry.url && (
                                            <p className="mb-1">
                                                <a
                                                    href={entry.url.startsWith('http') ? entry.url : `https://${entry.url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-decoration-none"
                                                >
                                                    {entry.url}
                                                </a>
                                            </p>
                                        )}
                                        <p className="mb-1"><strong>Username:</strong> {entry.username}</p>
                                        <p className="mb-0">
                                            <strong>Password:</strong>{' '}
                                            {visiblePasswords[entry.id] ? (
                                                <span className="font-monospace">{entry.password}</span>
                                            ) : (
                                                <span>••••••••</span>
                                            )}
                                            <button
                                                className="btn btn-sm btn-outline-secondary ms-2"
                                                onClick={() => togglePasswordVisibility(entry.id)}
                                            >
                                                {visiblePasswords[entry.id] ? 'Hide' : 'Show'}
                                            </button>
                                        </p>
                                    </div>
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleDeletePassword(entry.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Vault;
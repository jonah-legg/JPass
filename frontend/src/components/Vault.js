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
        console.log('=== SAVE VAULT TO SERVER ===');
        console.log('email:', email);
        console.log('passwordHash:', passwordHash);
        console.log('passwordHash type:', typeof passwordHash);
        console.log('passwordHash length:', passwordHash?.length);
        console.log('encryptionKey:', encryptionKey ? 'exists' : 'undefined');
        
        const encryptedVault = await encryptVault(updatedVault, encryptionKey);
        
        console.log('encryptedVault:', encryptedVault);
        console.log('encryptedVault length:', encryptedVault?.length);

        const payload = {
            email: email,
            passwordHash: passwordHash,
            encryptedVault: encryptedVault
        };

        console.log('Payload to send:', JSON.stringify(payload, null, 2));

        await axios.post(`${API_URL}/api/update-vault`, payload);

        console.log('✓ Client: Vault saved successfully');
    } catch (err) {
        console.error('❌ Save vault error:', err);
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
        <div>
            <div>
                <h2>Your Password Vault</h2>
                <button onClick={onLogout}>Logout</button>
            </div>

            <p>Logged in as: {email}</p>

            <button onClick={() => setShowAddForm(!showAddForm)}>{showAddForm ? 'Cancel' : 'Add Password'}</button>

            {showAddForm && (
                <form onSubmit={handleAddPassword}>
                    <h3>Add New Password</h3>
                    
                    <input
                        type="text"
                        placeholder="Site Name"
                        value={newEntry.site}
                        onChange={(e) => setNewEntry({ ...newEntry, site: e.target.value })}
                        required
                    />

                    <input
                        type="text"
                        placeholder="URL"
                        value={newEntry.url}
                        onChange={(e) => setNewEntry({ ...newEntry, url: e.target.value })}
                    />

                    <input
                        type="text"
                        placeholder="Username/Email"
                        value={newEntry.username}
                        onChange={(e) => setNewEntry({ ...newEntry, username: e.target.value })}
                        required
                    />

                    <div>
                        <input
                            type="text"
                            placeholder="Password"
                            value={newEntry.password}
                            onChange={(e) => setNewEntry({ ...newEntry, password: e.target.value })}
                            required
                        />
                    </div>

                    <button type="submit">Save Password</button>
                </form>
            )}

            <h3>Saved Passwords ({vault.passwords.length})</h3>

            {vault.passwords.length === 0 ? (
                <p>No passwords saved yet. Click "Add Password" to get started.</p>
            ) : (
                <div>
                    {vault.passwords.map((entry) => (
                        <div key={entry.id}>
                            <div>
                                <div>
                                    <h4>{entry.site}</h4>
                                    {entry.url && (
                                        <p>
                                            <a 
                                                href={entry.url.startsWith('http') ? entry.url : `https://${entry.url}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                            >
                                                {entry.url}
                                            </a>
                                        </p>
                                    )}
                                    <p><strong>Username:</strong> {entry.username}</p>
                                    <p>
                                        <strong>Password:</strong>{' '}
                                        {visiblePasswords[entry.id] ? (
                                            <span style={{ fontFamily: 'monospace' }}>{entry.password}</span>
                                        ) : (
                                            <span>••••••••</span>
                                        )}
                                        <button onClick={() => togglePasswordVisibility(entry.id)}>{visiblePasswords[entry.id] ? 'Hide' : 'Show'}</button>
                                    </p>
                                </div>
                                <button onClick={() => handleDeletePassword(entry.id)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Vault;
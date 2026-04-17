const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const argon2 = require('argon2');

const hexToBuffer = (hex) => {
    return Buffer.from(hex, 'hex');
};

const bufferToHex = (buffer) => {
    return buffer.toString('hex');
}

const generateSalt = () => {
    return crypto.randomBytes(16).toString('hex');
}

const ANTI_TIMING_HASH = '$2b$10$eJfKT8Z3h5XqO9KjP4L.7eF8gH9iJ0kL1mN2oP3qR4sT5uV6wX7yZ';

router.post('/signup', async (req, res) => {
    try {
        const {email, passwordHash, clientSalt } = req.body;

        if (!email || !passwordHash || !clientSalt) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const existingUser = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'This user already exists'});
        }

        const serverSalt = generateServerSalt();
        const hashedHash = await argon2.hash(authHash, {
            type: argon2.argon2id,
            memoryCost: 65536,
            timeCost: 3,
            parallelism: 4,
            salt: Buffer.from(serverSalt, 'hex')
        });

        const result = await pool.query(
            'INSERT INTO users (email, password_hash, server_salt, client_salt, encrypted_vault) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [email, passwordHash, serverSalt, clientSalt, null]
        );

        res.status(201).json({
            message: 'User created successfully',
            userId: result.rows[0].id
        });
    } catch (err) {
        console.error('Signup error:', err.message)
        res.status(500).json({ message: 'Signup failed' });
    }
});

router.post('/get-salt', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email required' });
        }

        const result = await pool.query(
            'SELECT client_salt FROM userse WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            const fakeHash = crypto.createHash('sha256').update(email).digest('hex');
            const fakeSalt = fakeHash.substring(0, 64);
            return res.json({ clientSalt: fakeSalt });
        }

        res.json({ clientSalt: result.rows[0].client_salt})
    } catch (err) {
        console.error('Get salt error:', err.message);
        res.status(500).json({ message: 'Failed to retrieve salt' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, passwordHash } = req.body;

        if (!email || !authHash) {
            return res.status(400).json({ message: 'Email and auth hash required' });
        }

        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        let hash;
        let userExists;

        if (result.rows.length === 0) {
            hash = ANTI_TIMING_HASH;
            userExists = false;
        } else {
            hash = result.rows[0].password_hash;
            userExists = true;
        }

        const isValid = await argon2.verify(passwordHash, hash);

        if (!userExists || !isValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.json({
            message: 'Login successful',
            vault: JSON.parse(result.rows[0].encrypted_vault)
        });
    } catch (err) {
        console.log('Login error:', err.message);
        res.status(500).json({ message: 'Login failed' });
    }
});

router.post('/update-vault', async (req, res) => {
    try {
        const { email, passwordHash, encryptedVault } = req.body;

        if (!email || !passwordHash || !encryptedVault) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = result.rows[0];

        const isValid = await argon2.verify(user.hashed_auth, authHash);

        if (!isValid) {
            console.log('Server: Authentication failed for vault update');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log('Server: Authentication successful, updating vault...');

        const blobBuffer = hexToBuffer(encryptedBlob);

        await pool.query(
            'UPDATE users SET encrypted_blob = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2',
            [blobBuffer, email]
        );

        console.log('Server: Vault updated successfully');

        res.json({ message: 'Vault updated successfully' });

    } catch (err) {
        console.error('Update vault error:', err.message);
        res.status(500).json({ message: 'Failed to update vault' });
    }
});

module.exports = router;
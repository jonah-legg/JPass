export const deriveKeys = async (masterPassword, clientSalt) => {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(masterPassword);
    const saltBuffer = hexToBuffer(clientSalt);

    try {
        const argon2 = window.argon2;
        const authResult = await argon2.hash({
            pass: passwordBuffer,
            salt: saltBuffer,
            time: 3,             
            mem: 65536,           
            hashLen: 32,          
            parallelism: 4,  
            type: argon2.ArgonType.Argon2id,
            secret: encoder.encode('auth')
        });

        const passwordHash = bufferToHex(authResult.hash);
        const encResult = await argon2.hash({
            pass: passwordBuffer,
            salt: saltBuffer,
            time: 3,              
            mem: 65536,           
            hashLen: 32,          
            parallelism: 4,       
            type: argon2.ArgonType.Argon2id,
            secret: encoder.encode('encryption')
        });

        const encryptionKey = bufferToHex(encResult.hash);

        return {
            passwordHash,
            encryptionKey
        };

    } catch (error) {
        console.error('Argon2id derivation error:', error);
        throw new Error('Failed to derive keys: ' + error.message);
    }
};

export const generateClientSalt = () => {
    const salt = crypto.getRandomValues(new Uint8Array(32));
    const saltHex = bufferToHex(salt);
    return saltHex;
};

export const encryptVault = async (vault, encryptionKey) => {
    const encoder = new TextEncoder();
    const vaultJson = JSON.stringify(vault);
    const vaultBuffer = encoder.encode(vaultJson);

    const iv = crypto.getRandomValues(new Uint8Array(12));

    const key = await crypto.subtle.importKey(
        'raw',
        hexToBuffer(encryptionKey),
        { name: 'AES-GCM' },
        false,
        ['encrypt']
    );

    const encryptedBuffer = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv
        },
        key,
        vaultBuffer
    );

    const encryptedArray = new Uint8Array(encryptedBuffer);
    const combined = new Uint8Array(iv.length + encryptedArray.length);
    combined.set(iv, 0);
    combined.set(encryptedArray, iv.length);
    return bufferToHex(combined);
};

export const decryptVault = async (encryptedBlobHex, encryptionKey) => {
    if (!encryptedBlobHex) {
        return { passwords: [] };
    }

    const encryptedBuffer = hexToBuffer(encryptedBlobHex);
    const iv = encryptedBuffer.slice(0, 12);
    const ciphertext = encryptedBuffer.slice(12);
    const key = await crypto.subtle.importKey(
        'raw',
        hexToBuffer(encryptionKey),
        { name: 'AES-GCM' },
        false,
        ['decrypt']
    );

    try {
        const decryptedBuffer = await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            ciphertext
        );

        const decoder = new TextDecoder();
        const vaultJson = decoder.decode(decryptedBuffer);
        return JSON.parse(vaultJson);
    } catch (err) {
        console.error('Client: Decryption failed:', err);
        throw new Error('Failed to decrypt vault - incorrect password or corrupted data');
    }
};

const bufferToHex = (buffer) => {
    return Array.from(buffer)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
};

const hexToBuffer = (hex) => {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
};
const crypto = require('crypto');
const CURVE = 'prime256v1';

// console.table(crypto.getCurves());
let privateKey_copy;

export const generateKeys = () => {
    const ecdh = crypto.createECDH(CURVE);
    ecdh.generateKeys();
    privateKey_copy = ecdh.getPrivateKey('hex');
    return { privateKey: privateKey_copy, publicKey: ecdh.getPublicKey('base64') };
}

export const computeSharedKey = (privateKey, publicKeyBase64) => {
    const ecdh = crypto.createECDH(CURVE);
    ecdh.setPrivateKey(privateKey ?? privateKey_copy, 'hex');
    return ecdh.computeSecret(publicKeyBase64, 'base64', 'base64');
}

export const encryptMessage = (message, sharedKey) => {
    // Initialization Vector
    const IV = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(sharedKey, 'base64'), IV);

    let encrypted = cipher.update(message, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const auth_tag = cipher.getAuthTag().toString('hex');

    const payload = IV.toString('hex') + encrypted + auth_tag;

    return Buffer.from(payload, 'hex').toString('base64');
}

export const decryptMessage = (payload64, sharedKey) => {
    const payload = Buffer.from(payload64, 'base64').toString('hex');

    // iv && auth_tag consist of 32 hex chars
    const iv = payload.substr(0, 32);
    const encrypted = payload.substr(32, payload.length - 64);
    const auth_tag = payload.substr(payload.length - 32, 32);

    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(sharedKey, 'base64'), Buffer.from(iv, 'hex'));
    let decrypted;
    try {
        // Without AuthTag, decrypting won't succeed
        decipher.setAuthTag(Buffer.from(auth_tag, 'hex'));

        decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
    }
    catch (err) {
        console.error(err);
    }
    return decrypted;
}
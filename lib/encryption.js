// lib/encryption.js
import crypto from 'crypto';

const secret = process.env.ENCRYPTION_SECRET;
const algorithm = 'aes-256-cbc';
const iv = Buffer.alloc(16, 0); // 16-byte zero IV

export function encryptCompanyName(companyName) {
  const key = crypto.scryptSync(secret, 'salt', 32);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(companyName, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export function decryptCompanyName(encryptedToken) {
  const key = crypto.scryptSync(secret, 'salt', 32);
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedToken, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

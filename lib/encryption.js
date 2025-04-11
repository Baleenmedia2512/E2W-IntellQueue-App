import crypto from 'crypto';

const secret = process.env.ENCRYPTION_SECRET || 'mySuperSecretKey123'; // 🔐 Replace in .env
const algorithm = 'aes-256-cbc';
const iv = Buffer.alloc(16, 0); // Fixed IV for stable, repeatable encrypted token

export function encryptCompanyName(companyName) {
  const key = crypto.scryptSync(secret, 'salt', 32);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(companyName, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export function decryptCompanyName(token) {
  const key = crypto.scryptSync(secret, 'salt', 32);
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(token, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

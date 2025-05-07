import crypto from 'crypto';

const secretKey = Buffer.from(process.env.ENCRYPTION_SECRET, 'hex'); // Load key directly from environment variables
const ivLength = 16; // IV length for AES-256-CBC

if (secretKey.length !== 32) {
  throw new Error('Invalid ENCRYPTION_SECRET: Must be a 32-byte hexadecimal string');
}

export function encryptCompanyName(companyName) {
  const iv = crypto.randomBytes(ivLength); // Generate a random IV for each encryption
  const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);
  let encrypted = cipher.update(companyName, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`; // Include IV with the encrypted data
}

export function decryptCompanyName(encryptedData) {
  if (!encryptedData || !encryptedData.includes(':')) {
    throw new Error('Invalid encrypted data format');
  }

  const [ivHex, encrypted] = encryptedData.split(':'); // Extract IV and encrypted data
  if (!ivHex || !encrypted) {
    throw new Error('Invalid encrypted data format');
  }

  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}


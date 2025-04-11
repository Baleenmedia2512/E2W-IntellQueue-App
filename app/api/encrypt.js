// pages/api/encrypt.js
import crypto from 'crypto';

const secret = process.env.ENCRYPTION_SECRET || 'mySuperSecretKey123'; // 🔐 Set in .env
const algorithm = 'aes-256-cbc';
const iv = Buffer.alloc(16, 0); // Fixed IV for repeatable encryption

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { companyName } = req.body;

    if (!companyName) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    try {
      const key = crypto.scryptSync(secret, 'salt', 32);
      const cipher = crypto.createCipheriv(algorithm, key, iv);
      let encrypted = cipher.update(companyName, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      res.status(200).json({ encrypted });
    } catch (error) {
      res.status(500).json({ error: 'Encryption failed' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

// pages/api/decrypt.js
import { decryptCompanyName } from '@/lib/encryption';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Missing encrypted token' });
  }

  try {
    const companyName = decryptCompanyName(token);
    res.status(200).json({ companyName });
  } catch (err) {
    res.status(500).json({ error: 'Failed to decrypt company name' });
  }
}

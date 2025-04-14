import { NextResponse } from 'next/server';
import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const secret = process.env.ENCRYPTION_SECRET;
const iv = Buffer.alloc(16, 0);

export async function POST(req) {
  try {
    const body = await req.json();
    const { token } = body;

    const key = crypto.scryptSync(secret, 'salt', 32);
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(token, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return NextResponse.json({ companyName: decrypted });
  } catch (err) {
    console.error('Decryption failed:', err.message);
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }
}

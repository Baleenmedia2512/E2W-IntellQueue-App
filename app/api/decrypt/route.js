import { NextResponse } from 'next/server';
import { decryptCompanyName } from '@/lib/encryption';

export async function POST(request) {
  try {
    const { encryptedData } = await request.json();

    if (!encryptedData) {
      return NextResponse.json({ error: 'Missing encrypted data' }, { status: 400 });
    }

    try {
      const companyName = decryptCompanyName(encryptedData);

      if (!companyName) {
        return NextResponse.json({ error: 'Invalid encrypted data' }, { status: 400 });
      }

      return NextResponse.json({ companyName });
    } catch (error) {
      console.error('Decryption error:', error.message);
      return NextResponse.json({ error: 'Failed to decrypt data' }, { status: 400 });
    }
  } catch (error) {
    console.error('Request processing error:', error.message);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

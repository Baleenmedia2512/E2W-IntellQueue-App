// app/api/generate-link/route.js
import { NextResponse } from 'next/server';
import { encryptCompanyName } from '@/lib/encryption'; // adjust path if needed

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const companyName = searchParams.get('companyName');

  if (!companyName) {
    return NextResponse.json({ error: 'Missing company name' }, { status: 400 });
  }

  const encrypted = encryptCompanyName(companyName);
  const fullUrl = `https://yourdomain.com/QueueSystemAutoLogin?ref=${encrypted}`;

  return NextResponse.json({ encryptedUrl: fullUrl });
}

import { NextResponse } from 'next/server';
import { encryptCompanyName } from '@/lib/encryption';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const companyName = searchParams.get('companyName');

  if (!companyName) {
    return NextResponse.json({ error: 'Missing company name' }, { status: 400 });
  }

  const encrypted = encryptCompanyName(companyName);
  const fullUrl = `${origin}/QueueSystem?ref=${encrypted}`;

  return NextResponse.json({ encryptedUrl: fullUrl });
}

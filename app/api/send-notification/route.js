// app/api/send-notification/route.js
import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function POST(req) {
  try {
    const { token, title, body } = await req.json();

    console.log('📡 Sending notification to token:', token);
    console.log('🔔 Notification title:', title);
    console.log('💬 Notification body:', body);

    const message = {
      token,
      notification: {
        title,
        body,
      },
    };

    const response = await admin.messaging().send(message);

    console.log('✅ Notification sent successfully:', response);
    return NextResponse.json({ success: true, response });
  } catch (error) {
    console.error('🔥 Error sending notification:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

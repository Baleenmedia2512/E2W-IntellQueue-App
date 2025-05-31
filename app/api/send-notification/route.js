// app/api/send-notification/route.js
import { messaging } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { token, title, body, link } = await request.json();

  const payload = {
    token,
    notification: {
      title: title,
      body: body,
    },
    webpush: link
      ? {
          fcmOptions: {
            link,
          },
        }
      : undefined,
  };

  try {
    await messaging.send(payload);
    return NextResponse.json({ success: true, message: "Notification sent!" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.toString() });
  }
}


// import { NextResponse } from 'next/server';
// import admin from 'firebase-admin';

// // Initialize Firebase Admin SDK if not already initialized
// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert({
//       projectId: process.env.FIREBASE_PROJECT_ID,
//       clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//       privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
//     }),
//   });
// }

// export async function POST(req) {
//   try {
//     const { token, title, body, link } = await req.json();

//     console.log('📡 Sending notification to token:', token);
//     console.log('🔔 Notification title:', title);
//     console.log('💬 Notification body:', body);
//     console.log('💬 Notification link:', link);

//     const payload = {
//       token,
//       notification: {
//         title: title,
//         body: body,
//       },
//       webpush: link && {
//         fcmOptions: {
//           link,
//         }
//       }
//     };

//     const response = await admin.messaging().send(payload);

//     console.log('✅ Notification sent successfully:', response);
//     return NextResponse.json({ success: true, response });
//   } catch (error) {
//     console.error('🔥 Error sending notification:', error);
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }

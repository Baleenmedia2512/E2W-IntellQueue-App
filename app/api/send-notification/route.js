// app/api/send-notification/route.js
import { messaging } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { token, title, message, link, icon } = await request.json();
  

  if (!token || !Array.isArray(token) || token.length === 0) {
    return NextResponse.json({ success: false, error: "A non-empty tokens array is required" });
  }

  const responses = [];

  for (const singleToken of token) {
    const payload = {
      token: singleToken,
      data: {
        title: title,
        body: message,
        link: link
      }
    };

    try {
      const response = await messaging.send(payload);
      responses.push({ token: singleToken, success: true, response });
    } catch (error) {
      responses.push({ token: singleToken, success: false, error: error.toString() });
    }
  }

  return NextResponse.json({ success: true, message: "Notifications sent!", responses });
}

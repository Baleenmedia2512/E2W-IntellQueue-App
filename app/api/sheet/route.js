import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(request) {
  try {
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const credentials = JSON.parse(credentialsPath);

    const auth = await google.auth.getClient({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const range = `Sheet1!A3:P123`;
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: "19gpuyAkdMFZIYwaDXaaKtPWAZqMvcIZld6EYkb4_xjw",
      range,
    });

    const values = response?.data?.values || [];
    const rows = values.map((row) => {
      const [
        SNo,
        Date,
        Day,
        Channel,
        Platform,
        Name,
        Phone,
        Email,
        Enquiry,
        Status,
        DateOfStatusChange,
        LeadType,
        PreviousStatus,
        FollowupDate,
        FollowupTime,
        CompanyName,
        Remarks,
      ] = row;
      return {
        Name: Name || "Unknown",
        LeadDate: Date || "Unknown",
        Phone: Phone || "No Contact",
        Status: Status || "",
        SNo: SNo || 0,
        Platform: Platform || "",
        Enquiry: Enquiry || "",
        CompanyName: CompanyName || "No Company Name",
        FollowupDate: FollowupDate || "No Followup Date",
      };
    });

    return NextResponse.json({ rows });
  } catch (error) {
    console.error("API Error:", error.message);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

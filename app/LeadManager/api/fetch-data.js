import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Authenticate with Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = "19gpuyAkdMFZIYwaDXaaKtPWAZqMvcIZld6EYkb4_xjw";
    const range = "Sheet1!A3:P123";

    // Fetch data from Google Sheets
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const values = response.data.values || [];

    // Map the values to an array of objects
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
        SNo: SNo || 0,
        Name: Name || "Unknown",
        LeadDate: Date || "Unknown",
        Phone: Phone || "No Contact",
        Status: Status || "",
        Platform: Platform || "",
        Enquiry: Enquiry || "",
        FollowupDate: FollowupDate || "No Followup Date",
        CompanyName: CompanyName || "No Company Name",
      };
    });

    res.status(200).json({ rows });
  } catch (error) {
    console.error("Error fetching data from Google Sheets:", error.message);
    res.status(500).json({ error: "Failed to fetch data" });
  }
}
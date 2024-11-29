
import { google } from "googleapis";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiFilter } from "react-icons/fi";
import CustomButton from './filterButton'

const statusColors = {
  New: "bg-green-200 text-green-800",
  Unreachable: "bg-red-200 text-red-800",
  "Call Followup": "bg-yellow-200 text-yellow-800",
  Unqualified: "bg-orange-200 text-orange-800",
  "No Status": "bg-gray-200 text-gray-800",
};

const availableStatuses = [
  "New",
  "Call Followup",
  "Unreachable",
  "Unqualified",
  "No Status",
];

function toTitleCase(str) {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const parseFollowupDate = (dateStr) => {
  if(dateStr === 'No Followup Date'){
    return;
  }

  const [day, month, year] = dateStr.split("-");
  const monthIndex = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ].indexOf(month);

  if (monthIndex === -1 || !day || !year) {
    console.error("Invalid date format:", dateStr);
    return null;
  }

  return new Date(2000 + parseInt(year, 10), monthIndex, parseInt(day, 10));
};

const EventCards = ({ rows }) => {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4 top-0 left-0 right-0 z-10 sticky bg-white p-3">
        <h2 className="text-xl font-semibold text-blue-500">Lead Manager</h2>
        <CustomButton
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700"
          // onClick={() => console.log("Filter panel opened!")} // Add your filter handler here
        >
          <FiFilter className="mr-2 text-lg" />
          Filter
        </CustomButton>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) => (
          <div
            key={row.SNo}
            className="relative bg-white shadow-md rounded-lg p-4 border border-gray-200"
            style={{ minHeight: "240px" }} // Adjust card height for extra data
          >
            {/* Status at Top Right */}
            <div className="absolute top-2 right-2">
              <span
                className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusColors[row.Status]}`}
              >
                {row.Status}
              </span>
            </div>

            {/* Platform at Top Left */}
            <div className="absolute top-2 left-2">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-blue-700 shadow-md">
                {row.Platform || "Unknown Platform"}
              </span>
            </div>

            {/* Name and Company */}
            <div className="mb-2 mt-8">
              <h3 className="text-lg font-bold text-gray-900">
                {toTitleCase(row.Name)}
                {row.CompanyName && row.CompanyName !== "No Company Name"
                  ? ` - ${row.CompanyName}`
                  : ""}
              </h3>
            </div>

            {/* Core Details */}
            <div className="text-sm text-gray-700 mb-2">
              <p>
                <strong>Arrival On:</strong> {row.LeadDate} {row.LeadTime}
              </p>
              <p>
                <strong>Phone:</strong>
                <a
                  href={`tel:${row.Phone}`}
                  className="text-blue-600 hover:underline ml-1"
                >
                  {row.Phone}
                </a>
              </p>
              <p>
                <strong>Enquiry:</strong> {row.Enquiry || "N/A"}
              </p>
              {row.Medium &&
                <p>
                  <strong>Medium:</strong> {row.Medium || "N/A"}
                </p>
              }
            </div>

            {/* Additional Details
            <div className="text-sm text-gray-700 mb-2">
             
            </div> */}

            {/* Follow-Up Date */}
            {row.FollowupDate !== "No Followup Date" && (
              <div className="text-sm">
                <p className="bg-red-500 text-white p-2 text-[14px] rounded-lg">
                  Followup On: {row.FollowupDate} {row.FollowupTime}
                </p>
              </div>
            )}

            {/* Remarks */}
            {row.Remarks && (
              <div className="text-sm bg-gray-200 text-gray-900 mt-2 p-1 rounded-md">
                <p>
                  <strong>Remarks:</strong> {row.Remarks}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

async function fetchSpreadsheetData(queryId, filters) {
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const credentials = JSON.parse(credentialsPath);

  const auth = await google.auth.getClient({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const range = `Sheet1!A3:S123`;

  let response = null;
  try {
    response = await sheets.spreadsheets.values.get({
      spreadsheetId: "19gpuyAkdMFZIYwaDXaaKtPWAZqMvcIZld6EYkb4_xjw",
      range,
    });
  } catch (error) {
    console.error("Google Sheets API Error:", error.message);
    return null;
  }

  const values = response?.data?.values || [];
  if (values.length === 0) return null;

  const rows = values.map((row) => {
    const [
      SNo,
      Date,
      Time,
      Day,
      Channel,
      Platform,
      Name,
      Phone,
      Email,
      Enquiry,
      Medium,
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
      LeadTime: Time || "",
      Phone: Phone || "No Contact",
      Status: Status || "",
      SNo: SNo || 0,
      Platform: Platform || "",
      Enquiry: Enquiry || "",
      Medium: Medium || "",
      CompanyName: CompanyName || "No Company Name",
      FollowupDate: FollowupDate || "No Followup Date",
      FollowupTime: FollowupTime,
      Remarks: Remarks
    };
  });

  // Apply filters server-side
  return rows.filter((row) => {
    const matchesLeadDate =
      !filters.leadDate ||
      new Date(row.LeadDate).toDateString() === new Date(filters.leadDate).toDateString();

    const matchesStatus = !filters.status || row.Status === filters.status;

    const matchesFollowupDate =
      !filters.followupDate ||
      (parseFollowupDate(row.FollowupDate)?.toDateString() ===
        new Date(filters.followupDate).toDateString());

    return matchesLeadDate && matchesStatus && matchesFollowupDate;
  });
}

export default async function Page({ params, searchParams }) {
  const filters = {
    leadDate: searchParams.leadDate || null,
    status: searchParams.status || "",
    followupDate: searchParams.followupDate || null,
  };

  const rows = await fetchSpreadsheetData(params.id, filters);
  console.log(rows);

  if (!rows) {
    return (
      <div className="font-poppins text-center">
        <h2>No Data Found</h2>
      </div>
    );
  }

  return (
    <article>
      <EventCards rows={rows} />
    </article>
  );
}

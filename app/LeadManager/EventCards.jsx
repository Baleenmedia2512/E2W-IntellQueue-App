import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
  const [day, month, year] = dateStr.split("-");
  const monthIndex = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ].indexOf(month);

  if (monthIndex === -1 || !day || !year) {
    console.error("Invalid date format:", dateStr);
    return null;
  }

  return new Date(2000 + parseInt(year, 10), monthIndex, parseInt(day, 10));
};

const EventCards = ({ rows, onFilterChange, filters }) => {
  // Filtered rows logic
  const filteredRows = rows.filter((row) => {
    const { leadDate, status, followupDate } = filters;

    const matchesLeadDate =
      !leadDate || new Date(row.LeadDate).toDateString() === leadDate.toDateString();

    const matchesStatus = !status || row.Status === status;

    const matchesFollowupDate =
      !followupDate ||
      (parseFollowupDate(row.FollowupDate)?.toDateString() ===
        followupDate.toDateString());

    return matchesLeadDate && matchesStatus && matchesFollowupDate;
  });

  return (
    <div className="p-4">
      {/* Filter Bar */}
      <div className="bg-gray-100 p-4 rounded-md shadow-sm mb-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Lead Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lead Date
            </label>
            <DatePicker
              selected={filters.leadDate}
              onChange={(date) => onFilterChange("leadDate", date)}
              placeholderText="Select Lead Date"
              className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status || ""}
              onChange={(e) => onFilterChange("status", e.target.value)}
              className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All</option>
              {availableStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Follow-Up Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Follow-Up Date
            </label>
            <DatePicker
              selected={filters.followupDate}
              onChange={(date) => onFilterChange("followupDate", date)}
              placeholderText="Select Follow-Up Date"
              className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredRows.map((row) => (
          <div
            key={row.SNo}
            className="bg-white shadow-md rounded-lg p-4 border border-gray-200"
          >
            <div className="mb-2">
              <h3 className="text-lg font-bold text-gray-900">
                {toTitleCase(row.Name)} - {row.CompanyName}
              </h3>
            </div>
            <div className="text-sm text-gray-700 mb-2">
              <p>
                <strong>Lead Date:</strong> {row.LeadDate}
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
                <strong>Platform:</strong> {row.Platform}
              </p>
            </div>
            <div className="text-sm mb-2">
              <span
                className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusColors[row.Status]}`}
              >
                {row.Status}
              </span>
            </div>
            <div className="text-sm">
              <p
                className={`${
                  parseFollowupDate(row.FollowupDate) < new Date()
                    ? "text-red-500"
                    : "text-gray-900"
                }`}
              >
                <strong>Follow-Up Date:</strong> {row.FollowupDate}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventCards;

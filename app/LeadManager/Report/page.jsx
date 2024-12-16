import React from "react";

// Reusable Card Component
const LeadCard = ({ lead, index }) => {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-4 flex flex-col gap-4 relative">
      {/* Date and Time in the top-right corner */}
      <div className="absolute top-2 right-2 text-sm md:text-base text-gray-500">
        <div>{lead.date}</div>
        <div>{lead.time}</div>
      </div>

      {/* Lead Title */}
      <h2 className="text-md md:text-xl font-semibold text-blue-500">Lead #{index + 1}</h2>

      {/* Additional Lead Information */}
      <div className="mt-2 text-gray-700 text-sm md:text-base">
        <p><strong>Platform:</strong> {lead.platform}</p>
        <p><strong>Name:</strong> {lead.name}</p>
        <p><strong>Phone Number:</strong> {lead.phoneNumber}</p>
        <p><strong>Status:</strong> {lead.status}</p>
        <p><strong>Status Change Date:</strong> {lead.statusChangeDate}</p>
        <p><strong>Previous Status:</strong> {lead.previousStatus}</p>
        <p><strong>Status Changed Time:</strong> {lead.statusChangedTime}</p>
        <p><strong>TAT:</strong> {lead.tat}</p>
      </div>
    </div>
  );
};

const LeadReport = () => {
  // Example data for leads
  const leads = [
    {
      sNo: 1,
      date: "12-12-2024",
      time: "10:30 AM",
      platform: "Web",
      name: "John Doe",
      phoneNumber: "+1 234 567 890",
      status: "Active",
      statusChangeDate: "11-12-2024",
      previousStatus: "Pending",
      statusChangedTime: "09:45 AM",
      tat: 58.56,
    },
    {
      sNo: 2,
      date: "12-12-2024",
      time: "11:15 AM",
      platform: "Mobile",
      name: "Jane Smith",
      phoneNumber: "+1 345 678 901",
      status: "In Progress",
      statusChangeDate: "11-12-2024",
      previousStatus: "Pending",
      statusChangedTime: "10:00 AM",
      tat: 60.12,
    },
    {
      sNo: 3,
      date: "12-12-2024",
      time: "12:00 PM",
      platform: "App",
      name: "Alice Johnson",
      phoneNumber: "+1 456 789 012",
      status: "Completed",
      statusChangeDate: "11-12-2024",
      previousStatus: "In Progress",
      statusChangedTime: "11:00 AM",
      tat: 45.67,
    },
    {
      sNo: 4,
      date: "12-12-2024",
      time: "01:45 PM",
      platform: "Web",
      name: "Bob Williams",
      phoneNumber: "+1 567 890 123",
      status: "Pending",
      statusChangeDate: "11-12-2024",
      previousStatus: "New",
      statusChangedTime: "12:30 PM",
      tat: 50.89,
    },
  ];

  return (
    <div className="p-4">
      {/* Title */}
      <div className="p-3 mt-2">
        <h2 className="text-xl font-semibold text-blue-500 mb-6">Lead Report</h2>
        <p className="text-gray-600">A detailed overview of lead information and statuses.</p>
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
        {leads.map((lead, index) => (
          <LeadCard key={index} lead={lead} index={index} />
        ))}
      </div>
    </div>
  );
};

export default LeadReport;

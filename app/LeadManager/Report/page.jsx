import React from "react";

// Reusable Card Component
const LeadCard = ({ lead, index }) => {
  return (
    <div className="relative bg-slate-200 rounded-lg p-4  shadow-md border border-gray-200 overflow-hidden">

  <div className="flex flex-row-reverse justify-between items-center">
  {/* Date and Time (Top Right Corner) */}
  <div className="  flex  text-xs md:text-sm text-black text-right  mb-7 gap-2">
    <div className="bg-blue-200 p-2 border rounded-lg ">{lead.date}</div>
    <div className="bg-blue-200 p-2 border rounded-lg">{lead.time}</div>
    <div className="bg-yellow-200 p-2 border rounded-lg">{lead.status}</div>
  </div>

  {/* Lead Title */}
  <h2 className="text-lg md:text-2xl font-bold text-blue-600  relative mb-7">
    Lead #{index + 1}
  </h2>
  </div>

  {/* Information Grid */}
  <div className="grid grid-cols-1  gap-4  text-sm md:text-base  text-gray-700 mt-2 relative ">
  <div className="flex items-center gap-2 justify-center  text-black bg-blue-100 p-3 border border-blue-600 rounded-md  "> 
  <span className="font-semibold text-black">TAT:</span>
  <span className="text-black font-bold">{lead.tat}</span>
</div>
  </div>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4  text-sm md:text-base  text-gray-700 mt-2 relative ">
    <div className="flex items-center gap-2 bg-gray-50 p-2  rounded-md ">
      <span className="font-semibold text-gray-600">Platform:</span>
      <span>{lead.platform}</span>
    </div>
    <div className="flex items-center gap-2 bg-gray-50 p-2  rounded-md">
      <span className="font-semibold text-gray-600">Name:</span>
      <span>{lead.name}</span>
    </div>
    <div className="flex items-center gap-2 bg-gray-50 p-2  rounded-md">
      <span className="font-semibold text-gray-600">Phone:</span>
      <span>{lead.phoneNumber}</span>
    </div>
    
    <div className="flex items-center gap-2 bg-gray-50 p-2  rounded-md">
      <span className="font-semibold text-gray-600">Prev Status:</span>
      <span>{lead.previousStatus}</span>
    </div>
    <div className="flex items-center gap-2 bg-gray-50 p-2  rounded-md">
      <span className="font-semibold text-gray-600">Status Changed:</span>
      <span>{lead.statusChangedTime}</span>
    </div>
    <div className="flex items-center gap-2 bg-gray-50 p-2  rounded-md">
      <span className="font-semibold text-gray-600">Change Date:</span>
      <span>{lead.statusChangeDate}</span>
    </div>
    {/* <div className="flex items-center gap-2 bg-yellow-100 p-2  rounded-md">
      <span className="font-semibold text-gray-600">Status:</span>
      <span>{lead.status}</span>
    </div> */}
    
  </div>

  {/* Decorative Line */}
  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
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
    <div className="p-4 ">
  {/* Title */}
  <div className="p-3 mt-2">
    <h2 className="text-xl font-semibold text-blue-500 mb-6">Lead Report</h2>
    <p className="text-gray-600">A detailed overview of lead information and statuses.</p>
  </div>

  {/* Summary Section */}
  <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-4">
    {/* Lead Count Card */}
    <div className="bg-slate-200  border-2 border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:justify-around items-center gap-4 md:gap-0">
      <h2 className="text-lg md:text-3xl font-semibold text-black ">Lead Count</h2>
      <div className="flex justify-center items-center h-16 md:h-24 w-16 md:w-24 border-2 border-blue-500 bg-blue-50 text-blue-600 font-bold text-md md:text-2xl rounded-full">
        <p>1000</p>
      </div>
    </div>

    {/* Average TAT Card */}
    <div className="bg-slate-200  border-2 border-gray-200 rounded-lg p-4 flex flex-col md:flex-row justify-around items-center gap-4 md:gap-0">
      <h2 className="text-lg md:text-3xl font-semibold text-black">Average TAT</h2>
      <div className="flex justify-center items-center h-16 md:h-24 w-16 md:w-24 border-2 border-blue-500 bg-blue-50 text-blue-600 font-bold text-md md:text-2xl rounded-full">
        <p>58.56</p>
      </div>
    </div>
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

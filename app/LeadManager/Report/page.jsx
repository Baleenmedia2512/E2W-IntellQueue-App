import React from "react";

import { Clock, Globe, Phone, RefreshCcw, User, Calendar } from "lucide-react";

const Leaddiv = ({ lead, index }) => {
  return (
    <div className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl border">
      <div className="md:p-6 p-2">
        {/* Header Section - Added icons for date and time */}
        <div className="flex justify-between items-center md:mb-6 mb-4">
          <div className="flex items-center">
            <span className="bg-blue-50 text-blue-700 font-semibold px-4 py-1.5 rounded-full md:text-base text-sm text-nowrap ">
              Lead #{index + 1}
            </span>
          </div>
          <div className="flex items-center md:gap-3 gap-1">
            <span className=" text-black px-4 py-1.5 rounded-full md:text-base text-sm text-nowrap border font-medium whitespace-nowrap flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              {lead.date}
            </span>
            <span className=" text-black px-4 py-1.5 rounded-full md:text-base text-sm text-nowrap border font-medium whitespace-nowrap flex items-center gap-2">
              <Clock className="w-3 h-3" />
              {lead.time}
            </span>
          </div>
        </div>

        {/* Rest of the component remains the same */}
        <div className="md:mb-6 mb-4">
          <div className={`flex justify-between items-center px-4 py-3 rounded-lg  ${
            lead.status === 'Active' ? 'bg-green-50 text-green-700' :
            lead.status === 'In Progress' ? 'bg-blue-50 text-blue-700' :
            lead.status === 'Completed' ? 'bg-purple-50 text-purple-700' :
            'bg-yellow-50 text-yellow-700'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full animate-pulse ${
                lead.status === 'Active' ? 'bg-green-500' :
                lead.status === 'In Progress' ? 'bg-blue-500' :
                lead.status === 'Completed' ? 'bg-purple-500' :
                'bg-yellow-500'
              }`}></div>
              <span className="font-semibold">{lead.status}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">TAT: {lead.tat}h</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:gap-4 gap-2">
          {[
            
            { icon: <User className="w-4 h-4 text-gray-500" />, label: "Name", value: lead.name },
            { icon: <Globe className="w-4 h-4 text-gray-500" />, label: "Platform", value: lead.platform },
            { icon: <Phone className="w-4 h-4 text-gray-500" />, label: "Phone", value: lead.phoneNumber },
            { icon: <RefreshCcw className="w-4 h-4 text-gray-500" />, label: "Previous Status", value: lead.previousStatus },
            { icon: <Clock className="w-4 h-4 text-gray-500" />, label: "Status Changed", value: lead.statusChangedTime },
            { icon: <Calendar className="w-4 h-4 text-gray-500" />, label: "Change Date", value: lead.statusChangeDate }
          ].map((item, i) => (
            <div key={i} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <div className="mt-1">{item.icon}</div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                <p className="font-medium text-gray-900">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const LeadReport = () => {
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
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      {/* Header Section */}
      <div className="space-y-3 mb-8">
        <h1 className="text-3xl font-semibold text-blue-500">Lead Report</h1>
        <p className="text-gray-500 text-lg">A detailed overview of lead information and statuses</p>
      </div>

      {/* Summary divs */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {[
          { title: "Total Leads", value: "1,000", icon: <User className="w-8 h-8 text-blue-700" /> },
          { title: "Average TAT", value: "58.56h", icon: <Clock className="w-8 h-8 text-blue-700" /> }
        ].map((item, i) => (
          <div key={i}>
            <div className="p-6 border rounded-xl bg-slate-50 shadow-sm">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">{item.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{item.value}</p>
                </div>
                <div className="p-4 bg-blue-100 rounded-full">
                  {item.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lead divs Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {leads.map((lead, index) => (
          <Leaddiv key={index} lead={lead} index={index} />
        ))}
      </div>
    </div>
  );
};

export default LeadReport;
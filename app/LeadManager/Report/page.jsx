import React from "react";

const LeadReport = () => {
  return (
    <div className="p-4">
  {/* Title */}
  <div className="p-3 mt-2">
    <h2 className="text-xl font-semibold text-blue-500 mb-6">Lead Report</h2>
  </div>
  
  {/* Cards Section */}
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
    {/* Card 1 */}
    <div className="bg-white border-2 border-gray-200 rounded-lg p-4 flex flex-col gap-4">
      <h2 className="text-md md:text-xl font-semibold text-blue-500">Lead Details</h2>
      <ul className="text-gray-700 text-sm md:text-base">
        <li><strong>S.No:</strong> 1</li>
        <li><strong>Date:</strong> 12-12-2024</li>
        <li><strong>Time:</strong> 10:30 AM</li>
        <li><strong>Platform:</strong> Web</li>
        <li><strong>Name:</strong> John Doe</li>
        <li><strong>Phone Number:</strong> +1 234 567 890</li>
        <li><strong>Status:</strong> Active</li>
        <li><strong>Status Change Date:</strong> 11-12-2024</li>
        <li><strong>Previous Status:</strong> Pending</li>
        <li><strong>Status Changed Time:</strong> 09:45 AM</li>
        <li><strong>TAT:</strong> 58.56</li>
      </ul>
    </div>

    {/* Card 2 */}
    <div className="bg-white border-2 border-gray-200 rounded-lg p-4 flex flex-col gap-4">
      <h2 className="text-md md:text-xl font-semibold text-blue-500">Lead Details</h2>
      <ul className="text-gray-700 text-sm md:text-base">
        <li><strong>S.No:</strong> 2</li>
        <li><strong>Date:</strong> 12-12-2024</li>
        <li><strong>Time:</strong> 11:15 AM</li>
        <li><strong>Platform:</strong> Mobile</li>
        <li><strong>Name:</strong> Jane Smith</li>
        <li><strong>Phone Number:</strong> +1 345 678 901</li>
        <li><strong>Status:</strong> In Progress</li>
        <li><strong>Status Change Date:</strong> 11-12-2024</li>
        <li><strong>Previous Status:</strong> Pending</li>
        <li><strong>Status Changed Time:</strong> 10:00 AM</li>
        <li><strong>TAT:</strong> 60.12</li>
      </ul>
    </div>

    {/* Card 3 */}
    <div className="bg-white border-2 border-gray-200 rounded-lg p-4 flex flex-col gap-4">
      <h2 className="text-md md:text-xl font-semibold text-blue-500">Lead Details</h2>
      <ul className="text-gray-700 text-sm md:text-base">
        <li><strong>S.No:</strong> 3</li>
        <li><strong>Date:</strong> 12-12-2024</li>
        <li><strong>Time:</strong> 12:00 PM</li>
        <li><strong>Platform:</strong> App</li>
        <li><strong>Name:</strong> Alice Johnson</li>
        <li><strong>Phone Number:</strong> +1 456 789 012</li>
        <li><strong>Status:</strong> Completed</li>
        <li><strong>Status Change Date:</strong> 11-12-2024</li>
        <li><strong>Previous Status:</strong> In Progress</li>
        <li><strong>Status Changed Time:</strong> 11:00 AM</li>
        <li><strong>TAT:</strong> 45.67</li>
      </ul>
    </div>

    {/* Card 4 */}
    <div className="bg-white border-2 border-gray-200 rounded-lg p-4 flex flex-col gap-4">
      <h2 className="text-md md:text-xl font-semibold text-blue-500">Lead Details</h2>
      <ul className="text-gray-700 text-sm md:text-base">
        <li><strong>S.No:</strong> 4</li>
        <li><strong>Date:</strong> 12-12-2024</li>
        <li><strong>Time:</strong> 01:45 PM</li>
        <li><strong>Platform:</strong> Web</li>
        <li><strong>Name:</strong> Bob Williams</li>
        <li><strong>Phone Number:</strong> +1 567 890 123</li>
        <li><strong>Status:</strong> Pending</li>
        <li><strong>Status Change Date:</strong> 11-12-2024</li>
        <li><strong>Previous Status:</strong> New</li>
        <li><strong>Status Changed Time:</strong> 12:30 PM</li>
        <li><strong>TAT:</strong> 50.89</li>
      </ul>
    </div>
  </div>
</div>

  );
};

export default LeadReport;
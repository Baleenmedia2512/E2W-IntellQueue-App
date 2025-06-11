import React from 'react';

const SourceCard = ({ title, icon, total, recent, color }) => {
  return (
    <div className={`bg-white p-4 rounded-lg shadow border-l-4 border-${color}-500 hover:shadow-lg transition-shadow`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className={`bg-${color}-100 p-2 rounded-full`}>
          {icon}
        </div>
      </div>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-sm text-gray-500">Total Leads</p>
          <p className="text-2xl font-bold text-gray-800">{total}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Last 24h</p>
          <p className={`text-lg font-semibold text-${color}-600`}>+{recent}</p>
        </div>
      </div>
    </div>
  );
};

export default SourceCard;
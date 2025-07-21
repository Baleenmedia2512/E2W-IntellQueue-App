// DateRangePicker.jsx
import React from 'react';
import { Calendar } from 'primereact/calendar';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const DateRangePicker = ({ startDate, endDate, onDateChange, isLoading = false }) => {
  const handleStartDateChange = (e) => {
    const newStartDate = e.value;
    // Reset endDate if newStartDate is after current endDate
    if (newStartDate && endDate && newStartDate.getTime() > endDate.getTime()) {
      onDateChange({ startDate: newStartDate, endDate: null });
    } else {
      onDateChange({ startDate: newStartDate, endDate });
    }
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.value;
    // Reset startDate if newEndDate is before current startDate
    if (newEndDate && startDate && newEndDate.getTime() < startDate.getTime()) {
      onDateChange({ startDate: null, endDate: newEndDate });
    } else {
      onDateChange({ startDate, endDate: newEndDate });
    }
  };

  return (
    
    <div className={`border p-4 w-44 h-36 rounded-md shadow-md relative ${isLoading ? 'opacity-70' : ''}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-md">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <label className="block text-xs font-medium text-gray-700 mb-1">From</label>
      <div className="mb-4">
      <Calendar
        value={startDate}
        onChange={handleStartDateChange}
        placeholder="Start Date"
        showIcon
        dateFormat="dd-M-yy"
        className="w-fit text-black-700"
        disabled={isLoading}
      />
      </div>
      <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
      <div>
      <Calendar
        value={endDate}
        onChange={handleEndDateChange}
        placeholder="End Date"
        showIcon
        dateFormat="dd-M-yy"
        className="w-fit text-black-700"
        disabled={isLoading}
      />
    </div>
    </div>
  );
};

export default DateRangePicker;

// DateRangePicker.jsx
import React from 'react';
import { Calendar } from 'primereact/calendar';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const DateRangePicker = ({ startDate, endDate, onDateChange }) => {
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
    <div className="border p-4 h-36 rounded-md shadow-md">
      <label className="block text-xs font-medium text-gray-700 mb-1">From</label>
      <div className="mb-4">
      <Calendar
        value={startDate}
        onChange={handleStartDateChange}
        placeholder="Start Date"
        showIcon
        dateFormat="dd-M-yy"
          className="w-full text-gray-700"
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
          className="w-full text-gray-500"
      />
    </div>
    </div>
  );
};

export default DateRangePicker;

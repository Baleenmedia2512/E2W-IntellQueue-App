// dateUtils.js
export const formatDateForAPI = (date) => {
    if (!date) return '';
    
    // Ensure we're working with a Date object
    const dateObj = new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date provided');
    }
  
    // Format date as YYYY-MM-DD
    return dateObj.toISOString().split('T')[0];
  };
  
  export const calculateValidityDays = (validTill) => {
    if (!validTill) return 0;
  
    try {
      // Parse the validity date and set to midnight
      const parsedValidityDate = new Date(validTill);
      parsedValidityDate.setHours(0, 0, 0, 0);
  
      // Get current date at midnight
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
  
      // Calculate difference in days
      const differenceInTime = parsedValidityDate.getTime() - currentDate.getTime();
      const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
  
      return differenceInDays;
    } catch (error) {
      console.error('Error calculating validity days:', error);
      return 0;
    }
  };
  
  export const addDaysToDate = (days) => {
    try {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      
      const daysToAdd = parseInt(days);
      if (isNaN(daysToAdd)) {
        throw new Error('Invalid number of days');
      }
  
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + daysToAdd);
      
      return formatDateForAPI(newDate);
    } catch (error) {
      console.error('Error adding days to date:', error);
      return '';
    }
  };
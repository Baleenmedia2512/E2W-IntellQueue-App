export const calculateMarginAmount = (
  qty,
  width,
  unit,
  unitPrice,
  campaignDuration,
  minimumCampaignDuration,
  marginPercentage,
  color, tick, bold, semibold
) => {
  // Calculate the base cost without additional costs
  let baseCost = parseFloat((unit === "SCM" ? qty * width : qty) * unitPrice * (campaignDuration / minimumCampaignDuration));

  // Handle marginPercentage >= 100 or invalid values
  if (marginPercentage >= 100 || marginPercentage <= 0) {
    return 0;
  }

  // Calculate margin amount based on base cost before additional costs
  const marginAmount = baseCost * (marginPercentage / 100);

  return parseFloat(marginAmount.toFixed(2)); // Keeping precision
};

export const calculateMarginPercentage = (
  qty,
  width,
  unit,
  unitPrice,
  campaignDuration,
  minimumCampaignDuration,
  marginAmount,
  color, tick, bold, semibold
) => {
  // Calculate the base cost without additional costs
  let baseCost = parseFloat((unit === "SCM" ? qty * width : qty) * unitPrice * (campaignDuration / minimumCampaignDuration));

  // Avoid division by zero
  if (baseCost === 0) return 0;

  // Calculate margin percentage based on base cost before additional costs
  const marginPercentage = (parseFloat(marginAmount) / baseCost) * 100;
  
  return parseFloat(marginPercentage.toFixed(2));
};

export const formatDBDate = (followupDate) => {
  const months = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
    Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
  };

  const isContainsDash = followupDate.includes("-");
  const [day, month, year] = isContainsDash ? followupDate.split("-") : followupDate.split(" "); // Split "02-Dec-2024"
  return `${year}-${months[month]}-${day.padStart(2, "0")}`; // Format: yyyy-MM-dd
};

export const formatDate = (followupDate) => {
  const months = {"01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr", "05": "May", "06": "Jun",
    "07": "Jul", "08": "Aug", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec",};

  const [year, month, day] = followupDate.split("-"); // Split "02-Dec-2024"
  return `${day.padStart(2, "0")}-${months[month]}-${year}`; // Format: yyyy-MM-dd
};

export const formatDBTime = (followupTime) => {
  let [time, modifier] = followupTime.split(" "); // Split "03:30 PM"
  let [hours, minutes] = time.split(":");

  if (modifier === "PM" && hours !== "12") {
    hours = String(parseInt(hours, 10) + 12);
  } else if (modifier === "AM" && hours === "12") {
    hours = "00";
  }

  return `${hours.padStart(2, "0")}:${minutes}`; // Format: HH:mm
};

export const formatTime = (followupTime) => {
  let [hours, minutes] = followupTime.split(":");
  let modifier = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours === 0 ? 12 : hours; // Convert hour "0" to "12"
   return `${hours}:${minutes} ${modifier}`; // Format: HH:mm AM/PM
}

/**
 * Converts a DB date string ("YYYY-MM-DD HH:MM:SS") into a readable date and time.
 *
 * @param {string} dbDateStr - The date string from the database.
 * @returns {{ formattedDate: string, formattedTime: string }} The formatted date and time.
 */
export function formatDBDateTime(dbDateStr) {
  if (!dbDateStr) return { formattedDate: '', formattedTime: '' };

  // Convert the DB date string to an ISO format date string
  // so that it can be parsed reliably.
  const isoDateStr = dbDateStr.replace(' ', 'T');
  const dateObj = new Date(isoDateStr);

  // Format the date: "25 Mar 2024"
  const day = dateObj.getDate();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  const formattedDate = `${day} ${month} ${year}`;

  // Format the time: "10 : 53 pm"
  let hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const period = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours === 0 ? 12 : hours; // Convert hour "0" to "12"
  
  // Ensure minutes have two digits (e.g., "03" for 3)
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
  const formattedTime = `${hours}:${formattedMinutes} ${period}`;

  return formattedDate + " " + formattedTime;
}

export const normalizeDate = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
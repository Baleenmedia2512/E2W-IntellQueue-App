export const calculateMarginAmount = (qty, width, unit, unitPrice, campaignDuration, minimumCampaignDuration, marginPercentage) => {
  // Calculate the cost
  const cost = (unit === "SCM" ? qty * width : qty) * unitPrice * (campaignDuration / minimumCampaignDuration);
  
  // Calculate the margin amount based on the correct formula
  const marginAmount = (cost * marginPercentage) / 100;

  return marginAmount.toFixed(0);
};
  
export const calculateMarginPercentage = (qty, width, unit, unitPrice, campaignDuration, minimumCampaignDuration, newMarginAmount) => {
  // Calculate the cost
  const cost = (unit === "SCM" ? qty * width : qty) * unitPrice * (campaignDuration / minimumCampaignDuration);
  
  // Calculate the margin percentage
  const marginPercentage = (newMarginAmount / cost) * 100;

  return marginPercentage.toFixed(1);
};

export const formatDBDate = (followupDate) => {
  const months = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
    Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
  };

  const [day, month, year] = followupDate.split("-"); // Split "02-Dec-2024"
  return `${year}-${months[month]}-${day.padStart(2, "0")}`; // Format: yyyy-MM-dd
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
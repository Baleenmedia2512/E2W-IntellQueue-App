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
  // Calculate the base cost
  let cost = parseFloat((unit === "SCM" ? qty * width : qty) * unitPrice * (campaignDuration / minimumCampaignDuration));

  // Add additional costs (color, tick, bold, semi-bold)
  if (color) {
    cost += cost * (color / 100);
  }
  if (tick) {
    cost += cost * (tick / 100);
  }
  if (bold) {
    cost += cost * (bold / 100);
  }
  if (semibold) {
    cost += cost * (semibold / 100);
  }

  // Handle marginPercentage >= 100
  if (marginPercentage >= 100) {
    return cost;
  }

  // Calculate margin amount using inverse formula
  let marginPerUnit =(((cost /(unit === "SCM" ? qty * width : qty))/(100 - marginPercentage))*100) - (unitPrice);
  const marginAmount = (marginPerUnit * (unit === "SCM" ? qty * width : qty));

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
  // Calculate the base cost
  let cost = parseFloat((unit === "SCM" ? qty * width : qty) * unitPrice * (campaignDuration / minimumCampaignDuration));

  // Add additional costs (color, tick, bold, semi-bold)
  if (color) {
    cost += cost * (color / 100);
  }
  if (tick) {
    cost += cost * (tick / 100);
  }
  if (bold) {
    cost += cost * (bold / 100);
  }
  if (semibold) {
    cost += cost * (semibold / 100);
  }

  // Avoid division by zero
  if (cost + parseFloat(marginAmount) === 0) return 0;

  // Calculate margin percentage using the correct formula
  const marginPercentage = ((parseFloat(marginAmount) / (cost + parseFloat(marginAmount))) * 100).toFixed(1);

  return parseFloat(marginPercentage);
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
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
  const marginAmount = (cost * parseFloat(marginPercentage)) / (100 - parseFloat(marginPercentage));

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

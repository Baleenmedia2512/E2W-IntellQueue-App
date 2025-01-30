export const calculateMarginAmount = (
  qty,
  width,
  unit,
  unitPrice,
  campaignDuration,
  minimumCampaignDuration,
  marginPercentage
) => {
  // Calculate the cost
  const cost = parseFloat((unit === "SCM" ? qty * width : qty) * unitPrice * (campaignDuration / minimumCampaignDuration));

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
  marginAmount
) => {
  // Calculate the cost
  const cost = parseFloat((unit === "SCM" ? qty * width : qty) * unitPrice * (campaignDuration / minimumCampaignDuration));

  // Avoid division by zero
  if (cost + parseFloat(marginAmount) === 0) return 0;

  // Calculate margin percentage using the correct formula
  const marginPercentage = ((parseFloat(marginAmount) / (cost + parseFloat(marginAmount))) * 100).toFixed(1);

  return parseFloat(marginPercentage);
};

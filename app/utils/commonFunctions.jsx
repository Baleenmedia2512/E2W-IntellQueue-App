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
export const calculateMarginAmount = (qty, width, unit, unitPrice, campaignDuration, minimumCampaignDuration, marginPercentage) => {
    const cost = parseInt(
      (unit === "SCM" ? qty * width : qty) * unitPrice * (campaignDuration / minimumCampaignDuration)
    );
    return ((cost * marginPercentage) / (100 - marginPercentage)).toFixed(0);
  };
  
  export const calculateMarginPercentage = (qty, width, unit, unitPrice, campaignDuration, minimumCampaignDuration, newMarginAmount) => {
    const cost = parseInt(
      (unit === "SCM" ? qty * width : qty) * unitPrice * (campaignDuration / minimumCampaignDuration)
    );
    return ((newMarginAmount / (cost + newMarginAmount)) * 100).toFixed(1);
};  
<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';
// if($dbName !== 'Grace Scans' && $dbName !== 'Baleen Media'){
//     $dbName = 'Baleen Media';
// }
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
    $EntryUser = $_GET['JsonEntryUser'];
    $RateName = $_GET['JsonRateName'];
    $VendorName = $_GET['JsonVendorName'];
    $RateGST = $_GET['JsonRateGST'];
    $AdType = isset($_GET['JsonAdType']) ? $_GET['JsonAdType']: '';
    $AdCategory = isset($_GET['JsonAdCategory']) ? $_GET['JsonAdCategory'] : '';
    $ValidityDate = $_GET['JsonValidityDate'];
    $CampaignDuration = isset($_GET['JsonCampaignDuration']) ? $_GET['JsonCampaignDuration'] : '';
    $CampaignDurationUnit = isset($_GET['JsonCampaignDurationUnit']) ? $_GET['JsonCampaignDurationUnit'] : "";
    $LeadDay = isset($_GET['JsonLeadDays']) ? $_GET['JsonLeadDays'] : '';
    $Units = isset($_GET['JsonUnits']) ? $_GET['JsonUnits'] : '';
    $Quantity = isset($_GET['JsonQuantity']) ? $_GET['JsonQuantity'] : "";
    $CampaignDurationVisibility = isset($_GET['JsonCampaignDurationVisibility']) ? $_GET['JsonCampaignDurationVisibility'] : 0;
    $TypeOfAd = isset($_GET['JsonTypeOfAd']) ? $_GET['JsonTypeOfAd'] : '';
    $Location = isset($_GET['JsonLocation']) ? $_GET['JsonLocation'] : '';
    $Package = isset($_GET['JsonPackage']) ? $_GET['JsonPackage'] : '';
    $RatePerUnit = isset($_GET['JsonRatePerUnit']) ? $_GET['JsonRatePerUnit'] : '';
    $AgencyCommission = isset($_GET['JsonAgencyCommission']) ? $_GET['JsonAgencyCommission'] : 0;
    $Width = isset($_GET['JsonWidth']) ? $_GET['JsonWidth'] : 1;
    // $AdCategory = $JsonLocation . ': ' . $JsonPosition;

  function FetchRateId(){
    try{
        global $pdo;
        $stmt = $pdo->prepare("SELECT MAX(`RateID`) AS max_rate_id FROM rate_table");
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result && isset($result['max_rate_id'])) {
            return $result['max_rate_id'];
        } else {
            return 0; // If no RateID is found, start from 0
        }
    } catch (PDOException $e) {
        echo json_encode("Error fetching rates data: " . $e->getMessage());
        return 0; // Return 0 on error
    }
}

$RateID = FetchRateId() + 1;
$SearchTerm = "";
$SearchTerm = $RateID." - ".$RateName 
                . ($TypeOfAd !== "" ? " - " . $TypeOfAd : "")
                . " - " . $AdType 
                . ($Location !== "" ? " - " . $Location : "")
                . ($Package !== "" ? " - " . $Package : "")
                . (" - ₹" .$RatePerUnit);


    $stmt = $pdo->prepare("INSERT INTO rate_table(`rateName`, `vendorName`, `rategst`, `adType`, `adCategory`, `entryDate`, `entryUser`, `ApprovedStatus`, `maximumMarginInPercentage`, `ValidityDate`, `CampaignDuration(in Days)`, `CampaignDurationUnit`, `typeOfAd`, `LeadDays`, `campaignDurationVisibility`, `minimumUnit`, `width`, `Units`, `Location`, `Package`,`ratePerUnit`, `AgencyCommission`, `SearchTerm`) VALUES(:rateNamePDO, :vendorNamePDO, :rateGstPDO, :adTypePDO, :adCategoryPDO, CURRENT_DATE, :entryUserPDO, 'Approved', 100, :validityDatePDO, :campaignDurationPDO, :campaignDurationUnitPDO, :typeOfAdPDO, :leadDaysPDO, :campaignDurationVisibilityPDO, :minimumUnitPDO, :widthPDO, :unitsPDO, :locationPDO, :packagePDO, :ratePerUnitPDO, :PDOAgencyCommission, :PDOSearchTerm)");
    $stmt->bindParam(":entryUserPDO", $EntryUser);
    $stmt->bindParam(":rateNamePDO", $RateName);
    $stmt->bindParam(":vendorNamePDO", $VendorName);
    $stmt->bindParam(":rateGstPDO", $RateGST);
    $stmt->bindParam(":adTypePDO", $AdType);
    $stmt->bindParam(":adCategoryPDO", $AdCategory);
    $stmt->bindParam(":validityDatePDO", $ValidityDate);
    $stmt->bindParam(":campaignDurationPDO", $CampaignDuration);
    $stmt->bindParam(":campaignDurationUnitPDO", $CampaignDurationUnit);
    $stmt->bindParam(":leadDaysPDO", $LeadDay);
    $stmt->bindParam(":campaignDurationVisibilityPDO", $CampaignDurationVisibility); // Add a semicolon here
    $stmt->bindParam(":minimumUnitPDO", $Quantity);
    $stmt->bindParam(":widthPDO", $Width);
    $stmt->bindParam(":unitsPDO", $Units);
    $stmt->bindParam(":typeOfAdPDO", $TypeOfAd);
    $stmt->bindParam(":locationPDO", $Location);
    $stmt->bindParam(":packagePDO", $Package);
    $stmt->bindParam(":ratePerUnitPDO", $RatePerUnit);
    $stmt->bindParam(":PDOAgencyCommission", $AgencyCommission);
    $stmt->bindParam(":PDOSearchTerm", $SearchTerm);
    $stmt->execute();

    echo json_encode("Inserted Successfully!");
    	
	} catch(PDOException $e) {
    	echo json_encode("Error inserting data: ".$e->getMessage());
}
?>
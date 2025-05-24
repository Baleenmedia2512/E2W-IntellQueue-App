<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
    // Assume you have the RateId from somewhere, replace 'your_rate_id_here' with the actual value
    $rateId = $_GET['JsonRateId'];
    $vendorName = isset($_GET['JsonVendorName']) ? $_GET['JsonVendorName'] : '';
    $campaignDuration = isset($_GET['JsonCampaignDuration']) ? $_GET['JsonCampaignDuration'] : 0;
    $campaignUnit = isset($_GET['JsonCampaignUnit']) ? $_GET['JsonCampaignUnit'] : '';
    $leadDays = isset($_GET['JsonLeadDays']) ? $_GET['JsonLeadDays'] : 1;
    $validityDatePDO = isset($_GET['JsonValidityDate']) ? $_GET['JsonValidityDate'] : '';
    $campaignVisibility = isset($_GET['JsonCampaignDurationVisibility']) ? $_GET['JsonCampaignDurationVisibility'] : 0;
    $RateGST = isset($_GET['JsonRateGST']) ? $_GET['JsonRateGST'] : '';
    $Unit = isset($_GET['JsonUnit']) ? $_GET['JsonUnit'] : '';
    $AgencyCommission = isset($_GET['JsonAgencyCommission']) ? $_GET['JsonAgencyCommission'] : 0;
    $RatePerUnit = isset($_GET['JsonRatePerUnit']) ? $_GET['JsonRatePerUnit'] : '';
    $MinimumUnit = isset($_GET['JsonStartQty']) ? $_GET['JsonStartQty'] : 0;
    $Width = isset($_GET['JsonWidth']) ? $_GET['JsonWidth'] : 1;

    function FetchRateSearchTerms($rateId){
        try{
            global $pdo;
            $stmt = $pdo->prepare("SELECT `rateName`, `typeOfAd`, `adType`, `Location`, `Package` FROM rate_table WHERE `RateID` = :rateIdPDO");
            $stmt->bindParam(':rateIdPDO', $rateId);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (count($result) > 0) {
                //echo json_encode($result[0]);
                return $result[0];
            } else {
                //echo json_encode([]);
                return [];
            }
        } catch (PDOException $e) {
            echo json_encode("Error fetching rates data: " . $e->getMessage());
            return [];
        }
    }

    $Rate = FetchRateSearchTerms($rateId);
    
    if (!empty($Rate) && !isset($Rate["error"])) {
        $rateName = isset($Rate['rateName']) ? $Rate['rateName'] : '';
        $typeOfAd = isset($Rate['typeOfAd']) ? $Rate['typeOfAd'] : '';
        $adType = isset($Rate['adType']) ? $Rate['adType'] : '';
        $location = isset($Rate['Location']) ? $Rate['Location'] : '';
        $package = isset($Rate['Package']) ? $Rate['Package'] : '';
        
        $SearchTerm = $rateId." - ".$rateName 
                    . ($typeOfAd !== "" ? " - " . $typeOfAd : "")
                    . " - " . $adType 
                    . ($location !== "" ? " - " . $location : "")
                    . ($package !== "" ? " - " . $package : "")
                    . ($RatePerUnit !== "" ? " - ₹" .$RatePerUnit : "");

        // echo json_encode([
        //     "SearchTerm" => $SearchTerm,
        //     "Rate" => $Rate
        // ]);
    } else {
        echo json_encode("Error in rates ".$Rate);
    }

    if (!isset($_GET['JsonCampaignDurationVisibility'])) {
        $campaignVisibility = $campaignDuration > 0;
    }

//Updating data into Database
   try {
       $stmt = $pdo->prepare("UPDATE rate_table
       SET vendorName = :vendorNamePDO, `CampaignDuration(in Days)` = :campaignDurationPDO, CampaignDurationUnit = :campaignDurationUnitPDO,  LeadDays = :leadDaysPDO, ValidityDate = :validityDatePDO, campaignDurationVisibility = :campignDurationVisibilityPDO, rategst = :rateGSTPDO, Units = :unitPDO, AgencyCommission = :PDOAgencyCommission, `SearchTerm` = :PDOSearchTerm, `ratePerUnit` = :ratePerUnitPDO, `MinimumUnit` = :PDOMinimumUnit, `width` = :PDOWidth WHERE RateID = :rateIdPDO");
       $stmt->bindParam(':rateIdPDO', $rateId);
       $stmt->bindParam(':vendorNamePDO', $vendorName);
       $stmt->bindParam(':campaignDurationPDO', $campaignDuration);
       $stmt->bindParam(':campaignDurationUnitPDO', $campaignUnit);
       $stmt->bindParam(':leadDaysPDO', $leadDays);
       $stmt->bindParam(':validityDatePDO', $validityDatePDO);
       $stmt->bindParam(":campignDurationVisibilityPDO", $campaignVisibility);
       $stmt->bindParam(":rateGSTPDO", $RateGST);
       $stmt->bindParam(":unitPDO", $Unit);
       $stmt->bindParam(":ratePerUnitPDO", $RatePerUnit);
       $stmt->bindParam(":PDOAgencyCommission", $AgencyCommission);
       $stmt->bindParam(":PDOSearchTerm", $SearchTerm);
       $stmt->bindParam(":PDOMinimumUnit", $MinimumUnit);
       $stmt->bindParam(":PDOWidth", $Width);
       $stmt->execute();

       $rowsUpdated = $stmt->rowCount();

       if ($rowsUpdated > 0) {
           echo json_encode(["message" => "Updated Successfully!", "rowsUpdated" => $rowsUpdated]);
       } else {
           echo json_encode(["message" => "No rows updated. Rate ID: " . $rateId . ". Minimum Unit: " .$MinimumUnit]);
       }
   } catch (PDOException $e) {
       echo json_encode(["error" => "Error updating data " .$e->getMessage()]);
   }

} catch (PDOException $e) {
    echo json_encode(["error" => "Error calling stored procedure: " . $e->getMessage()]);
}
?>
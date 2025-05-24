<?php
require 'ConnectionManager.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    $dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    // Retrieve parameters
    $rateId = $_GET['JsonRateId'] ?? null;
    $vendorName = $_GET['JsonVendorName'] ?? '';
    $rateName = $_GET['JsonRateName'] ?? '';
    $rateGST = $_GET['JsonRateGST'] ?? '';
    $adType = $_GET['JsonAdType'] ?? '';
    $adCategory = $_GET['JsonAdCategory'] ?? '';
    $validityDate = $_GET['JsonValidityDate'] ?? '';
    $campaignDuration = $_GET['JsonCampaignDuration'] ?? 0;
    $campaignDurationUnit = $_GET['JsonCampaignDurationUnit'] ?? '';
    $leadDays = $_GET['JsonLeadDays'] ?? 1;
    $campaignVisibility = $_GET['JsonCampaignDurationVisibility'] ?? 0;
    $unit = $_GET['JsonUnits'] ?? '';
    $ratePerUnit = $_GET['JsonRatePerUnit'] ?? '';
    $agencyCommission = $_GET['JsonAgencyCommission'] ?? 0;
    $minimumUnit = $_GET['JsonStartQty'] ?? 0;
    $width = $_GET['JsonWidth'] ?? 1;
    $location = $_GET['JsonLocation'] ?? '';
    $package = $_GET['JsonPackage'] ?? '';
    $typeOfAd = $_GET['JsonTypeOfAd'] ?? '';

    if (!$rateId) {
        echo json_encode(['error' => 'Rate ID is required']);
        exit;
    }

    // Fetch existing data to construct the SearchTerm
    function FetchRateSearchTerms($rateId) {
        global $pdo;
        try {
            $stmt = $pdo->prepare("
                SELECT `rateName`, `typeOfAd`, `adType`, `Location`, `Package` 
                FROM rate_table 
                WHERE `RateID` = :rateId
            ");
            $stmt->bindParam(':rateId', $rateId, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
        } catch (PDOException $e) {
            echo json_encode(["error" => "Error fetching data: " . $e->getMessage()]);
            return [];
        }
    }

    $Rate = FetchRateSearchTerms($rateId);

    // Construct the SearchTerm using updated parameters
$SearchTerm = $rateId . " - " . $rateName .
    (!empty($typeOfAd) ? " - " . $typeOfAd : '') .
    " - " . $adType .
    (!empty($location) ? " - " . $location : '') .
    (!empty($package) ? " - " . $package : '') .
    (!empty($ratePerUnit) ? " - ₹" . $ratePerUnit : '');


    // Update the rate_table with the new data and SearchTerm
    $stmt = $pdo->prepare("
        UPDATE rate_table
        SET vendorName = :vendorName, 
            rateName = :rateName, 
            rategst = :rateGST, 
            adType = :adType, 
            adCategory = :adCategory, 
            `CampaignDuration(in Days)` = :campaignDuration, 
            CampaignDurationUnit = :campaignDurationUnit, 
            LeadDays = :leadDays, 
            ValidityDate = :validityDate, 
            campaignDurationVisibility = :campaignVisibility, 
            Units = :unit, 
            AgencyCommission = :agencyCommission, 
            RatePerUnit = :ratePerUnit, 
            minimumUnit = :minimumUnit, 
            Width = :width,
            Location = :location,
            Package = :package,
            TypeOfAd = :typeOfAd,
            SearchTerm = :searchTerm
        WHERE RateID = :rateId
    ");

    $stmt->execute([
        ':vendorName' => $vendorName,
        ':rateName' => $rateName,
        ':rateGST' => $rateGST,
        ':adType' => $adType,
        ':adCategory' => $adCategory,
        ':campaignDuration' => $campaignDuration,
        ':campaignDurationUnit' => $campaignDurationUnit,
        ':leadDays' => $leadDays,
        ':validityDate' => $validityDate,
        ':campaignVisibility' => $campaignVisibility,
        ':unit' => $unit,
        ':agencyCommission' => $agencyCommission,
        ':ratePerUnit' => $ratePerUnit,
        ':minimumUnit' => $minimumUnit,
        ':width' => $width,
        ':location' => $location,
        ':package' => $package,
        ':typeOfAd' => $typeOfAd,
        ':searchTerm' => $SearchTerm,
        ':rateId' => $rateId,
    ]);

    echo json_encode(['success' => true, 'message' => 'Rate updated successfully']);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>

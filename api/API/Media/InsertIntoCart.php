<?php
require 'ConnectionManager.php';

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: *");
header('Content-Type: application/json');

$inputJSON = file_get_contents("php://input");
$input = json_decode($inputJSON, true);

if (!$input) {
    echo json_encode(["success" => false, "message" => "Invalid JSON input"]);
    exit;
}

$dbName = isset($input['JsonDBName']) ? $input['JsonDBName'] : 'Baleen Test';
ConnectionManager::connect($dbName);
$pdo = ConnectionManager::getConnection();

try {

    $sql = "INSERT INTO cart_table (
                `CartID`, `EntryDateTime`, `AdMedium`, `adType`, `adCategory`, `Quantity`, `Width`, `Units`, `Scheme`, 
                `Bold`, `SemiBold`, `Tick`, `Color`, `Paid%`, `AmountwithoutGst`, `Amount`, `GSTAmount`, `GST%`, 
                `Offers`, `entryUser`, `Valid Status`, `Sent`, `rateperunit`, `ImageId`, `Remarks`, `DateOfRelease`, 
                `CampaignDays`, `SpotsPerDay`, `SpotDuration`, `DiscountAmount`, `Margin`, `Vendor`, `CampaignDurationUnits`, `RateId`,`Edition`, `Package`
            ) 
            VALUES (
                NULL, CURRENT_TIMESTAMP(), :PDORateName, :PDOAdType, :PDOAdCategory, :PDOQuantity, :PDOWidth, 
                :PDOUnits, :PDOScheme, :PDOBold, :PDOSemibold, :PDOTick, :PDOColor, 0, :PDOAmountWithoutGST, 
                :PDOAmount, :PDOGstAmount, :PDOGstPercentage, '', :PDOEntryUser, 'Valid', 0, :PDORatePerUnit, 
                0, :PDORemarks, '0000-00-00', :PDOCampaignDuration, :PDOSpotsPerDay, :PDOSpotDuration, 
                :PDODiscountAmount, :PDOMargin, :PDOVendor, :PDOCampaignUnits, :PDORateId, :PDOEdition, :PDOPackage 
            )";

    $stmt = $pdo->prepare($sql);

  
    $stmt->execute([
        ':PDORateName' => $input['JsonRateName'] ?? '',
        ':PDOAdType' => $input['JsonAdType'] ?? '',
        ':PDOAdCategory' => $input['JsonAdCategory'] ?? '',
        ':PDOQuantity' => $input['JsonQuantity'] ?? 0,
        ':PDOWidth' => $input['JsonWidth'] ?? 0,
        ':PDOUnits' => $input['JsonUnits'] ?? '',
        ':PDOScheme' => $input['JsonScheme'] ?? '1 + 0',
        ':PDOBold' => $input['JsonBold'] ?? 0,
        ':PDOSemibold' => $input['JsonSemibold'] ?? 0,
        ':PDOTick' => $input['JsonTick'] ?? 0,
        ':PDOColor' => $input['JsonColor'] ?? 0,
        ':PDOAmountWithoutGST' => $input['JsonAmountWithoutGST'] ?? 0,
        ':PDOAmount' => $input['JsonAmount'] ?? 0,
        ':PDOGstAmount' => $input['JsonGSTAmount'] ?? 0,
        ':PDOGstPercentage' => $input['JsonGSTPercentage'] ?? 0,
        ':PDOEntryUser' => $input['JsonEntryUser'] ?? '',
        ':PDORatePerUnit' => $input['JsonRatePerUnit'] ?? 0,
        ':PDORemarks' => $input['JsonRemarks'] ?? '',
        ':PDOCampaignDuration' => $input['JsonCampaignDuration'] ?? 0,
        ':PDOSpotsPerDay' => $input['JsonSpotsPerDay'] ?? 0,
        ':PDOSpotDuration' => $input['JsonSpotDuration'] ?? 0,
        ':PDODiscountAmount' => $input['JsonDiscountAmount'] ?? 0,
        ':PDOMargin' => $input['JsonMargin'] ?? '',
        ':PDOVendor' => $input['JsonVendor'] ?? '',
        ':PDOCampaignUnits' => $input['JsonCampaignUnits'] ?? '',
        ':PDORateId' => $input['JsonRateId'] ?? '',
        ':PDOEdition' => $input['JsonEdition'] ?? '',
        ':PDOPackage' => $input['JsonPackage'] ?? '',
        
    ]);

    echo json_encode(["success" => true, "message" => "Cart Inserted Successfully!"]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Error inserting data: " . $e->getMessage()]);
}
?>
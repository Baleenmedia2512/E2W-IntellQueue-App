<?php
require 'ConnectionManager.php';

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: *");
header('Content-Type: application/json');

// Decode JSON input
$inputJSON = file_get_contents("php://input");
$input = json_decode($inputJSON, true);

if (!$input) {
    echo json_encode(["success" => false, "message" => "Invalid JSON input"]);
    exit;
}

$dbName = isset($input['JsonDBName']) ? $input['JsonDBName'] : 'Baleen Test';
$entryUser = isset($input['JsonEntryUser']) ? $input['JsonEntryUser'] : '';
$cartId = isset($input['JsonCartID']) ? $input['JsonCartID'] : '';

if (empty($dbName) || empty($entryUser) || empty($cartId)) {
    echo json_encode(["success" => false, "message" => "JsonDBName, JsonEntryUser, and JsonCartID are required"]);
    exit;
}

ConnectionManager::connect($dbName);
$pdo = ConnectionManager::getConnection();

try {
  
    $checkSql = "SELECT COUNT(*) FROM cart_table WHERE cartId = :PDOCartId AND entryUser = :PDOEntryUser";
    $checkStmt = $pdo->prepare($checkSql);
    $checkStmt->execute([
        ':PDOCartId' => $cartId,
        ':PDOEntryUser' => $entryUser
    ]);
    $itemExists = $checkStmt->fetchColumn();

    if ($itemExists > 0) {

        $updateSql = "UPDATE cart_table 
                      SET AdMedium = :PDOAdMedium, adType = :PDOAdType, adCategory = :PDOAdCategory, 
                          Edition = :PDOEdition, Package = :PDOPackage, Vendor = :PDOVendor, 
                          Quantity = :PDOQuantity, Width = :PDOWidth, Units = :PDOUnits, 
                          rateperunit = :PDORatePerUnit, AmountwithoutGst = :PDOAmountWithoutGST, 
                          Amount = :PDOAmount, GSTAmount = :PDOGstAmount, `GST%` = :PDOGstPercentage, 
                          CampaignDurationUnits = :PDOCampaignDurationUnits,
                          Bold = :PDOBold, SemiBold = :PDOSemiBold, 
                          Color = :PDOColor,
                          Tick = :PDOTick, Remarks = :PDORemarks, 
                          `Valid Status` = 'Valid' 
                      WHERE cartId = :PDOCartId AND entryUser = :PDOEntryUser";
        
        $updateStmt = $pdo->prepare($updateSql);
        $updateStmt->execute([
            ':PDOAdMedium' => $input['JsonAdMedium'] ?? '',
            ':PDOAdType' => $input['JsonAdType'] ?? '',
            ':PDOAdCategory' => $input['JsonAdCategory'] ?? '',
            ':PDOEdition' => $input['JsonEdition'] ?? '',
            ':PDOPackage' => $input['JsonPackage'] ?? '',
            ':PDOVendor' => $input['JsonVendor'] ?? '',
            ':PDOQuantity' => $input['JsonQuantity'] ?? 0,
            ':PDOWidth' => $input['JsonWidth'] ?? 0,
            ':PDOUnits' => $input['JsonUnits'] ?? '',
            ':PDORatePerUnit' => $input['JsonRatePerUnit'] ?? 0,
            ':PDOAmountWithoutGST' => $input['JsonAmountWithoutGST'] ?? 0,
            ':PDOAmount' => $input['JsonAmount'] ?? 0,
            ':PDOGstAmount' => $input['JsonGSTAmount'] ?? 0,
            ':PDOGstPercentage' => $input['JsonGSTPercentage'] ?? 0,
            ':PDOCampaignDurationUnits' => $input['JsonCampaignDurationUnits'] ?? '',
            ':PDOBold' => $input['JsonBold'] ?? 0,
            ':PDOSemiBold' => $input['JsonSemiBold'] ?? 0,
            ':PDOColor' => $input['JsonColor'] ?? 0,
            ':PDOTick' => $input['JsonTick'] ?? 0,
            ':PDORemarks' => $input['JsonRemarks'] ?? '',
            ':PDOCartId' => $cartId,
            ':PDOEntryUser' => $entryUser
        ]);

        echo json_encode(["success" => true, "message" => "Cart item updated successfully!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Cart item not found"]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Error updating data: " . $e->getMessage()]);
}
?>

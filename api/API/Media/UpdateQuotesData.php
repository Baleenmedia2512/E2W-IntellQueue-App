<?php
require 'ConnectionManager.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

//set default database name and validate it
$dbName = $_GET['JsonDBName'] ?? 'No DB';

if($dbName === 'No DB'){
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "No Database Found"]);
    exit;
} 

function UpdateCart($conn, $params){
    try {     
        $stmt = $conn->prepare("UPDATE cart_table SET `AdMedium` = :PDORateName, `adType` = :PDOAdType, `adCategory` = :PDOAdCategory, `Quantity` = :PDOQuantity, `Width` = :PDOWidth, `Units` = :PDOUnits, `Scheme` = :PDOScheme, `Bold` = :PDOBold, `SemiBold` = :PDOSemiBold, `Tick` = :PDOTick, `Color` = :PDOColor, `AmountwithoutGst` = :PDOAmountWithoutGST, `Amount` = :PDOAmount, `GSTAmount` = :PDOGstAmount, `GST%` = :PDOGstPercentage, `Offers` = :PDOOffers, `Sent` = 1, `rateperunit` = :PDORatePerUnit, `Remarks` = :PDORemarks, `CampaignDays` = :PDOCampaignDuration, `SpotsPerDay` = :PDOSpotsPerDay, `SpotDuration` = :PDOSpotDuration, `DiscountAmount` = :PDODiscountAmount, `Margin` = :PDOMargin, `Vendor` = :PDOVendor, `CampaignDurationUnits` = :PDOCampaignUnit, `RateId` = :PDORateId, `Bold` = :PDOBold, `SemiBold` = :PDOSemiBold, `Color` = :PDOColor, `Tick` = :PDOTick WHERE `CartID` = :PDOCartId");

        foreach ($params as $key => $value) {
            $stmt->bindValue(":$key", $value);
        }

        $stmt->execute();
        return ["success" => true, "message" => "Cart Updated Successfully!"];
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Unable to update cart data!"]);
        error_log("\nError updating data: " . $e->getMessage(), 3, './Error Logs/Update Error.txt');
        exit;
    }
}

function UpdateQuote($conn, $params){
    try{
     
        $stmt = $conn->prepare("UPDATE quote_table SET `ClientName` = :PDOClientName, `ClientEmail` = :PDOClientEmail, `ClientContact` = :PDOClientContact, `ClientGST` = :PDOClientGST, `LeadDays` = :PDOLeadDays, `Source` = :PDOSource WHERE `QuoteID` = :PDOQuoteId");

        foreach ($params as $key => $value) {
            $stmt->bindValue(":$key", $value);
        }

        $stmt->execute();
        return ["success" => true, "message" => "Quote Updated Successfully!"];
    }catch(PDOException $e){
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Unable to update quote data"]);
        error_log("\nError updating data: " . $e->getMessage(), 3, './Error Logs/Update Error.txt');
        exit;
    }
}

function RemoveCart($conn, $CartID){
    try{
        $stmt = $conn->prepare("UPDATE cart_table SET `Valid Status` = 'Invalid' WHERE `CartID` = :PDOCartId");
        $stmt->bindParam(':PDOCartId', $CartID);
        $stmt->execute();
        return ["success" => true, "message" => "Cart Removed Successfully!"];
    }catch(PDOException $e){
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Unable to remove the item from cart!"]);
        error_log("\nError updating data: " . $e->getMessage(), 3, './Error Logs/Update Error.txt');
        exit;
    }
}

try{
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    //Declare variables
    $tomorrowDate = date('Y-m-d', strtotime('+1 day'));
    $QuoteID = $_GET['JsonQuoteId'] ?? 'No Quote Id';
    $CartID = $_GET['JsonCartId'] ?? 'No Cart Id';
    $QuoteOnly = $_GET['JsonQuoteOnly'] ?? false;
    $CartOnly = $_GET['JsonCartOnly'] ?? false;
    $CartRemove = $_GET['JsonRemoveCart'] ?? false;

    if(!is_int((int)$QuoteID) && !$CartOnly && !$CartRemove){
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Provide a valid Quote ID"]);
        exit;
    }

    if(!is_int((int)$CartID) && !$QuoteOnly){
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Provide a valid Cart ID"]);
        exit;
    }

    $cartParams = [
    'PDORateName' => $_GET['JsonRateName'] ?? "",
    'PDOAdType' => $_GET['JsonAdType'] ?? "",
    'PDOAdCategory' => $_GET['JsonAdCategory'] ?? "",
    'PDOQuantity' => $_GET['JsonQuantity'] ?? 0,
    'PDOWidth' => $_GET['JsonWidth'] ?? 1,
    'PDOUnits' => $_GET['JsonUnits'] ?? "",
    'PDOScheme' => $_GET['JsonScheme'] ?? '1 + 0',
    'PDOBold' => $_GET['JsonBold'] ?? -1,
    'PDOSemiBold' => $_GET['JsonSemiBold'] ?? -1,
    'PDOTick' => $_GET['JsonTick'] ?? -1,
    'PDOColor' => $_GET['JsonColor'] ?? -1,
    'PDOAmountWithoutGST' => $_GET['JsonAmountWithoutGST'] ?? 0,
    'PDOAmount' => $_GET['JsonAmount'] ?? 0,
    'PDOGstAmount' => $_GET['JsonGSTAmount'] ?? 0,
    'PDOGstPercentage' => $_GET['JsonGSTPercentage'] ?? 0,
    'PDORatePerUnit' => $_GET['JsonRatePerUnit'] ?? 0,
    'PDOOffers' => $_GET['JsonOffers'] ?? "",
    'PDORemarks' => $_GET['JsonRemarks'] ?? "",
    'PDOCampaignDuration' => $_GET['JsonCampaignDuration'] ?? 0,
    'PDOSpotsPerDay' => $_GET['JsonSpotsPerDay'] ?? 0,
    'PDOSpotDuration' => $_GET['JsonSpotDuration'] ?? 0,
    'PDODiscountAmount' => $_GET['JsonDiscountAmount'] ?? 0,
    'PDOMargin' => $_GET['JsonMargin'] ?? "",
    'PDOVendor' => $_GET['JsonVendor'] ?? "",
    'PDOCampaignUnit' => $_GET['JsonCampaignUnits'] ?? "",
    'PDORateId' => $_GET['JsonRateId'] ?? 0,
    'PDOCartId' => $CartID
];

    $quoteParams = [
        'PDOQuoteId' => $QuoteID,
        'PDOClientName' => $_GET['JsonClientName'] ?? null,  // Default to null if not set
        'PDOClientEmail' => $_GET['JsonClientEmail'] ?? null,  // Default to null if not set
        'PDOClientContact' => $_GET['JsonClientContact'] ?? null,  // Default to null if not set
        'PDOClientGST' => $_GET['JsonClientGST'] ?? "",  // Default to empty string if not set
        'PDOLeadDays' => $_GET['JsonLeadDays'] ?? 1,  // Default to 1 if not set
        'PDOSource' => $_GET['JsonClientSource'] ?? null  // Default to null if not set
    ];


    // $removeParams = [
    //     'PDOCartId' => $CartID
    // ];
    // $mapParams = [
    // 'PDOQuoteID' => $QuoteID,
    // 'PDOCartID' => $CartID,
    // 'PDOTomorrowDate' => $tomorrowDate 
    // ];

    $response = [];
    if($QuoteOnly){
        $quoteResponse = UpdateQuote($pdo, $quoteParams);
        // $mappingResponse = UpdateQuoteCartMapping($mapParams);
        $response = [
            "quoteResponse" => $quoteResponse
        ];
    }else if($CartOnly){
        $cartResponse = UpdateCart($pdo, $cartParams);
        $response = [
            "cartResponse" => $cartResponse
        ];
    }else if($CartRemove){
        $removeResponse = RemoveCart($pdo, $CartID);
        $response = [
            "removeResponse" => $removeResponse
        ];
    }else{
        $quoteResponse = UpdateQuote($pdo, $quoteParams);
        $cartResponse = UpdateCart($pdo, $cartParams);
        $response = [
            "quoteResponse" => $quoteResponse,
            "cartResponse" => $cartResponse
        ];
    }

echo json_encode($response);

}catch(PDOException $e){
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Unable to update data!"]);
    error_log("\nError while Updating data using DB: " . $e->getMessage(), 3, './Error Logs/Update Error.txt');
    exit;
}catch(\Throwable $th){
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error while updating data!"]);
    error_log("\nError while updating data: " . $th->getMessage(), 3, './Error Logs/Update Error.txt');
    exit;
}
<?php
require 'ConnectionManager.php';

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: *");
header('Content-Type: application/json');

$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Test';
ConnectionManager::connect($dbName);
$pdo = ConnectionManager::getConnection();
$entryUser = $_GET['JsonEntryUser'];
$tomorrowDate = date('Y-m-d', strtotime('+1 day'));
$nextCartId = null;
$nextQuoteId = $_GET['JsonNextQuoteId'];

function getMaxIds() {
    // global $pdo, $nextQuoteId, $nextCartId;
    global $pdo, $nextCartId;

    try {
        // $stmt = $pdo->query("SELECT MAX(quoteID) as maxQuoteID FROM quote_table");
        // $nextQuoteId = $stmt->fetch(PDO::FETCH_ASSOC)['maxQuoteID'];
        // $nextQuoteId += 1;

        $stmt = $pdo->query("SELECT MAX(cartId) as maxCartID FROM cart_table");
        $nextCartId = $stmt->fetch(PDO::FETCH_ASSOC)['maxCartID'];
        $nextCartId += 1;
    } catch (PDOException $e) {
        echo json_encode(["error" => "Error fetching data: " . $e->getMessage()]);
        return;
    }
}

function InsertIntoCart($data) {
    global $pdo;
    try {     
        $stmt = $pdo->prepare("INSERT INTO cart_table (`CartID`, `EntryDateTime`, `AdMedium`, `adType`, `adCategory`, `Quantity`, `Width`, `Units`, `Scheme`, `Bold`, `SemiBold`, `Tick`, `Color`, `Paid%`, `AmountwithoutGst`, `Amount`, `GSTAmount`, `GST%`, `Offers`, `entryUser`, `Valid Status`, `Sent`, `rateperunit`, `ImageId`, `Remarks`, `DateOfRelease`, `CampaignDays`, `SpotsPerDay`, `SpotDuration`, `DiscountAmount`, `Margin`, `Vendor`, `CampaignDurationUnits`, `RateId`) VALUES (null, CURRENT_TIMESTAMP(), :PDORateName, :PDOAdType, :PDOAdCategory, :PDOQuantity, :PDOWidth, :PDOUnits, :PDOScheme, :PDOBold, :PDOSemibold, :PDOTick, :PDOColor, 0, :PDOAmountWithoutGST, :PDOAmount, :PDOGstAmount, :PDOGstPercentage, '', :PDOEntryUser, 'Valid', 1, :PDORatePerUnit, 0, :PDORemarks, '0000-00-00', :PDOCampaignDuration, :PDOSpotsPerDay, :PDOSpotDuration, :PDODiscountAmount, :PDOMargin, :PDOVendor, :PDOCampaignUnits, :PDORateId)");

        foreach ($data as $key => $value) {
            $stmt->bindValue(":$key", $value);
        }

        $stmt->execute();
        return "Cart Inserted Successfully!";
    } catch (PDOException $e) {
        return "Error inserting data: " . $e->getMessage();
    }
}

function InsertIntoQuote($data) {
    global $pdo, $nextQuoteId;
    try {
        $stmt = $pdo->query("SELECT MAX(quoteID) as maxQuoteID FROM quote_table");
        $maxQuoteId = $stmt->fetch(PDO::FETCH_ASSOC)['maxQuoteID'];
        if ($maxQuoteId == $nextQuoteId) {
            return "Quote insertion skipped.";
        }

        $SearchConcat = trim($nextQuoteId) 
                      . ($data['PDOClientName'] !== '' ? " - " . trim($data['PDOClientName']) : '') 
                      . ($data['PDOClientContact'] !== '' ? " - " . trim($data['PDOClientContact']) : " - 0");

        $SearchTerm = trim($SearchConcat);
     
        $stmt = $pdo->prepare("INSERT INTO quote_table VALUES (CURRENT_DATE, :PDOEntryUser, :PDOQuoteID, :PDOClientName, :PDOClientEmail, :PDOClientContact, :PDOClientGST, :PDOLeadDays, :PDOSource, '', :PDOSearchTerm)");

        $stmt->bindValue(":PDOSearchTerm", $SearchTerm);

        foreach ($data as $key => $value) {
            $stmt->bindValue(":$key", $value);
        }

        $stmt->execute();
        return "Quote Inserted Successfully!";
    } catch (PDOException $e) {
        return "Error inserting data: " . $e->getMessage();
    }
}

function InsertQuoteCartMapping($data) {
    global $pdo;
    try {
        $stmt = $pdo->prepare("INSERT INTO quote_cart_mapping_table VALUES (CURRENT_DATE, :PDOEntryUser, null, :PDOQuoteID, :PDOCartID, 'Followup', '', :PDOTomorrowDate)");

        foreach ($data as $key => $value) {
            $stmt->bindValue(":$key", $value);
        }

        $stmt->execute();
        return "Mapped Successfully";
    } catch (PDOException $e) {
        return "Error Inserting data: " . $e->getMessage();
    }
}

getMaxIds();

$cartParams = [
    'PDOEntryUser' => $entryUser,
    'PDORateName' => $_GET['JsonRateName'],
    'PDOAdType' => $_GET['JsonAdType'],
    'PDOAdCategory' => $_GET['JsonAdCategory'],
    'PDOQuantity' => $_GET['JsonQuantity'],
    'PDOWidth' => isset($_GET['JsonWidth']) ? $_GET['JsonWidth'] : 1,
    'PDOUnits' => $_GET['JsonUnits'],
    'PDOScheme' => isset($_GET['JsonScheme']) ? $_GET['JsonScheme'] : '1 + 0',
    'PDOBold' => isset($_GET['JsonScheme']) ? $_GET['JsonScheme'] : -1,
    'PDOSemibold' => isset($_GET['JsonScheme']) ? $_GET['JsonScheme'] : +1,
    'PDOTick' => isset($_GET['JsonScheme']) ? $_GET['JsonScheme'] : -1,
    'PDOColor' => isset($_GET['JsonColor']) ? $_GET['JsonColor'] : 0,
    'PDOAmountWithoutGST' => $_GET['JsonAmountWithoutGST'],
    'PDOAmount' => $_GET['JsonAmount'],
    'PDOGstAmount' => $_GET['JsonGSTAmount'],
    'PDOGstPercentage' => $_GET['JsonGSTPercentage'],
    'PDORatePerUnit' => $_GET['JsonRatePerUnit'],
    'PDORemarks' => $_GET['JsonRemarks'],
    'PDOCampaignDuration' => isset($_GET['JsonCampaignDuration']) ? $_GET['JsonCampaignDuration'] : 0,
    'PDOSpotsPerDay' => isset($_GET['JsonSpotsPerDay']) ? $_GET['JsonSpotsPerDay'] : 0,
    'PDOSpotDuration' => isset($_GET['JsonSpotDuration']) ? $_GET['JsonSpotDuration'] : 0,
    'PDODiscountAmount' => $_GET['JsonDiscountAmount'],
    'PDOMargin' => isset($_GET['JsonMargin']) ? $_GET['JsonMargin'] : '',
    'PDOVendor' => isset($_GET['JsonVendor']) ? $_GET['JsonVendor'] : '',
    'PDOCampaignUnits' => $_GET['JsonCampaignUnits'] ?? "",
    'PDORateId' => $_GET['JsonRateId'] ?? ""
];

$quoteParams = [
    'PDOEntryUser' => $entryUser,
    'PDOQuoteID' => $nextQuoteId,
    'PDOClientName' => $_GET['JsonClientName'],
    'PDOClientEmail' => $_GET['JsonClientEmail'],
    'PDOClientContact' => $_GET['JsonClientContact'],
    'PDOClientGST' => $_GET['JsonClientGST'],
    'PDOLeadDays' => $_GET['JsonLeadDays'],
    'PDOSource' => $_GET['JsonClientSource']
];

$mapParams = [
    'PDOEntryUser' => $entryUser,
    'PDOQuoteID' => $nextQuoteId,
    'PDOCartID' => $nextCartId,
    'PDOTomorrowDate' => $tomorrowDate 
];

$quoteResponse = InsertIntoQuote($quoteParams);
$cartResponse = InsertIntoCart($cartParams);
$mappingResponse = InsertQuoteCartMapping($mapParams);

$response = [
    "quoteResponse" => $quoteResponse,
    "cartResponse" => $cartResponse,
    "mappingResponse" => $mappingResponse,
    "nextQuoteId" => $nextQuoteId,
    "nextCartId" => $nextCartId
];

echo json_encode($response);
?>
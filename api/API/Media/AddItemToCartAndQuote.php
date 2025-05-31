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
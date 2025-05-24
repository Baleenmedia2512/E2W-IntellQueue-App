<?php
require 'ConnectionManager.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

// Set default database name and validate it
$dbName = $_GET['JsonDBName'] ?? 'No DB';

if ($dbName === 'No DB') {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "No Database Found"]);
    exit;
}

function updateQuoteStatus($conn, $params) {
    try {
        $stmt = $conn->prepare("UPDATE quote_cart_mapping_table SET `Status` = :PDOStatus WHERE `MapID` = :PDOMapID");
        foreach ($params as $key => $value) {
            $stmt->bindValue(":$key", $value);
        }
        $stmt->execute();
        return ["success" => true, "message" => "Quote status updated successfully!"];
    } catch (PDOException $e) {
        error_log("Error updating status: " . $e->getMessage(), 3, './Error Logs/UpdateError.txt');
        throw $e; // Throw the error to handle it in the calling function
    }
}

function insertOrderData($conn, $orderParams)
{
    try {
        $stmtOrderTable = $conn->prepare(
            "INSERT INTO order_table 
            (`EntryDate`, `EntryUser`, `OrderNumber`, `RateID`, `OrderDate`, `ClientName`, `ClientContact`, 
            `Source`, `Owner`, `CSE`, `Receivable`, `Payable`, `CardRatePerUnit`, `Margin`, 
            `vendorName`, `AdCategory`, `AdType`, `AdWidth`, `ClientAuthorizedPerson`, `BookedStatus`, `Units`) 
            VALUES 
            (CURRENT_DATE, :PDOEntryUser, :PDOOrderNumber, :PDORateId, CURRENT_DATE, :PDOClientName, 
            :PDOClientContact, :PDOSource, :PDOOwner, :PDOCSE, :PDOReceivable, :PDOPayable, 
            :PDOCardRatePerUnit, :PDOMargin, :PDOVendorName, :PDOAdCategory, 
            :PDOAdType, :PDOAdWidth, :PDOClientAuthorizedPerson, :PDOBookedStatus, :PDOUnits)"
        );

        foreach ($orderParams as $key => $value) {
            $stmtOrderTable->bindValue(":$key", $value);
        }

        $stmtOrderTable->execute();
        return ["success" => true, "message" => "Order data inserted successfully!"];
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Unable to insert order data"]);
        error_log("\nError inserting order data: " . $e->getMessage(), 3, './Error Logs/Insert Error.txt');
        exit;
    }
}

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    $mapID = $_GET['JsonMapID'] ?? null;
    $status = $_GET['JsonStatus'] ?? null;

    if (!$mapID || !$status) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "MapID and Status are required"]);
        exit;
    }

    if (!in_array($status, ['Won', 'Lost'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid status value"]);
        exit;
    }

    $params = [
        'PDOMapID' => $mapID,
        'PDOStatus' => $status
    ];

    $response = updateQuoteStatus($pdo, $params);

    // If the status is "Won", proceed to insert order data
    if ($status === 'Won') {
        // Order data params
        $orderParams = [
            'PDOEntryUser' => $_GET['JsonEntryUser'] ?? null,
            'PDOOrderNumber' => $_GET['JsonOrderNumber'] ?? null,
            'PDORateId' => $_GET['JsonRateId'] ?? null,
            'PDOClientName' => $_GET['JsonClientName'] ?? null,
            'PDOClientContact' => $_GET['JsonClientContact'] ?? null,
            'PDOSource' => $_GET['JsonSource'] ?? null,
            'PDOOwner' => $_GET['JsonOwner'] ?? null,
            'PDOCSE' => $_GET['JsonCSE'] ?? null,
            'PDOReceivable' => $_GET['JsonReceivable'] ?? null,
            'PDOPayable' => $_GET['JsonPayable'] ?? null,
            'PDOCardRatePerUnit' => $_GET['JsonCardRatePerUnit'] ?? null,
            'PDOMargin' => $_GET['JsonMargin'] ?? null,
            'PDOVendorName' => $_GET['JsonVendorName'] ?? null,
            'PDOAdCategory' => $_GET['JsonAdCategory'] ?? null,
            'PDOAdType' => $_GET['JsonAdType'] ?? null,
            'PDOAdWidth' => $_GET['JsonAdWidth'] ?? null,
            'PDOClientAuthorizedPerson' => $_GET['JsonClientAuthorizedPerson'] ?? null,
            'PDOBookedStatus' => $_GET['JsonBookedStatus'] ?? null,
            'PDOUnits' => $_GET['JsonUnits'] ?? null,
        ];

        $orderResponse = insertOrderData($pdo, $orderParams);

        echo json_encode([
            "quoteResponse" => $response,
            "orderResponse" => $orderResponse
        ]);
    } else {
        // If status is "Lost", just return the quote response without inserting order data
        echo json_encode([
            "quoteResponse" => $response,
            "orderResponse" => ["success" => false, "message" => "Order not inserted for 'Lost' status"]
        ]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Unable to connect to the database"]);
    error_log("\nError connecting to DB: " . $e->getMessage(), 3, './Error Logs/Connection Error.txt');
    exit;
}

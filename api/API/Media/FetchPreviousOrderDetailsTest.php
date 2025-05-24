<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
} catch(PDOException $e) {
    echo json_encode(['error' => "Connection failed: " . $e->getMessage()]);
    exit();
}

$client_name = isset($_GET['ClientName']) ? $_GET['ClientName'] : '';
$client_contact = isset($_GET['ClientContact']) ? $_GET['ClientContact'] : '';

if ($client_contact || $client_name) {
    $sql = "SELECT
                o.OrderDate, 
                o.OrderNumber, 
                o.ClientName, 
                o.Receivable, 
                o.RateID,
                r.rateName, 
                r.adType,
                o.ConsultantName,
                o.CancelFlag,
                o.ClientContact,
                o.RateWiseOrderNumber,
                o.AdjustedOrderAmount
            FROM 
                `order_table` o
            JOIN 
                `rate_table` r
            ON 
                o.RateID = r.RateID
            WHERE 
                o.ClientName = :clientName
                AND o.ClientContact = :clientContact
                AND CancelFlag = 0 AND RateWiseOrderNumber > 0
            ORDER BY 
                o.OrderNumber DESC LIMIT 1";  

    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':clientContact', $client_contact, PDO::PARAM_STR);
    $stmt->bindParam(':clientName', $client_name, PDO::PARAM_STR);
} else {
    echo json_encode(['error' => 'No valid parameters provided.']);
    exit();
}

$stmt->execute();
$clientdetails = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$clientdetails) {
    echo json_encode(['error' => 'No orders found.']);
    exit();
}

// Extract the client order details
$orderNumber = $clientdetails['OrderNumber'];
$rateWiseOrderNumber = $clientdetails['RateWiseOrderNumber'];
$orderDate = $clientdetails['OrderDate'];
$rateID = $clientdetails['RateID'];
$rateName = $clientdetails['rateName'];
$adType = $clientdetails['adType'];
$receivable = $clientdetails['Receivable'];
$clientContact = $clientdetails['ClientContact'];
$clientName = $clientdetails['ClientName'];
$consultantName = $clientdetails['ConsultantName'];
$adjustedOrderAmount = $clientdetails['AdjustedOrderAmount'];

$response = [
    'clientContact' => $clientContact,
    'clientName' => $clientName,
    'consultantName' => $consultantName,
    'orderNumber' => $orderNumber,
    'orderDate' => $orderDate,
    'rateID' => $rateID,
    'rateName' => $rateName,
    'adType' => $adType,
    'orderAmount' => $receivable,
    'rateWiseOrderNumber' => $rateWiseOrderNumber,
    'adjustedOrderAmount' => $adjustedOrderAmount
];

header('Content-Type: application/json');
echo json_encode([$response]);  // Wrapping the response in an array

// Close the database connection
$pdo = null;
?>

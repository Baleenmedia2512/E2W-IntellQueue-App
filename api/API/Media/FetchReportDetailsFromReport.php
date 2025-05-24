<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Test';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header('Content-Type: application/json');

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
} catch(PDOException $e) {
    echo json_encode(['error' => "Connection failed: " . $e->getMessage()]);
    exit();
}

$order_number = isset($_GET['OrderNumber']) ? $_GET['OrderNumber'] : null;

if (!$order_number) {
    echo json_encode(['error' => 'Order number is required.']);
    exit();
}

// Fetch the client and order details using OrderNumber
$sql = "SELECT * FROM `order_table` WHERE OrderNumber = :orderNumber AND RateWiseOrderNumber > 0 LIMIT 1";
$stmt = $pdo->prepare($sql);
$stmt->bindParam(':orderNumber', $order_number, PDO::PARAM_INT);
$stmt->execute();
$orderDetails = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$orderDetails) {
    echo json_encode(['error' => 'Order not found.']);
    exit();
}

// Extract the order details
$orderNumber = $orderDetails['OrderNumber'];
$rateWiseOrderNumber = $orderDetails['RateWiseOrderNumber'];
$orderDate = $orderDetails['OrderDate'];
$rateID = $orderDetails['RateID'];
$gstPercentage = $orderDetails['GST'];
$remarks = $orderDetails['Remarks'];
$clientContact = $orderDetails['ClientContact'];
$clientName = $orderDetails['ClientName'];
$adType = $orderDetails['AdType'];
$card = $orderDetails['Card'];
$receivable = $orderDetails['Receivable'];
$consultantName = $orderDetails['ConsultantName'];
$adjustedOrderAmount = $orderDetails['AdjustedOrderAmount'];
$marginAmount = $orderDetails['Margin']; // Added margin

$sql = "SELECT ID FROM `client_table` WHERE ClientName = :clientName AND ClientContact = :clientNumber LIMIT 1";
$stmtID = $pdo->prepare($sql);
$stmtID->bindParam(':clientName', $clientName, PDO::PARAM_INT);
$stmtID->bindParam(':clientNumber', $clientContact, PDO::PARAM_INT);
$stmtID->execute();
$clientID = $stmtID->fetch(PDO::FETCH_ASSOC);

if (!$clientID) {
    echo json_encode(['error' => 'ID not found.']);
    exit();
}

// Call the stored procedure to get the balance amount
$sql = "CALL GetBalanceAmountByClientContact(:clientContact, @balanceAmount, :clientName)";
$stmt = $pdo->prepare($sql);
$stmt->bindParam(':clientContact', $clientContact, PDO::PARAM_STR);
$stmt->bindParam(':clientName', $clientName, PDO::PARAM_STR);
$stmt->execute();

// Fetch the balance amount
$stmt = $pdo->query("SELECT @balanceAmount AS balanceAmount");
$result = $stmt->fetch(PDO::FETCH_ASSOC);
$balanceAmount = (float) $result['balanceAmount'];  // Cast to float

$response = [

    'clientName' => $clientName,
    'orderDate' => $orderDate,
    'rateId' => $rateID,
    'receivable' => $receivable,
    'rateWiseOrderNumber' => $rateWiseOrderNumber,
    'clientID' => $clientID['ID'],
    'consultantName' => $consultantName,
    'adjustedOrderAmount' => $adjustedOrderAmount,
    'margin' => $marginAmount // Added margin to the response
];

echo json_encode($response);

// Close the database connection
$pdo = null;
?>

<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Test';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
} catch(PDOException $e) {
    echo json_encode(['error' => "Connection failed: " . $e->getMessage()]);
    exit();
}

$order_number = isset($_GET['OrderNumber']) ? $_GET['OrderNumber'] : null;

if ($order_number) {
    // Fetch the client contact for the given order number
    $sql = "SELECT * FROM `order_table` WHERE OrderNumber = :orderNumber AND OrderNumber > 0 AND CancelFlag = 0 LIMIT 1";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':orderNumber', $order_number, PDO::PARAM_INT);
    $stmt->execute();
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
$gstPercentage = $clientdetails['GST'];
$remarks = $clientdetails['Remarks'];
$clientContact = $clientdetails['ClientContact'];
$clientName = $clientdetails['ClientName'];
$rateName = $clientdetails['Card'];
$rateType = $clientdetails['AdType'];
$adjustedOrderAmount = $clientdetails['AdjustedOrderAmount'];
$commission = $clientdetails['Commission'];
$receivableAmount = $clientdetails['Receivable'];
$payableAmount = $clientdetails['Payable'];

// Call the stored procedure to get the balance amount
$sql = "SELECT SUM(`Amount`) As PaidAmount FROM financial_transaction_table WHERE `OrderNumber` = :OrderNumberPDO AND TransactionType = 'Project Expense'";
$stmt = $pdo->prepare($sql);
$stmt->bindParam(':OrderNumberPDO', $clientContact, PDO::PARAM_STR);
$stmt->execute();

// Fetch the paid amount
$result = $stmt->fetch(PDO::FETCH_ASSOC);
$paidAmount = (float) $result['PaidAmount'];  // Cast to float

$balanceAmount = $payableAmount - $paidAmount;

// Fetch the payment mode for the given order number
$sql = "SELECT GROUP_CONCAT(DISTINCT PaymentMode ORDER BY ID DESC SEPARATOR ', ') AS PaymentModes, SUM(Amount) AS TotalAmount FROM `financial_transaction_table` WHERE OrderNumber = :orderNumber AND ValidStatus = 'Valid';";
$stmt = $pdo->prepare($sql);
$stmt->bindParam(':orderNumber', $orderNumber, PDO::PARAM_INT);
$stmt->execute();
$paymentModeDetails = $stmt->fetch(PDO::FETCH_ASSOC);

$previousPaymentMode = $paymentModeDetails['PaymentModes'] ?? "";
$previousAmountPaid = $paymentModeDetails['TotalAmount'] ?? "";

$response = [
    'clientContact' => $clientContact,
    'clientName' => $clientName,
    'orderNumber' => $orderNumber,
    'rateWiseOrderNumber' => $rateWiseOrderNumber,
    'orderDate' => $orderDate,
    'rateID' => $rateID,
    'gstPercentage' => $gstPercentage,
    'remarks' => $remarks,
    'balanceAmount' => $balanceAmount,
    'rateName' => $rateName,
    'rateType' => $rateType,
    'adjustedOrderAmount' => $adjustedOrderAmount,
    'commission' => $commission,
    'receivableAmount' => $receivableAmount,
    'previousPaymentMode' => $previousPaymentMode, 
    'previousAmountPaid' => $previousAmountPaid,
];

header('Content-Type: application/json');
echo json_encode([$response]);  // Wrapping the response in an array

// Close the database connection
$pdo = null;
?>
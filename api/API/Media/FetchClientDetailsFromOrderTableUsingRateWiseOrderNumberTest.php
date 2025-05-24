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

$rate_wise_order_number = isset($_GET['RateWiseOrderNumber']) ? $_GET['RateWiseOrderNumber'] : null;

if ($rate_wise_order_number) {
    // Fetch the client contact for the given order number
    $sql = "SELECT * FROM `order_table` WHERE RateWiseOrderNumber = :rateWiseOrderNumber AND OrderNumber > 0 AND CancelFlag = 0 ORDER BY `order_table`.`OrderDate` DESC LIMIT 1";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':rateWiseOrderNumber', $rate_wise_order_number, PDO::PARAM_INT);
    $stmt->execute();
} else {
    echo json_encode(['error' => 'No valid parameters provided.']);
    exit();
}

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
$waiverAmount = $clientdetails['WaiverAmount'];
$receivableAmount = $clientdetails['Receivable'];

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

// Fetch the payment mode for the given order number
$sql = "SELECT GROUP_CONCAT(DISTINCT PaymentMode ORDER BY ID DESC SEPARATOR ', ') AS PaymentModes, SUM(Amount) AS TotalAmount FROM `financial_transaction_table` WHERE OrderNumber = :orderNumber AND ValidStatus = 'Valid';";
$stmt = $pdo->prepare($sql);
$stmt->bindParam(':orderNumber', $orderNumber, PDO::PARAM_INT);
$stmt->execute();
$paymentModeDetails = $stmt->fetch(PDO::FETCH_ASSOC);

$previousPaymentMode = $paymentModeDetails['PaymentModes'] ?? "";
$previousAmountPaid = $paymentModeDetails['TotalAmount'] ?? "";

// Create the response array
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
    'waiverAmount' => $waiverAmount,
    'receivableAmount' => $receivableAmount,
    'previousPaymentMode' => $previousPaymentMode, 
    'previousAmountPaid' => $previousAmountPaid,
];

header('Content-Type: application/json');
echo json_encode($response);  // No need to wrap the response in an array

// Close the database connection
$pdo = null;
?>

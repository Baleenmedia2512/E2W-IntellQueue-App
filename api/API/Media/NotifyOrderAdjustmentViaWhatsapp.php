<?php

require 'ConnectionManager.php';

// Set CORS headers
header('Content-Type: application/json');
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Origin: *");

// Function to connect to the database
function connectToDB($DBName) {
    if ($DBName !== 'Grace Scans' && $DBName !== 'Baleen Test' && $DBName !== 'test' && $DBName !== 'gracescans') {
        echo json_encode(["message" => "Configuration for your company is not yet added"]);
        exit();
    }

    try {
        ConnectionManager::connect($DBName);
        return ConnectionManager::getConnection();
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Unable to connect to DB"]);
        error_log("\nError while connecting to DB: " . $e->getMessage(), 3, './Connection_Error.txt');
        exit();
    }
}

// Function to send WhatsApp messages
function sendWhatsappMessage($license, $api, $template, $mobileNumber, $params) {
    try {
        $paramString = urlencode(implode(',', $params));
        $baseURL = "https://app.tendigit.in/api/sendtemplate.php?LicenseNumber=$license&APIKey=$api&Contact=91$mobileNumber&Template=$template&Param=$paramString";

        // Initialize cURL
        $ch = curl_init($baseURL);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        // Execute the request and get the response
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if (curl_errno($ch)) {
            $error = curl_error($ch);
            curl_close($ch);
            return ['success' => false, 'message' => 'cURL Error: ' . $error];
        }

        curl_close($ch);

        if ($httpCode !== 200) {
            error_log("\nError while sending WhatsApp Message: " . $response, 3, './WhatsappOAError.txt');
            return ['success' => false, 'message' => 'Failed to send message'];
        }

        return ['success' => true, 'response' => $response];
    } catch (Throwable $th) {
        error_log("\nError while sending WhatsApp Message: " . $th->getMessage(), 3, './WhatsappOAError.txt');
        return ['success' => false, 'message' => 'Unexpected error occurred'];
    }
}

// Configuration
$DBName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Test';
$license = '23799204801';
$api = 'WmwZrVceAsHoft59dv1pM2xP8';
$template = 'order_adjustment_amt_template';

// Assign mobile numbers based on the database name
$mobileNumbersMap = [
    'Grace Scans' => ['9994443607', '9944084854'],
    'Baleen Test' => ['7010198963'],
    'gracescans' => ['9994443607', '9944084854'],
    'test' => ['7010198963'],
];

$mobileNumbers = isset($mobileNumbersMap[$DBName]) ? $mobileNumbersMap[$DBName] : [];

if (empty($mobileNumbers)) {
    echo json_encode(["message" => "Configuration for your company is not yet added"]);
    exit();
}

// Retrieve JSON input data
$inputData = json_decode(file_get_contents("php://input"), true);

if (!$inputData) {
    echo json_encode(["message" => "Invalid input data"]);
    exit();
}

// Extract input variables
$clientNam = $inputData['clientNam'] ?? null;
$adjustedOrderAmt = $inputData['adjustedOrderAmt'] ?? 0;
$rateWiseOrderNum = $inputData['rateWiseOrderNum'] ?? null;
$rateCard = $inputData['rateCard'] ?? null;
$rateType = $inputData['rateType'] ?? null;
$remarks = $inputData['remarks'] ?? null;
$newCommissionAmount = $inputData['newCommissionAmount'] ?? 0;
$prevCommissionAmount = $inputData['prevCommissionAmount'] ?? 0;

// Construct message parameters
// Construct message parameters with ₹ symbol
$messageParams = [
    $rateWiseOrderNum,   // Order Number
    $clientNam,          // Client Name
    ($adjustedOrderAmt < 0 ? "-₹" . number_format(abs((float) $adjustedOrderAmt), 2, '.', '') : "₹" . number_format((float) $adjustedOrderAmt, 2, '.', '')),  // Adjusted Amount
    ($prevCommissionAmount < 0 ? "-₹" . number_format(abs((float) $prevCommissionAmount), 2, '.', '') : "₹" . number_format((float) $prevCommissionAmount, 2, '.', '')), // Previous Commission Amount
    ($newCommissionAmount < 0 ? "-₹" . number_format(abs((float) $newCommissionAmount), 2, '.', '') : "₹" . number_format((float) $newCommissionAmount, 2, '.', '')), // New Commission Amount
    "$rateCard - $rateType", // Details
    $remarks             // Remarks
];


// Send WhatsApp messages
$responses = [];
foreach ($mobileNumbers as $mobileNumber) {
    $response = sendWhatsappMessage($license, $api, $template, $mobileNumber, $messageParams);
    $responses[] = $response;
}

// Return response
echo json_encode($responses);

?>

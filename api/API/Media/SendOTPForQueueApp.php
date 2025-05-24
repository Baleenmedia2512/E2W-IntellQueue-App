<?php
// SendOTPForQueueApp.php

// Include necessary files
require_once 'OTPService.php';

// Get the database name from the query parameters (default to 'Baleen Test')
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Test';

// Set headers for CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

// Read JSON input from the request body
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Check if JsonClientContact is provided in the request
if (!isset($data['JsonClientContact']) || empty($data['JsonClientContact'])) {
    echo json_encode(['success' => false, 'message' => 'Phone number is required']);
    exit();
}

// Create an instance of OTPService with the database connection (PDO)
$otpService = new OTPService($dbName);

// Send OTP using the phone number passed in the JSON request
$otp = $otpService->sendOTP($data['JsonClientContact']);

// SMS API credentials and parameters
$apiKey = 'yaFDHYOHN02aTOoHTTWk9Q';
$senderid = 'GRACE7';
$channel = 'Trans'; // Trans or Promo
$DCS = '8'; // 0 for English text and 8 for non-english and special characters
$flashsms = '0'; // 0 for normal delivery
$number = $data['JsonClientContact']; // phone number
$message = "$otp is your Grace Scans login code (gracescans.com). Valid 5 mins.";
$route = '4'; // route 4 for GS gateway

// Validate required fields
if (empty($senderid) || empty($number) || empty($message) || empty($route)) {
    echo json_encode(['success' => false, 'message' => 'Missing required parameters.']);
    exit();
}

// Initialize cURL to send SMS
$ch = curl_init('http://retailsms.nettyfish.com/api/mt/SendSMS?APIKEY=' . urlencode($apiKey) .
    '&senderid=' . urlencode($senderid) .
    '&channel=' . urlencode($channel) .
    '&DCS=' . urlencode($DCS) .
    '&flashsms=' . urlencode($flashsms) .
    '&number=' . urlencode($number) .
    '&text=' . urlencode($message) .
    '&route=' . urlencode($route));

// Set cURL options
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // Return the output as a string
$response = curl_exec($ch);

if ($response === false) {
    $error = curl_error($ch);
    curl_close($ch);
    echo json_encode(['success' => false, 'message' => "cURL Error: $error"]);
} else {
    curl_close($ch);
    $result = json_decode($response, true);

    if ($result) {
        echo json_encode(['success' => true, 'message' => 'SMS Sent Successfully!', 'number' => $otp]);
    } else {
        echo json_encode(['success' => false, 'message' => 'SMS Not Sent', 'details' => $response]);
    }
}
?>

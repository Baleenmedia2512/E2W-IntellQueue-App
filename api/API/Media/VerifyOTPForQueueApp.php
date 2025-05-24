<?php
// VerifyOTPForQueueApp.php

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

// Check if phone and OTP are provided in the request
if (!isset($data['JsonClientContact']) || empty($data['JsonClientContact']) || !isset($data['JsonOTP']) || empty($data['JsonOTP'])) {
    echo json_encode(['success' => false, 'message' => 'Phone number and OTP are required']);
    exit();
}

// Create an instance of OTPService with the database connection (PDO)
$otpService = new OTPService($dbName);  // Pass dbName here

// Get the phone number and OTP from the JSON request
$clientContact = $data['JsonClientContact'];
$inputOtp = $data['JsonOTP'];

// Verify the OTP
$result = $otpService->verifyOTP($clientContact, $inputOtp);

// Return the result as JSON
echo json_encode($result);
?>

<?php
// require 'ConnectionManager.php';
// $dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';
// // if($dbName !== 'Grace Scans' && $dbName !== 'Baleen Media'){
// //     $dbName = 'Baleen Media';
// // }
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    // ConnectionManager::connect($dbName);
    // $pdo = ConnectionManager::getConnection();

	// Account details
	$apiKey = urlencode('kNHRWRZrYb8-ZFCOu2WMFJGL9kYhi7zgFPMKCQuyYv');

	$test = "0";

	// Message details
	// $numbers = array(917010198963);
	// $sender = urlencode('BALEEN');
	// $message = rawurlencode('Your payment of Rs. 0 paid against WO# Test is received by Baleen Media Finance team. Thanks for your Payment. - Baleen Media');

	$numbers = array($_GET['JsonPhoneNumber']);
	$sender = urlencode($_GET['JsonSender']);
	$message = rawurlencode($_GET['JsonMessage']);
 
	$numbers = implode(',', $numbers);
 
	// Prepare data for POST request
	$data = array('apikey' => $apiKey, 'numbers' => $numbers, "sender" => $sender, "message" => $message);
 
	// Send the POST request with cURL
	$ch = curl_init('https://api.textlocal.in/send/');
	curl_setopt($ch, CURLOPT_POST, true);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	$response = curl_exec($ch);
	curl_close($ch);

	echo json_encode($response);

    } catch(PDOException $e) {
    	echo json_encode("Error sending sms: ".$e->getMessage());
}
?>
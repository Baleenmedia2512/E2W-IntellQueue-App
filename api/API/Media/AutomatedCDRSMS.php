<?php
require 'ConnectionManager.php';

// Configuration
$dbName = 'Grace Scans'; // Replace with your database name if needed
$apiKey = 'yaFDHYOHN02aTOoHTTWk9Q';
$senderid = 'GRACE7';
$channel = 'Trans'; // Trans or Promo
$DCS = '8'; // 0 for English text and 8 for non-english and special characters
$flashsms = '0'; // 0 for normal delivery
$route = '4'; // route 4 for GS gateway

$pdo = '';

const DB_HOST = 'localhost';
const DB_USERNAME = "baleeed5_gracescans";
const DB_PASSWORD = "Grace@123#";
const DB_DATABASE = "baleeed5_gracescans";

try {
    $server_name = DB_HOST;
    $db_name = DB_DATABASE;
    $username = DB_USERNAME;
    $password = DB_PASSWORD;

    $pdo = new PDO("mysql:host=$server_name;dbname=$db_name", $username, $password); //connect to DB

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

} catch(PDOException $err){
    error_log("\nPDO Error: " .$err->getMessage(), 3, './pdo_error.txt');

}catch (\Throwable $th) {
    error_log("Connection Error: " .$th->getMessage(), 3,  './db_error.txt');
}

// Function to fetch previous date consultants
function fetchPreviousDateConsultants($dbName) {
    $url = "https://orders.baleenmedia.com/API/Media/FetchPreviousDateConsultants.php?JsonDBName=" . urlencode($dbName);
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FAILONERROR, true); // This will catch HTTP errors like 400, 500, etc.

    $response = curl_exec($ch);

    if ($response === false) {
        $error = curl_error($ch);
        curl_close($ch);
        throw new Exception("cURL error: {$error}");
    }

    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        throw new Exception("HTTP error: {$httpCode}");
    }

    return json_decode($response, true)['data'] ?? [];
}


// Function to send SMS
function sendSMS($consultantName, $consultantNumber, $message, $apiKey, $senderid, $channel, $DCS, $flashsms, $route)
{
    if (!isValidPhoneNumber($consultantNumber)) {
        return ['status' => 'warning', 'message' => 'SMS Not Sent! Reason: Phone Number is Unavailable'];
    }

    $sendableNumber = "91{$consultantNumber}";
    $encodedMessage = urlencode($message);
    $ch = curl_init("http://retailsms.nettyfish.com/api/mt/SendSMS?APIKEY=" . urlencode($apiKey) . "&senderid=" . urlencode($senderid) . "&channel=" . urlencode($channel) . "&DCS=" . urlencode($DCS) . "&flashsms=" . urlencode($flashsms) . "&number=" . urlencode($sendableNumber) . "&text={$encodedMessage}&route=" . urlencode($route));

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $data = curl_exec($ch);

    if ($data === false) {
        $error = curl_error($ch);
        curl_close($ch);
        return ['status' => 'error', 'message' => "cURL Error: {$error}"];
    } else {
        curl_close($ch);
        $result = json_decode($data, true);
        if ($result && isset($result['ErrorCode']) && $result['ErrorCode'] == '000') {
            // SMS sent successfully
            return ['status' => 'success', 'message' => 'SMS Sent and Database Updated Successfully'];
        } else {
            return ['status' => 'error', 'message' => "SMS Not Sent: " . json_encode($result)];
        }
    }
}

// Function to validate phone number
function isValidPhoneNumber($number)
{
    return !empty($number) && $number !== '0' && preg_match('/^\d+$/', $number);
}

// Main Logic
try {
    // ConnectionManager::connect($dbName);
    // $pdo = ConnectionManager::getConnection();
    $consultants = fetchPreviousDateConsultants($dbName);

    if (empty($consultants)) {
        echo json_encode(['status' => 'info', 'message' => 'No consultants found for the current date.']);
        exit; // Exit early as there's nothing to process
    }
    
    $consultantData = [];
    
    // Group the results by consultant name
    foreach ($consultants as $item) {
        $consultantName = $item['ConsultantName'];
        $consultantNumber = $item['ConsultantNumber'];
        $card = $item['Card'];
        $cardCount = (int)$item['card_count'];

        if (!isset($consultantData[$consultantName])) {
            $consultantData[$consultantName] = [
                'consultantName' => $consultantName,
                'consultantNumber' => $consultantNumber,
                'totalCount' => 0,
                'cards' => []
            ];
        }

        // Update total count and individual card counts
        $consultantData[$consultantName]['totalCount'] += $cardCount;
        $consultantData[$consultantName]['cards'][$card] = ($consultantData[$consultantName]['cards'][$card] ?? 0) + $cardCount;
    }

    // Send SMS for each consultant
    foreach ($consultantData as $consultant) {
        $consultantName = $consultant['consultantName'];
        $consultantNumber = $consultant['consultantNumber'];
        $totalCount = $consultant['totalCount'];
        $cards = $consultant['cards'];

        $usgCount = $cards['USG Scan'] ?? 0;
        $ctCount = $cards['CT Scan'] ?? 0;
        $xrayCount = $cards['X-Ray'] ?? 0;

        // Create the message for the consultant
        $message = "Hello {$consultantName}, 
{$totalCount} of your Patients utilized our Diagnostic Services Yesterday. 
USG - {$usgCount} 
CT - {$ctCount} 
X-Ray - {$xrayCount} 
It was our pleasure to serve your Patients. 
- Grace Scans";


        // Call the function to send SMS
        $smsResult = sendSMS($consultantName, $consultantNumber, $message, $apiKey, $senderid, $channel, $DCS, $flashsms, $route);
        
        // Update database for sent SMS
        if ($smsResult['status'] === 'success') {
            if (!empty($consultantName) && !empty($consultantNumber)) {
                $stmt = $pdo->prepare("UPDATE `consultant_table` SET LastSMSSent = CURRENT_DATE WHERE `ConsultantName` = :PDOConsultantName AND `ConsultantNumber` = :PDOConsultantNumber");
                $stmt->bindParam(':PDOConsultantName', $consultantName);
                $stmt->bindParam(':PDOConsultantNumber', $consultantNumber);
                $stmt->execute();
            }
        }
    }

    echo json_encode(['status' => 'success', 'message' => 'All SMS processed successfully.']);
} catch (PDOException $e) {
    file_put_contents($logFile, date('Y-m-d H:i:s') . " - Error: " . $e->getMessage() . "\n", FILE_APPEND);
    echo json_encode(['status' => 'error', 'message' => "Connection failed: " . $e->getMessage()]);
}
?>

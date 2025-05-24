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

$apiKey = 'yaFDHYOHN02aTOoHTTWk9Q';

$senderid = 'GRACE7';
$channel = 'Trans'; // Trans or Promo
$DCS = '8'; // 0 for English text and 8 for non-english and special characters
$flashsms = '0'; // 0 for normal delivery and
$number = isset($_GET['JsonNumber']) ? $_GET['JsonNumber'] : ''; // phone number
$message = isset($_GET['JsonMessage']) ? $_GET['JsonMessage'] : ''; // message template
$route = '4'; // route 4 for GS gateway
$consultantName = isset($_GET['JsonConsultantName']) ? $_GET['JsonConsultantName'] : '';
$consultantNumber = isset($_GET['JsonConsultantNumber']) ? $_GET['JsonConsultantNumber'] : '';

// Validate required fields
if (empty($senderid) || empty($number) || empty($message) || empty($route)) {
    echo json_encode("Error: Missing required parameters.");
    exit();
}

$ch=curl_init('http://retailsms.nettyfish.com/api/mt/SendSMS?APIKEY='.urlencode($apiKey).'&senderid='.urlencode($senderid).'&channel='.urlencode($channel).'&DCS='.urlencode($DCS).'&flashsms='.urlencode($flashsms).'&number='.urlencode($number).'&text='.urlencode($message).'&route='.urlencode($route).'');

// Set cURL options
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // Return the output as a string
$data = curl_exec($ch);

if ($data === false) {
    $error = curl_error($ch);
    curl_close($ch);
    echo json_encode("cURL Error: " . $error);
} else {
    curl_close($ch);
    // Parse the result to check if the SMS was successfully sent
    $result = json_decode($data, true);
    
    if ($result && isset($result['ErrorCode']) && $result['ErrorCode'] == '000') {
        // SMS sent successfully, update the database
        if (!empty($consultantName) && !empty($consultantNumber)) {
        $stmt = $pdo->prepare("UPDATE `consultant_table` SET LastSMSSent = CURRENT_DATE WHERE `ConsultantName` = :PDOConsultantName AND `ConsultantNumber` = :PDOConsultantNumber");
        $stmt->bindParam(':PDOConsultantName', $consultantName);
        $stmt->bindParam(':PDOConsultantNumber', $consultantNumber);

        if ($stmt->execute()) {
            echo json_encode("SMS Sent and Database Updated Successfully");
        } else {
            echo json_encode("SMS Sent but Failed to Update Database: " . $conn->error);
        }
    } else {
        echo json_encode("SMS Sent but Consultant details are missing.");
    }
    } else {
        // Handle case where SMS sending failed
        echo json_encode("SMS Not Sent: " . json_encode($result));
    }

}

?>

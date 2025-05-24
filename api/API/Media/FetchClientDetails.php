<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Test';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
} catch(PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}

// $client_contact = $_GET['ClientContact'];
// $client_name = $_GET['ClientName'];
$client_id = $_GET['ClientID'];

// Prepare the SQL statement to fetch the client details based on the selected client contact
$sql = "SELECT ID, ClientName, ClientEmail, Source, Age, DOB, Address, Title, ConsultantId, ClientContactPerson, ClientGST, ClientPAN, Gender 
        FROM client_table 
        WHERE ID = :clientID AND Validity = 1 
        ORDER BY ID DESC LIMIT 1";

$stmt = $pdo->prepare($sql);
$stmt->bindParam(':clientID', $client_id);
// $stmt->bindParam(':clientContact', $client_contact);
// $stmt->bindParam(':clientName', $client_name);
$stmt->execute();

// Fetch the selected client details and store them in an array
$clientdetails = $stmt->fetch(PDO::FETCH_ASSOC);

// Extract the client details from the array
$clientName = '';
$clientEmail = '';
$clientSource = '';
$clientAge = '';
$clientDOB = '';
$clientAddress = '';
$clientTitle = '';
$clientGST = '';
$clientPAN = '';
$consultantId = 0;
$consultantName = '';
$consultantNumber = '';
$consultantPlace = '';
$clientContactPerson = '';
$clientGender = '';
$clientId = 0;

if ($clientdetails) {
    $clientId = $clientdetails['ID'];
    $clientName = $clientdetails['ClientName'];
    $clientEmail = $clientdetails['ClientEmail'];
    $clientSource = $clientdetails['Source'];
    $clientAge = $clientdetails['Age'];
    $clientDOB = $clientdetails['DOB'];
    $clientAddress = $clientdetails['Address'];
    $clientTitle = $clientdetails['Title'];
    $clientGST = $clientdetails['ClientGST'];
    $clientPAN = $clientdetails['ClientPAN'];
    $clientContactPerson = $clientdetails['ClientContactPerson'];
    $consultantId = $clientdetails['ConsultantId'];
    $clientGender = $clientdetails['Gender'];

    if ($clientSource == 'Consultant' || $clientSource == '5.Consultant') {
        $stmt = $pdo->prepare("SELECT ConsultantName, ConsultantNumber, ConsultantPlace FROM consultant_table WHERE CId = :PDOCId");
        $stmt->bindParam(':PDOCId', $consultantId);
        $stmt->execute();
        $consultantDetails = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($consultantDetails) {
            $consultantName = $consultantDetails['ConsultantName'];
            $consultantNumber = $consultantDetails['ConsultantNumber'];
            $consultantPlace = $consultantDetails['ConsultantPlace'];
        }
    }
}

$response = array(
    'id' => $clientId,
    'name' => $clientName,
    'email' => $clientEmail,
    'source' => $clientSource,
    'Age' => $clientAge,
    'DOB' => $clientDOB,
    'address' => $clientAddress,
    'title' => $clientTitle,
    'GST' => $clientGST,
    'PAN' => $clientPAN,
    'consname' => $consultantName,
    'consnumber' => $consultantNumber,
    'consplace' => $consultantPlace,
    'clientContactPerson' => $clientContactPerson,
    'gender' => $clientGender,
    'consid' => $consultantId
);

header('Content-Type: application/json');
echo json_encode([$response]);

// Close the database connection
$pdo = null;
?>

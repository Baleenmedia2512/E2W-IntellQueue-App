<?php
require 'ConnectionManager.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header('Content-Type: application/json');

try {
    $dbName = $_GET['JsonDBName'] ?? 'Baleen Test';
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
} catch (PDOException $e) {
    echo json_encode(["error" => "Connection failed: " . $e->getMessage()]);
    exit;
}

$client_contact = $_GET['ClientContact'];

if (!$client_contact) {
    echo json_encode(["error" => "Client Contact is required"]);
    exit;
}

// Fetch client details
$sql = "SELECT ID, ClientName, ClientEmail, Source, Age, DOB, Address, Title, ConsultantId, ClientContactPerson, ClientGST, ClientPAN, Gender 
        FROM client_table 
        WHERE ClientContact = :clientContact AND Validity = 1 
        ORDER BY ID DESC LIMIT 1";

$stmt = $pdo->prepare($sql);
$stmt->bindParam(':clientContact', $client_contact);
$stmt->execute();

$clientDetails = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$clientDetails) {
    echo json_encode(["error" => "Client not found"]);
    exit;
}

// Initialize response with client details
$response = [
    'id' => $clientDetails['ID'],
    'name' => $clientDetails['ClientName'],
    'email' => $clientDetails['ClientEmail'],
    'source' => $clientDetails['Source'],
    'Age' => $clientDetails['Age'],
    'DOB' => $clientDetails['DOB'],
    'address' => $clientDetails['Address'],
    'title' => $clientDetails['Title'],
    'GST' => $clientDetails['ClientGST'],
    'PAN' => $clientDetails['ClientPAN'],
    'clientContactPerson' => $clientDetails['ClientContactPerson'],
    'gender' => $clientDetails['Gender'],
    'consid' => $clientDetails['ConsultantId'],
    'consname' => '',
    'consnumber' => ''
];

// Fetch consultant details if the source is 'Consultant'
if (in_array($clientDetails['Source'], ['Consultant', '5.Consultant'])) {
    $stmt = $pdo->prepare("SELECT ConsultantName, ConsultantNumber FROM consultant_table WHERE CId = :consultantId");
    $stmt->execute([':consultantId' => $clientDetails['ConsultantId']]);
    $consultantDetails = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($consultantDetails) {
        $response['consname'] = $consultantDetails['ConsultantName'];
        $response['consnumber'] = $consultantDetails['ConsultantNumber'];
    }
}

echo json_encode([$response]);

// Close the database connection
$pdo = null;
?>

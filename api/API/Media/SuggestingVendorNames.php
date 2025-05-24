<?php
// Establish connection to the database
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Test';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
    
    // $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname", $users, $pwd);
    // // set the PDO error mode to exception
    // $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}

// Get the search term from the React app
$search_term = $_GET['suggestion'];

if(trim($_GET['suggestion']) !== ''){
// Prepare the SQL statement to fetch client names based on the search term
$sql = "SELECT DISTINCT CId, ConsultantName, ConsultantNumber, ConsultantPlace FROM consultant_table WHERE ConsultantName LIKE :suggestion AND `Validity` = 1 LIMIT 5";
$stmt = $pdo->prepare($sql);
$stmt->bindValue(':suggestion', '%' . $search_term . '%');
$stmt->execute();

// Fetch the client names and store them in an array
$vendors = $stmt->fetchAll(PDO::FETCH_ASSOC);
$vendor_details = array();
// Output the client names and contacts
foreach ($vendors as $vendor) {
    $vendordetails = $vendor['CId'] . '-' . $vendor['ConsultantName'] . ' (' . $vendor['ConsultantNumber'] . ')' . ' - ' . $vendor['ConsultantPlace'];
    array_push($vendor_details, $vendordetails);
}

echo json_encode($vendor_details);
}else{
    echo json_encode('');
}

// Close the database connection
$pdo = null;
?>

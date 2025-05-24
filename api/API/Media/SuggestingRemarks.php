<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

ConnectionManager::connect($dbName);
$pdo = ConnectionManager::getConnection();
// Get the search term from the React app
$search_remarks = $_GET['suggestion'];

if(trim($_GET['suggestion']) !== ''){
// Prepare the SQL statement to fetch client names based on the search term
$sql = "SELECT DISTINCT Remarks FROM quote_table WHERE Remarks LIKE :suggestion LIMIT 5";
$stmt = $pdo->prepare($sql);
$stmt->bindValue(':suggestion', '%' . $search_remarks . '%');
$stmt->execute();

// Fetch the remarks and store them in an array
$remarks = $stmt->fetchAll(PDO::FETCH_ASSOC);
$client_details = array();
// Output the client names and contacts
foreach ($remarks as $remark) {
    array_push($client_details, $remark['Remarks']);
}

echo json_encode($client_details);
}else{
    echo json_encode('');
}

// Close the database connection
$pdo = null;
?>

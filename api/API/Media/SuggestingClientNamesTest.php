<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
    
    // Get the search term and type from the React app
    $search_term = $_GET['suggestion'];
    $search_type = isset($_GET['type']) ? $_GET['type'] : 'name'; // default to name search

    // if($dbName === 'Grace Scans'){
        if($search_type === 'contact') {
            // Prepare the SQL statement to fetch client names based on the contact
            $sql = "SELECT DISTINCT ClientName, ClientContact, ID FROM client_table WHERE ClientContact LIKE :suggestion AND ClientName != '' AND Validity = 1";
        } else if($search_type === 'enquiry'){
            $sql = "SELECT e.ClientName, e.ID, e.ClientContact
                    FROM enquiry_table e
                    INNER JOIN (
                        SELECT ClientContact, MAX(ID) AS latestID
                        FROM enquiry_table
                        WHERE ClientName LIKE :suggestion AND Validity = 1
                        GROUP BY ClientContact
                    ) t ON e.ClientContact = t.ClientContact AND e.ID = t.latestID
                    ORDER BY e.ID DESC
                    LIMIT 10";
        }else {
            // Prepare the SQL statement to fetch client names based on the name
            $sql = "SELECT DISTINCT ClientName, ClientContact, ID FROM client_table WHERE ClientName LIKE :suggestion AND Validity = 1";
        }
    // } else{
    //     if($search_type === 'contact') {
    //         // Prepare the SQL statement to fetch client names based on the contact
    //         $sql = "SELECT DISTINCT ClientName, ClientContact FROM client_table WHERE ClientContact LIKE :suggestion AND ClientName != '' AND Validity = 1 LIMIT 5";
    //     } else {
    //         // Prepare the SQL statement to fetch client names based on the name
    //         $sql = "SELECT DISTINCT ClientName, ClientContact FROM client_table WHERE ClientName LIKE :suggestion AND Validity = 1 LIMIT 5";
    //     }
    // }
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':suggestion', '%' . $search_term . '%');
    $stmt->execute();

    // Fetch the client names and store them in an array
    $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $client_details = array();
    // Output the client names and contacts
    foreach ($clients as $client) {
        $clientdetails = $client['ID'].'-'.$client['ClientName'] . '(' . $client['ClientContact'] . ')';
        array_push($client_details, $clientdetails);
    }

    echo json_encode($client_details);

    // Close the database connection
    $pdo = null;
} catch(PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
?>

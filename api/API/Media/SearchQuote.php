<?php
require "ConnectionManager.php";

$dbName = $_GET['JsonDBName'] ?? '';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header('Content-Type: application/json; charset=utf-8');

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
    $searchTerm = $_GET['JsonSearchTerm'] ?? ''; //Get the Search Term from front End

    if(empty($searchTerm)){
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Please provide a valid input"]);
        exit;
    }

    $searchTermArray = explode(" ", $searchTerm); //Splitting Search Term Array
    $searchLength = count($searchTermArray); //Search String Length of the array
    $NoOfQuery = '';
    $queryParts = [];
    $params = [];

    //Loop all the available Inputs
    foreach ($searchTermArray as $term) {
        $queryParts[] = '(q.QuoteId LIKE ? OR q.ClientName LIKE ? OR q.ClientContact LIKE ? OR c.adType LIKE ? OR c.AmountWithoutGST LIKE ?)'; // OR conditions for search term
        $params[] = '%' . $term . '%'; //param 1 QuoteId
        $params[] = '%' . $term . '%'; //param 2 ClientName
        $params[] = '%' . $term ."%"; //param 3 ClientContact
        $params[] = '%' . $term ."%"; //param 4 AdType
        $params[] = '%' . $term ."%"; //param 5 AmountwithoutGst
    }

    $NoOfQuery = implode(' AND ', $queryParts);

    // SQL Statement
    $SQL = "SELECT q.QuoteId as QuoteId, q.ClientName as ClientName, q.ClientContact as ClientContact, c.adType as adType, c.AmountWithoutGst as AmountWithoutGST FROM quote_table q LEFT JOIN quote_cart_mapping_table m ON q.QuoteId = m.QuoteId LEFT JOIN cart_table c ON m.CartId = c.CartId WHERE $NoOfQuery AND c.`Valid Status` = 'Valid' AND c.CartId <> 0 AND c.RateId <> 0 ORDER BY q.QuoteID DESC";

    $stmt = $pdo->prepare($SQL); //prepare the SQL Statement
    $stmt->execute($params); //Execute the statements by sending the params
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC); //Fetch all results

    $formattedResults = [];

    //Send results in SearchString Format
    foreach ($results as $row) {
       $formattedResults[] = $row['QuoteId'] . ' - ' . $row['ClientName'] . (!empty($row['ClientContact']) ? ' - ' . $row['ClientContact'] : ' - No Contact') . ' - ' . $row['adType'] . ' - ₹ '. $row['AmountWithoutGST'];
    }

    // Return the formatted results as a JSON-encoded string array
    echo json_encode($formattedResults);

} catch (PDOException $e) {

    // Return a JSON error response in case of a database error
    http_response_code(500);
    error_log("\nPDO Search Error: " . $e->getMessage(), 3, './PDO Search Error.txt');
    echo json_encode(['error' => 'Error while fetching data']);

} catch (\Throwable $th){
    http_response_code(400);
    error_log("\nSearch Error: " . $e->getMessage(), 3, './Search Error.txt');
    echo json_encode(['error' => 'Unable to fetch data']);
}

<?php
require 'ConnectionManager.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

//set default database name and validate it
$dbName = $_GET['JsonDBName'] ?? 'No DB';

if($dbName === 'No DB'){
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "No Database Found"]);
    exit;
} 

function UpdateQuote($conn, $params){
    try{
     
        $stmt = $conn->prepare("UPDATE quote_table SET `ClientName` = :PDOClientName, `ClientEmail` = :PDOClientEmail, `ClientContact` = :PDOClientContact, `ClientGST` = :PDOClientGST, `LeadDays` = :PDOLeadDays, `Source` = :PDOSource WHERE `QuoteID` = :PDOQuoteId");

        foreach ($params as $key => $value) {
            $stmt->bindValue(":$key", $value);
        }

        $stmt->execute();
        return ["success" => true, "message" => "Quote Updated Successfully!"];
    }catch(PDOException $e){
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Unable to update quote data"]);
        error_log("\nError updating data: " . $e->getMessage(), 3, './Error Logs/Update Error.txt');
        exit;
    }
}

try{
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    //Declare variables
    $tomorrowDate = date('Y-m-d', strtotime('+1 day'));
    $QuoteID = $_GET['JsonQuoteId'] ?? 'No Quote Id';
    $CartID = $_GET['JsonCartId'] ?? 'No Cart Id';
    $QuoteOnly = $_GET['JsonQuoteOnly'] ?? false;
    $CartOnly = $_GET['JsonCartOnly'] ?? false;
    $CartRemove = $_GET['JsonRemoveCart'] ?? false;

    if(!is_int((int)$QuoteID) && !$CartOnly && !$CartRemove){
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Provide a valid Quote ID"]);
        exit;
    }

    if(!is_int((int)$CartID) && !$QuoteOnly){
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Provide a valid Cart ID"]);
        exit;
    }



    $quoteParams = [
        'PDOQuoteId' => $QuoteID,
        'PDOClientName' => $_GET['JsonClientName'] ?? null,  // Default to null if not set
        'PDOClientEmail' => $_GET['JsonClientEmail'] ?? null,  // Default to null if not set
        'PDOClientContact' => $_GET['JsonClientContact'] ?? null,  // Default to null if not set
        'PDOClientGST' => $_GET['JsonClientGST'] ?? "",  // Default to empty string if not set
        'PDOLeadDays' => $_GET['JsonLeadDays'] ?? 1,  // Default to 1 if not set
        'PDOSource' => $_GET['JsonClientSource'] ?? null  // Default to null if not set
    ];


    // $removeParams = [
    //     'PDOCartId' => $CartID
    // ];
    // $mapParams = [
    // 'PDOQuoteID' => $QuoteID,
    // 'PDOCartID' => $CartID,
    // 'PDOTomorrowDate' => $tomorrowDate 
    // ];

    $response = [];
    if($QuoteOnly){
        $quoteResponse = UpdateQuote($pdo, $quoteParams);
        // $mappingResponse = UpdateQuoteCartMapping($mapParams);
        $response = [
            "quoteResponse" => $quoteResponse
        ];
    }else{
        $quoteResponse = UpdateQuote($pdo, $quoteParams);
        // $cartResponse = UpdateCart($pdo, $cartParams);
        $response = [
            "quoteResponse" => $quoteResponse,
            "cartResponse" => $cartResponse
        ];
    }

echo json_encode($response);

}catch(PDOException $e){
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Unable to update data!"]);
    error_log("\nError while Updating data using DB: " . $e->getMessage(), 3, './Error Logs/Update Error.txt');
    exit;
}catch(\Throwable $th){
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error while updating data!"]);
    error_log("\nError while updating data: " . $th->getMessage(), 3, './Error Logs/Update Error.txt');
    exit;
}
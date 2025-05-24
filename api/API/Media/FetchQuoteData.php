<?php
require "ConnectionManager.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

$dbName = $_GET['JsonDBName'] ?? "No DB";

if($dbName === "No DB"){
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "No DB Found"]);
    exit;
}

global $pdo;

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    $QuoteId = $_GET['JsonQuoteId'] ?? '';

    if (empty($QuoteId)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Provide a valid Quote ID"]);
        exit;
    }

    // Fetch and combine all data
    $query = "
        SELECT 
            c.Quantity, c.Width, c.Units, c.AmountWithoutGst, 
            c.Remarks, c.Vendor, c.Margin, c.ratePerUnit, 
            c.CampaignDays, c.`GST%` as GSTPercentage, c.CampaignDurationUnits, c.CartId, c.`Color`, c.`Tick`, c.`Bold`, c.`SemiBold`,
            q.QuoteID, q.ClientName, q.ClientContact, q.ClientEmail, q.Source,
            r.`rateName`, r.`adType`, r.`typeOfAd`, r.`adCategory`, 
            r.`Location`, r.`Package`, r.`minimumUnit`, r.`MinimumPrice`, 
            r.`ratePerUnit`, r.`width`, r.`ValidityDate`, r.`LeadDays`, 
            r.`campaignDurationVisibility`, r.`CampaignDuration(in Days)` as MinimumCampaignDuration, r.`RateID`
        FROM 
            cart_table AS c 
        LEFT JOIN 
            quote_cart_mapping_table AS m ON c.CartID = m.CartID
        LEFT JOIN 
            quote_table AS q ON m.QuoteID = q.QuoteID
        LEFT JOIN 
            rate_table AS r ON c.RateId = r.RateID
        WHERE 
            m.QuoteID = :PDOQuoteId AND c.`Valid Status` = 'Valid'
    ";

    $stmt = $pdo->prepare($query);
    $stmt->bindParam(":PDOQuoteId", $QuoteId);
    $stmt->execute();
    $response = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($response);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode("Unable to Fetch Quote Data");
    error_log("Error in DB Quotes: " . $e->getMessage(), 3, "./Error Logs/PDO_Fetch_Error.txt");
} catch (\Throwable $th){
    http_response_code(400);
    echo json_encode("Problem while fetching Quote Data");
    error_log("Error Fetching Quotes: " . $th->getMessage(), 3, "./Error Logs/PDO_Fetch_Error.txt");
}

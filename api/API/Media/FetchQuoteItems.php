<?php
require "ConnectionManager.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

$dbName = $_GET['JsonDBName'] ?? "No DB";
$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
$offset = ($page - 1) * $limit;

if ($dbName === "No DB") {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "No DB Found"]);
    exit;
}

global $pdo;

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    // Fetch and combine all data with pagination
    $query = "
        SELECT 
            qt.QuoteID, 
            qcm.CartID, 
            qt.ClientName, 
            ct.Admedium, 
            ct.AdType, 
            ct.Adcategory, 
            ct.Quantity, 
            ct.Scheme,
            ct.Amount, 
            ct.`GST%`, 
            ct.Width, 
            ct.Units,
            ct.Bold, 
            ct.SemiBold, 
            ct.Tick,
            ct.AmountwithoutGst,  
            ct.Amount, 
            ct.GSTAmount, 
            ct.rateperunit,
            ct.DateOfRelease,  
            ct.CampaignDays, 
            ct.SpotsPerDay, 
            ct.SpotDuration, 
            ct.DiscountAmount, 
            ct.Margin, 
            ct.Vendor, 
            ct.CampaignDurationUnits, 
            ct.RateId,  
            qcm.NextFollowupDate,
            qcm.MapID,  
            qt.Source, 
            qt.ClientGST, 
            qt.ClientEmail, 
            qt.ClientContact, 
            qt.LeadDays
        FROM 
            quote_cart_mapping_table qcm
        INNER JOIN 
            quote_table qt ON qcm.QuoteID = qt.QuoteID
        INNER JOIN 
            cart_table ct ON qcm.CartID = ct.CartID
        WHERE qcm.Status = 'Followup'
        ORDER BY qcm.EntryDate DESC
        LIMIT :limit OFFSET :offset
    ";

    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    $response = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($response);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Unable to Fetch Quote Data"]);
    error_log("Error in DB Quotes: " . $e->getMessage(), 3, "./Error Logs/PDO_Fetch_Error.txt");
} catch (\Throwable $th) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Problem while fetching Quote Data"]);
    error_log("Error Fetching Quotes: " . $th->getMessage(), 3, "./Error Logs/PDO_Fetch_Error.txt");
}

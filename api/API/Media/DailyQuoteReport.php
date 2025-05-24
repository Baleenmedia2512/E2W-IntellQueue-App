<?php

require 'ConnectionManager.php';

// Set CORS headers
header('Content-Type: application/json');
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Origin: *");

function connectToDB($DBName) {
    try {
        ConnectionManager::connect($DBName);
        return ConnectionManager::getConnection();
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Unable to connect to DB"]);
        error_log("\nError while connecting to DB: " . $e->getMessage(), 3, './Connection_Error.txt');
        exit();
    }
}

function SendWhatsappMessage($License, $API, $Template, $MobileNumber, $Param) {
    try {
        $ParamString = urlencode(implode(',', $Param));
        $BaseURL = "https://app.tendigit.in/api/sendtemplate.php?LicenseNumber=$License&APIKey=$API&Contact=91$MobileNumber&Template=$Template&Param=$ParamString";

        // Initialize cURL
        $ch = curl_init($BaseURL);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        // Execute the request and get the response
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if (curl_errno($ch)) {
            $error = curl_error($ch);
            curl_close($ch);
            return [
                'success' => false,
                'message' => 'cURL Error: ' . $error
            ];
        }

        curl_close($ch);

        if ($httpCode !== 200) {
            error_log("\nError while sending Whatsapp Message: " . $response, 3, './WhatsappError.txt');
            return ['success' => false, 'message' => 'Failed to send message'];
        }

        return ['success' => true, 'response' => $response];
    } catch (Throwable $th) {
        error_log("\nError while sending Whatsapp Message: " . $th->getMessage(), 3, './WhatsappError.txt');
        return ['success' => false, 'message' => 'Unexpected error occurred'];
    }
}

$DBName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Test';
$MobileNumbers = ['7010198963', '7092211201'];
$License = '95445308244';
$API = 'duxby0porheW2IM798tNKCPYH';
$Template = 'daily_quote_status';

// Connect to the database
$pdo = connectToDB($DBName);

// Query for overall summary
$overallStmt = $pdo->prepare(
    "SELECT COUNT(QuoteID) FROM quote_table WHERE EntryDate = CURRENT_DATE"
);

$overallStmt->execute();
$overallResult = $overallStmt->fetch(PDO::FETCH_ASSOC);

$entryDate = isset($overallResult['EntryDate']) ? date('d-M-Y', strtotime($overallResult['EntryDate'])) : date('d-M-Y');
$totalOrders = $overallResult['OrderCount'] ?? 0;
$totalOrderValue = $overallResult['TotalOrderValue'] ?? 0.00;
$totalIncome = $overallResult['TotalIncome'] ?? 0.00;

// Query for rate card-wise breakdown
$rateCardStmt = $pdo->prepare(
    "SELECT
    c.Card,
    COALESCE(
        (SELECT
            SUM(o1.Receivable) + SUM(CAST(o1.AdjustedOrderAmount AS DECIMAL(10, 2)))
            FROM
            order_table o1
            WHERE
            o1.Card = c.Card
            AND DATE(o1.EntryDate) = CURDATE()
            AND o1.OrderNumber > 0
            AND o1.CancelFlag = 0
        ), 0
    ) AS TotalOrderValue,
    COALESCE(
        (SELECT
            SUM(f.Amount)
            FROM
            financial_transaction_table f
            WHERE
            f.OrderNumber IN (
                SELECT o2.OrderNumber
                FROM order_table o2
                WHERE
                o2.Card = c.Card
                AND DATE(o2.EntryDate) = CURDATE()
                AND o2.OrderNumber > 0
                AND o2.CancelFlag = 0
            )
            AND f.ValidStatus = 'Valid'
        ), 0
    ) AS TotalIncome,
    COALESCE(
        (SELECT
            COUNT(DISTINCT o3.OrderNumber)
            FROM
            order_table o3
            WHERE
            o3.Card = c.Card
            AND DATE(o3.EntryDate) = CURDATE()
            AND o3.OrderNumber > 0
            AND o3.CancelFlag = 0
        ), 0
    ) AS OrderCount
    FROM
    (SELECT 'USG Scan' AS Card UNION ALL SELECT 'CT Scan' UNION ALL SELECT 'X-Ray') c;"
);

$rateCardStmt->execute();
$rateCardResults = $rateCardStmt->fetchAll(PDO::FETCH_ASSOC);

// Initialize rate card data
$rateCardData = [
    'USG Scan' => ['Orders' => 0, 'OrderValue' => 0.00, 'Income' => 0.00],
    'CT Scan' => ['Orders' => 0, 'OrderValue' => 0.00, 'Income' => 0.00],
    'X-Ray' => ['Orders' => 0, 'OrderValue' => 0.00, 'Income' => 0.00],
];

foreach ($rateCardResults as $row) {
    $card = $row['Card'];
    if (isset($rateCardData[$card])) {
        $rateCardData[$card]['Orders'] = $row['OrderCount'];
        $rateCardData[$card]['OrderValue'] = $row['TotalOrderValue'];
        $rateCardData[$card]['Income'] = $row['TotalIncome'];
    }
}

// Prepare parameters for the template
$params = [
    $entryDate, // {{1}}
    $totalOrders, // {{2}}
    $totalOrderValue, // {{3}}
    $totalIncome, // {{4}}
    $rateCardData['USG Scan']['Orders'], // {{5}}
    $rateCardData['USG Scan']['OrderValue'], // {{6}}
    $rateCardData['USG Scan']['Income'], // {{7}}
    $rateCardData['CT Scan']['Orders'], // {{8}}
    $rateCardData['CT Scan']['OrderValue'], // {{9}}
    $rateCardData['CT Scan']['Income'], // {{10}}
    $rateCardData['X-Ray']['Orders'], // {{11}}
    $rateCardData['X-Ray']['OrderValue'], // {{12}}
    $rateCardData['X-Ray']['Income'] // {{13}}
];

$responses = [];

    foreach ($MobileNumbers as $MobileNumber) {
        $response = SendWhatsappMessage($License, $API, $Template, $MobileNumber, $params);
        $responses[] = $response;
    }

// Update DIRSentOn if the message was sent successfully
if ($response['success']) {
    $updateStmt = $pdo->prepare(
        "UPDATE order_table SET DIRSentOn = NOW() WHERE EntryDate = :entryDate"
    );
    $updateStmt->execute([':entryDate' => $overallResult['EntryDate']]);
}

echo json_encode($responses);

?>
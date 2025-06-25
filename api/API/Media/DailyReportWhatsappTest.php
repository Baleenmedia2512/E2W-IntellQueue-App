<?php

require 'ConnectionManager.php';

// Set CORS headers
header('Content-Type: application/json');
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Origin: *");

// Function to connect to the database
function connectToDB($DBName) {
    if ($DBName !== 'Grace Scans' && $DBName !== 'Baleen Test' && $DBName !== 'test' && $DBName !== 'gracescans') {
        echo json_encode(["message" => "Configuration for your company is not yet added"]);
        exit();
    }

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

// Function to sanitize text for WhatsApp API
function sanitizeText($text) {
    $text = str_replace(["\n", "\t"], " ", $text);
    $text = preg_replace('/\s{4,}/', ' ', $text);
    return trim($text);
}

// Function to send WhatsApp messages
function sendWhatsappMessage($license, $api, $template, $mobileNumber, $params) {
    try {
        $paramString = urlencode(implode(',', $params));
        $baseURL = "https://app.tendigit.in/api/sendtemplate.php?LicenseNumber=$license&APIKey=$api&Contact=91$mobileNumber&Template=$template&Param=$paramString";

        // Initialize cURL
        $ch = curl_init($baseURL);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        // Execute the request and get the response
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if (curl_errno($ch)) {
            $error = curl_error($ch);
            curl_close($ch);
            return ['success' => false, 'message' => 'cURL Error: ' . $error];
        }

        curl_close($ch);

        if ($httpCode !== 200) {
            error_log("\nError while sending WhatsApp Message: " . $response, 3, './WhatsappError.txt');
            return ['success' => false, 'message' => 'Failed to send message'];
        }

        return ['success' => true, 'response' => $response];
    } catch (Throwable $th) {
        error_log("\nError while sending WhatsApp Message: " . $th->getMessage(), 3, './WhatsappError.txt');
        return ['success' => false, 'message' => 'Unexpected error occurred'];
    }
}

// Configuration
$DBName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Test';
$license = '23799204801';
$api = 'WmwZrVceAsHoft59dv1pM2xP8';
$incomeTemplate = 'new_dir_template';
$mobileNumbersMap = [
    'Baleen Test' => ['7010198963'],
    'test' => ['7010198963'],
];

// Assign mobile numbers based on the database name
$mobileNumbers = isset($mobileNumbersMap[$DBName]) ? $mobileNumbersMap[$DBName] : [];

if (empty($mobileNumbers)) {
    echo json_encode(["message" => "Configuration for your company is not yet added"]);
    exit();
}

// Connect to the database
$pdo = connectToDB($DBName);

// Query for overall summary for the report
$overallStmt = $pdo->prepare(
    "SELECT
        COUNT(DISTINCT(o.OrderNumber)) AS OrderCount,
        (SELECT
            COALESCE(SUM(o1.Receivable), 0)
            + COALESCE(SUM(CAST(o1.AdjustedOrderAmount AS DECIMAL(10, 2))), 0)
            FROM
            order_table o1
            WHERE
            o1.OrderNumber > 0
            AND o1.OrderNumber < 100000
            AND o1.CancelFlag = 0
            AND (
                DATE(o1.OrderDate) = CURDATE()
                OR (DATE(o1.OrderDate) = CURDATE() - INTERVAL 1 DAY AND DATE(o1.EntryDate) = CURDATE())
            )
        ) AS TotalOrderValue,
        (SELECT
            SUM(ft.Amount)
            FROM
            financial_transaction_table ft
            WHERE
            ft.OrderNumber IN (
                SELECT o2.OrderNumber
                FROM order_table o2
                WHERE
                o2.OrderNumber > 0
                AND o2.OrderNumber < 100000
                AND o2.CancelFlag = 0
                AND (
                    DATE(o2.OrderDate) = CURDATE()
                    OR (DATE(o2.OrderDate) = CURDATE() - INTERVAL 1 DAY AND DATE(o2.EntryDate) = CURDATE())
                )
            )
            AND ft.ValidStatus = 'Valid'
            AND ft.TransactionType IN ('Income', 'Investment')
        ) AS TotalIncome
    FROM
        order_table o
    WHERE
        (DATE(o.OrderDate) = CURDATE()
        OR (DATE(o.OrderDate) = CURDATE() - INTERVAL 1 DAY AND DATE(o.EntryDate) = CURDATE()))
        AND o.OrderNumber > 0
        AND o.OrderNumber < 100000
        AND o.CancelFlag = 0
    GROUP BY
        o.OrderDate;"
);

$overallStmt->execute();
$overallResult = $overallStmt->fetch(PDO::FETCH_ASSOC);

$currentDate = date('d-M-Y');
$totalOrders = $overallResult['OrderCount'] ?? 0;
$totalOrderValue = $overallResult['TotalOrderValue'] ?? 0.00;
$totalIncome = $overallResult['TotalIncome'] ?? 0.00;

// Query to get AdType details for each rate card
$adTypeQuery = $pdo->prepare(
    "SELECT 
        o.Card,
        o.AdType,
        COUNT(DISTINCT o.OrderNumber) AS OrderCount,
        SUM(o.Receivable + CAST(o.AdjustedOrderAmount AS DECIMAL(10, 2))) AS OrderValue,
        COALESCE(
            (SELECT SUM(ft.Amount)
            FROM financial_transaction_table ft
            WHERE ft.OrderNumber = o.OrderNumber
            AND ft.ValidStatus = 'Valid'
            AND ft.TransactionType IN ('Income', 'Investment')
        ), 0) AS Income
    FROM 
        order_table o
    WHERE 
        (DATE(o.OrderDate) = CURDATE()
        OR (DATE(o.OrderDate) = CURDATE() - INTERVAL 1 DAY AND DATE(o.EntryDate) = CURDATE()))
        AND o.OrderNumber > 0
        AND o.OrderNumber < 100000
        AND o.CancelFlag = 0
    GROUP BY 
        o.Card, o.AdType
    ORDER BY 
        o.Card, OrderValue DESC"
);

$adTypeQuery->execute();
$adTypeResults = $adTypeQuery->fetchAll(PDO::FETCH_ASSOC);

// Organize AdType data by Card
$adTypeData = [];
foreach ($adTypeResults as $row) {
    $card = $row['Card'];
    if (!isset($adTypeData[$card])) {
        $adTypeData[$card] = [];
    }
    $adTypeData[$card][] = $row;
}

// Initialize rate card data
$rateCardData = [];

// Get rate card data and add adType breakdown to it
foreach ($adTypeData as $card => $adTypes) {
    $rateCardTotalOrders = 0;
    $rateCardTotalOrderValue = 0;
    $rateCardTotalIncome = 0;

    foreach ($adTypes as $adType) {
        $rateCardTotalOrders += $adType['OrderCount'];
        $rateCardTotalOrderValue += $adType['OrderValue'];
        $rateCardTotalIncome += $adType['Income'];
    }

    $rateCardData[] = [
        'rateCardName' => $card,
        'rateCardTotalOrders' => $rateCardTotalOrders,
        'rateCardTotalOrderValue' => $rateCardTotalOrderValue,
        'rateCardTotalIncome' => $rateCardTotalIncome,
        'adTypes' => $adTypes
    ];
}

// Build rate card breakdown in a WhatsApp-friendly format
$rateCardBreakdown = "";
foreach ($rateCardData as $data) {
    // Add rate card header
    $rateCardBreakdown .= "📌 " . $data['rateCardName'] . " ";
    
    // Add AdTypes with bullets
    if (isset($adTypeData[$data['rateCardName']])) {
        foreach ($adTypeData[$data['rateCardName']] as $adType) {
            $rateCardBreakdown .= "• " . $adType['AdType'] . " (Rs" . 
                                number_format($adType['OrderValue'], 2, '.', '') . ") ";
        }
    }
    
    // Add summary with emojis
    $rateCardBreakdown .= "| 📊 Total: " . $data['rateCardTotalOrders'] . " orders ";
    $rateCardBreakdown .= "| 💰 Value: Rs" . number_format($data['rateCardTotalOrderValue'], 2, '.', '') . " ";
    $rateCardBreakdown .= "| 💵 Income: Rs" . number_format($data['rateCardTotalIncome'], 2, '.', '') . " || ";
}

// Final sanitization
$rateCardBreakdown = str_replace(["\n", "\r", "\t"], " ", $rateCardBreakdown);
$rateCardBreakdown = preg_replace('/\s{4,}/', ' ', $rateCardBreakdown);
$rateCardBreakdown = trim($rateCardBreakdown);

// Format parameters (remove all commas from numbers)
$incomeParams = [
    $currentDate, // {{1}} - Date
    $totalOrders, // {{2}} - Total Orders (no formatting)
    "Rs" . number_format($totalOrderValue, 2, '.', ''), // {{3}} - No thousands separator
    "Rs" . number_format($totalIncome, 2, '.', ''), // {{4}} - No thousands separator
    $rateCardBreakdown // {{5}} - Completely flat text
];

// Debug output
error_log("Final params count: " . count($incomeParams));
error_log("Param 5 length: " . strlen($incomeParams[4]));
error_log("Param 5 content: " . substr($incomeParams[4], 0, 100) . "...");

// Send message
foreach ($mobileNumbers as $mobileNumber) {
    $response = sendWhatsappMessage($license, $api, $incomeTemplate, $mobileNumber, $incomeParams);
    echo json_encode($response);
}
?>

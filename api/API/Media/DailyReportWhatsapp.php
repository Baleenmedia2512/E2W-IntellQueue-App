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
$expenseTemplate = 'daily_expense_report_template';
$incomeTemplate = 'report';
$mobileNumbersMap = [
    'Grace Scans' => ['9994443607', '9944084854'],
    'Baleen Test' => ['7010198963'],
    'gracescans' => ['9994443607', '9944084854'],
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

// Query to fetch expense data for daily expense report
$query = "
    SELECT ExpensesCategory, SUM(Amount) AS TotalAmount 
    FROM financial_transaction_table 
    WHERE TransactionType LIKE '%expense%' 
    AND ValidStatus = 'Valid' 
    AND (
        DATE(TransactionDate) = CURDATE() 
        OR (DATE(TransactionDate) = CURDATE() - INTERVAL 1 DAY AND DATE(EntryDate) = CURDATE())
    )
    GROUP BY ExpensesCategory;
";

$stmt = $pdo->prepare($query);
$stmt->execute();
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Calculate total expenses and prepare category-wise breakdown
// Sanitize and prepare category-wise breakdown
$totalExpense = 0.00;
$categoryBreakdown = "";

if (!empty($results)) {
    foreach ($results as $row) {
        $totalExpense += $row['TotalAmount'];
        // Format each category without commas
        $categoryBreakdown .= "*". $row['ExpensesCategory'] . ":* ₹" . number_format($row['TotalAmount'], 2, '.', '') . " | ";
    }
    // Trim trailing separator
    $categoryBreakdown = rtrim($categoryBreakdown, " | ");
} else {
    $categoryBreakdown = "No expenses recorded for today.";
}

// Format the parameters to match the template placeholders
$expenseParams = [
    date('d-M-Y'),  // {{1}} - Date
    "₹" . number_format($totalExpense, 2, '.', ''), // {{2}} - Total Expense without commas
    $categoryBreakdown  // {{3}} - Category-wise Breakdown (single string without commas)
];

// Send WhatsApp messages for daily expense report
$responses = [];
foreach ($mobileNumbers as $mobileNumber) {
    $response = sendWhatsappMessage($license, $api, $expenseTemplate, $mobileNumber, $expenseParams);
    $responses[] = $response;
}

// Query for overall summary for the report
$overallStmt = $pdo->prepare(
    "SELECT
        o.OrderDate,
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
                DATE(o1.OrderDate) = DATE(o.OrderDate)
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
                    DATE(o2.OrderDate) = DATE(o.OrderDate)
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
        o.OrderDate;
    "
);

$overallStmt->execute();
$overallResult = $overallStmt->fetch(PDO::FETCH_ASSOC);

$currentDate = date('d-M-Y');
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
                AND (
                    DATE(o1.OrderDate) = CURDATE()
                    OR (DATE(o1.OrderDate) = CURDATE() - INTERVAL 1 DAY AND DATE(o1.EntryDate) = CURDATE())
                )
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
                    AND (
                        DATE(o2.OrderDate) = CURDATE()
                        OR (DATE(o2.OrderDate) = CURDATE() - INTERVAL 1 DAY AND DATE(o2.EntryDate) = CURDATE())
                    )
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
                AND (
                    DATE(o3.OrderDate) = CURDATE()
                    OR (DATE(o3.OrderDate) = CURDATE() - INTERVAL 1 DAY AND DATE(o3.EntryDate) = CURDATE())
                )
                AND o3.OrderNumber > 0
                AND o3.CancelFlag = 0
            ), 0
        ) AS OrderCount
    FROM
        (SELECT 'USG Scan' AS Card UNION ALL SELECT 'CT Scan' UNION ALL SELECT 'X-Ray') c;
    "
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

// Prepare parameters for the report template
$incomeParams = [
    $currentDate, // {{1}}
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

// Send WhatsApp messages for the report
foreach ($mobileNumbers as $mobileNumber) {
    $response = sendWhatsappMessage($license, $api, $incomeTemplate, $mobileNumber, $incomeParams);
    $responses[] = $response;
}

if ($response['success']) {
    $updateStmt = $pdo->prepare(
    "UPDATE order_table 
     SET DIRSentOn = NOW() 
     WHERE OrderNumber IN (
         SELECT DISTINCT OrderNumber 
         FROM order_table 
         WHERE (DATE(OrderDate) = CURDATE() OR (DATE(OrderDate) = CURDATE() - INTERVAL 1 DAY AND EntryDate = CURDATE())) 
         AND OrderNumber > 0 
         AND OrderNumber < 100000 
         AND CancelFlag = 0
     )"
);

    // ✅ Remove bound parameter, since no placeholders exist in the query
    $updateStmt->execute();
}

// Return response
echo json_encode($responses);

?>

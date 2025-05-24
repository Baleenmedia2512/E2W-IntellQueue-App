<?php

require 'ConnectionManager.php';

// Set CORS headers
header('Content-Type: application/json');
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Origin: *");

// Function to connect to the database
function connectToDB($DBName) {
    // if ($DBName !== 'Grace Scans') {
    //     echo json_encode(["message" => "Configuration for your DB is not yet added"]);
    //     exit();
    // }

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
$template = 'daily_expense_report_template_test2'; // Replace with the correct WhatsApp template name
$mobileNumbers = ['7010198963']; // Replace with the intended recipients

// Connect to the database
$pdo = connectToDB($DBName);

// Query to fetch expense data
$query = "
    SELECT ExpensesCategory, SUM(Amount) AS TotalAmount 
    FROM financial_transaction_table 
    WHERE TransactionType LIKE '%expense%' 
    AND ValidStatus = 'Valid' 
    AND DATE(EntryDate) = '2025-01-22' 
    GROUP BY ExpensesCategory
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
        // Add bullet point (•) or checkmark (✔️) for each category
        $categoryBreakdown .= "• *" . $row['ExpensesCategory'] . ":* ₹" . number_format($row['TotalAmount'], 2) . " | ";
    }
    // Trim trailing separator
    $categoryBreakdown = rtrim($categoryBreakdown, " | ");
} else {
    $categoryBreakdown = "No expenses recorded for today.";
}

// Replace tabs and excessive spaces
$categoryBreakdown = preg_replace('/\t+/', ' ', $categoryBreakdown); // Replace tabs
$categoryBreakdown = preg_replace('/ {2,}/', ' ', $categoryBreakdown); // Replace multiple spaces


// Prepare parameters for the WhatsApp template
$date = date('d-M-Y');
$params = [
    $date,              // {{1}} - Date
    "₹" . number_format($totalExpense, 2), // {{2}} - Total Expense
    $categoryBreakdown  // {{3}} - Category-wise Breakdown
];

// Send WhatsApp messages
$responses = [];
foreach ($mobileNumbers as $mobileNumber) {
    $response = sendWhatsappMessage($license, $api, $template, $mobileNumber, $params);
    $responses[] = $response;
}

// Return response
echo json_encode($responses);

?>

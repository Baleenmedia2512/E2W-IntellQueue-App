<?php

require "ConnectionManager.php";

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

// Extract input parameters
$companyName = $_POST['JsonCompanyName'] ?? null;
$billNumber = $_POST['JsonBillNumber'] ?? "";
$billDate = $_POST['JsonBillDate'] ?? "";
$orderNumber = $_POST['JsonOrderNumber'] ?? "";
$orderAmountExclGST = $_POST['JsonOrderAmountExclGST'] ?? "";
$gstAmount = $_POST['JsonGSTAmount'] ?? "";
$entryUser = $_POST['JsonEntryUser'] ?? "";
$notUploaded = $_POST['JsonIsNotUploaded'] ?? false;

// Initialize response structure
$response = ["status" => "error", "message" => "Unknown error occurred."];

$FTPSERVER = "ftp.baleenmedia.com";
$FTPUSER = "uploadbills@baleenmedia.com";
$FTPPASS = "Bills@123#";
$DIR = "/$companyName/Bills/";

// Centralized error handling function
function logAndRespond($message, $file, $httpCode = 500) {
    error_log("[" . date("Y-m-d H:i:s") . "] $message\n", 3, $file);
    http_response_code($httpCode);
    echo json_encode(["status" => "error", "message" => $message]);
    exit;
}

// Establish database connection
try {
    ConnectionManager::connect($companyName);
    $pdo = ConnectionManager::getConnection();
} catch (PDOException $e) {
    logAndRespond("Error connecting to database: " . $e->getMessage(), "./Error Logs/Connection_Error.txt");
}

// Prepare parameters for database insertion
$insertParams = [
    'PDOEntryUser' => $entryUser,
    'PDOBillNumber' => $billNumber,
    'PDOBillDate' => $billDate,
    'PDOAmountExclGST' => $orderAmountExclGST,
    'PDOGSTAmount' => $gstAmount,
    'PDOOrderNumber' => $orderNumber,
    'PDOFileName' => $_FILES['JsonFile']['name'] ?? ''
];

// Function to insert bill data
function insertBillData($conn, $data) {
    try {
        $stmt = $conn->prepare("
            INSERT INTO bill_table 
            (`EntryDate`, `EntryUser`, `BillNumber`, `BillDate`, `AmountExcludingGST`, `GSTAmount`, `OrderNumber`, `SoftcopyLocation`)
            VALUES (CURRENT_DATE, :PDOEntryUser, :PDOBillNumber, :PDOBillDate, :PDOAmountExclGST, :PDOGSTAmount, :PDOOrderNumber, :PDOFileName)
        ");
        $stmt->execute($data);
    } catch (PDOException $e) {
        logAndRespond("Error inserting data: " . $e->getMessage(), "./Error Logs/Insert_Error.txt");
    }
}

// Function to handle FTP upload
function uploadFileToFTP($fileTmp, $fileName, $server, $user, $pass, $dir) {
    $ftpConn = ftp_connect($server);
    if (!$ftpConn) {
        logAndRespond("FTP connection failed.", "./Error Logs/FTP_Error.txt");
    }

    $login = ftp_login($ftpConn, $user, $pass);
    if (!$login) {
        ftp_close($ftpConn);
        logAndRespond("FTP login failed.", "./Error Logs/FTP_Error.txt");
    }

    if (!ftp_put($ftpConn, $dir . $fileName, $fileTmp, FTP_BINARY)) {
        ftp_close($ftpConn);
        logAndRespond("Error uploading file to FTP server.", "./Error Logs/FTP_Error.txt");
    }

    ftp_close($ftpConn);
}

// File upload handling
if (isset($_FILES['JsonFile']) && $_FILES['JsonFile']['error'] === UPLOAD_ERR_OK) {
    $fileTmp = $_FILES['JsonFile']['tmp_name'];
    $fileName = $_FILES['JsonFile']['name'];

    if ($notUploaded) {
        // Upload file to FTP if not already uploaded
        uploadFileToFTP($fileTmp, $fileName, $FTPSERVER, $FTPUSER, $FTPPASS, $DIR);
    }

    // Insert record into the database
    insertBillData($pdo, $insertParams);
    $response = ["status" => "success", "message" => "Bill added successfully!"];
} else {
    $error = isset($_FILES['JsonFile']) ? $_FILES['JsonFile']['error'] : 'No file data received.';
    logAndRespond("File upload failed: " . $error, "./Error Logs/File_Upload_Error.txt");
}

// Return response
http_response_code(200);
echo json_encode($response);
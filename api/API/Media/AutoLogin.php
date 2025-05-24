<?php
require 'ConnectionManager.php';

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$companyName = $input['JsonCompanyName'] ?? null;

if (!$companyName) {
    http_response_code(400);
    echo json_encode(["error" => "Missing companyName"]);
    exit;
}

try {
    ConnectionManager::connect($companyName);
    $pdo = ConnectionManager::getConnection();
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Connection failed", "details" => $e->getMessage()]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT userName, password, AppRights 
        FROM employee_table 
        WHERE AppRights = 'Queue System' 
        AND Status = 'Active' 
        LIMIT 1
    ");
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        http_response_code(403);
        echo json_encode(["error" => "Company not found or no active user with 'Queue System' rights"]);
        exit;
    }

    $username = $row['userName'];
    $password = $row['password'];
    $appRights = $row['AppRights'];

    $loginUrl = sprintf(
        'https://orders.baleenmedia.com/API/Media/Login.php?JsonDBName=%s&JsonUserName=%s&JsonPassword=%s',
        urlencode($companyName),
        urlencode($username),
        urlencode($password)
    );

    $response = file_get_contents($loginUrl);

    if ($response === FALSE) {
        http_response_code(500);
        echo json_encode(["error" => "Login API request failed"]);
        exit;
    }

    $decoded = json_decode($response, true);

    if ($decoded === null || (is_string($decoded) && ($decoded === "Wrong Details" || $decoded === "Please enter Valid Details!!"))) {
        http_response_code(401);
        echo json_encode(["error" => "Invalid login credentials", "message" => $response]);
        exit;
    }

    // If decoded properly and login successful
    if (is_array($decoded)) {
        $decoded['userName'] = $username;
        $decoded['appRights'] = $appRights;
        echo json_encode($decoded);
    } else {
        // Fallback for unexpected non-JSON string
        echo json_encode(["error" => "Unexpected response", "message" => $response]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error", "details" => $e->getMessage()]);
}

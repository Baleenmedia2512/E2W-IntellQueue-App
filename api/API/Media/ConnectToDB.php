<?php
include_once('../../config.php');

$servername = DB_HOST;
$username = DB_USERNAME;
$password = DB_PASSWORD;
$database = DB_DATABASE;

try {
    $pdo = new PDO("mysql:host=$servername;dbname=$database", $username, $password);
    // Set the PDO error mode to exception
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
?>
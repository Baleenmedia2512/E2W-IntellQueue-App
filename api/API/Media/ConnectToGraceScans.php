<?php

$servername = 'localhost';
$username = 'baleeed5_gracescans';
$password = 'Grace@123#';
$database = 'baleeed5_gracescans';

try {
    $pdo = new PDO("mysql:host=$servername;dbname=$database", $username, $password);
    // Set the PDO error mode to exception
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
?>
<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    include('db.php');
    //fetching cse name from App
    $json = file_get_contents('php://input');

    // decoding the received JSON and store into $obj variable.
    $obj = json_decode($json, true);
    $cse = $obj['JsonCSE'];
    $contact = $obj['JsonClientContact'];
    $source = $obj['JsonSource'];
    $clientName = $obj['JsonClientName'];

    // Recipient
    if ($cse == 'Usha') {
        $to = 'baleenmedia@baleenmedia.com';
    } elseif ($cse == "Yuva") {
        $to = "siva@baleenmedia.com";
    } else {
        $to = $cse . '@baleenmedia.com';
    }

    try {
        $result = $mysqli->query("SELECT MAX(ID) FROM enquiry_table");
        $row = $result->fetch_assoc();
        $highest_id = $row["MAX(ID)"];
        $enquiry_id = $highest_id + 1;
    } catch (Exception $e) {
        echo 'Message: ' . $e->getMessage();
    }

    // Sender
    $from = 'leenah.grace@baleenmedia.com';
    $fromName = "Leenah Grace";

    // Email Subject
    $subject = 'Enquiry#' . $enquiry_id . ' Received! <' . $contact . '>';

    // Email body content
    $headers = "From: $fromName" . " <" . $from . ">" . "\r\n" . "CC: leenah.grace@baleenmedia.com";

    // Multipart Boundary
    $message = "You got an enquiry." . "\n" . "Details are below: " . "\n" . "Client Name: " . $clientName . "\n" . "Client Phone: " . $contact . "\n" . "Source: " . $source;
    $returnpath = "-f" . $from;

    // Send email
    $mail = @mail($to, $subject, $message, $headers, $returnpath);

    // Email status
    echo json_encode($mail ? "Email sent successfully!" : "Email sending failed.");
} catch (Exception $e) {
    echo 'Message: ' . $e->getMessage();
}
?>
<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

// Retrieve the PDF data from the request body
$pdfDataUri = file_get_contents('php://input');

// Generate a unique filename for the PDF
$filename = 'generated-pdf-' . uniqid() . '.pdf';

// Specify the path where the PDF file will be saved
$filepath = '/' . $filename;

// Decode the base64-encoded PDF data
$pdfData = base64_decode(preg_replace('#^data:application/\w+;base64,#i', '', $pdfDataUri));

// Save the PDF file
file_put_contents($filepath, $pdfData);

// Respond with a success message or any desired response
echo json_encode(['success' => true, 'filename' => $filename]);
?>
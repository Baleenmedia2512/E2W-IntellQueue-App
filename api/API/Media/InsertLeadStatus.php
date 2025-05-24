<?php
// Ensure no whitespace or BOM exists before this tag

// Set CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['success' => false, 'message' => "Only POST requests are allowed"]);
    exit();
}

try {
    // Get JSON input from the request body
    $input = json_decode(file_get_contents('php://input'), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON input.");
    }

    // Sanitize and assign the database name; default to 'Baleen Test'
    $dbName = isset($input['JsonDBName']) ? htmlspecialchars($input['JsonDBName'], ENT_QUOTES, 'UTF-8') : 'Baleen Test';

    // Include the ConnectionManager and connect to the database
    require "ConnectionManager.php";
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Retrieve and sanitize all input data
    $leadId            = isset($input['JsonLead_ID']) ? (int)$input['JsonLead_ID'] : 0;
    $entryUser         = isset($input['JsonEntryUser']) ? htmlspecialchars($input['JsonEntryUser'], ENT_QUOTES, 'UTF-8') : '';
    $leadDate          = isset($input['JsonLeadDate']) ? htmlspecialchars($input['JsonLeadDate'], ENT_QUOTES, 'UTF-8') : '';
    $leadTime          = isset($input['JsonLeadTime']) ? htmlspecialchars($input['JsonLeadTime'], ENT_QUOTES, 'UTF-8') : '';
    $platform          = isset($input['JsonPlatform']) ? htmlspecialchars($input['JsonPlatform'], ENT_QUOTES, 'UTF-8') : '';
    $clientName        = isset($input['JsonClientName']) ? htmlspecialchars($input['JsonClientName'], ENT_QUOTES, 'UTF-8') : '';
    $clientContact     = isset($input['JsonClientContact']) ? htmlspecialchars($input['JsonClientContact'], ENT_QUOTES, 'UTF-8') : '';
    $clientEmail       = isset($input['JsonClientEmail']) ? htmlspecialchars($input['JsonClientEmail'], ENT_QUOTES, 'UTF-8') : '';
    $description       = isset($input['JsonDescription']) ? htmlspecialchars($input['JsonDescription'], ENT_QUOTES, 'UTF-8') : '';
    $status            = isset($input['JsonStatus']) ? htmlspecialchars($input['JsonStatus'], ENT_QUOTES, 'UTF-8') : '';
    $rejectionReason   = isset($input['JsonRejectionReason']) ? htmlspecialchars($input['JsonRejectionReason'], ENT_QUOTES, 'UTF-8') : '';
    $leadType          = isset($input['JsonLeadType']) ? htmlspecialchars($input['JsonLeadType'], ENT_QUOTES, 'UTF-8') : '';
    $previousStatus    = isset($input['JsonPreviousStatus']) ? htmlspecialchars($input['JsonPreviousStatus'], ENT_QUOTES, 'UTF-8') : '';
    $nextFollowupDate  = isset($input['JsonNextFollowupDate']) ? htmlspecialchars($input['JsonNextFollowupDate'], ENT_QUOTES, 'UTF-8') : '';
    $nextFollowupTime  = isset($input['JsonNextFollowupTime']) ? htmlspecialchars($input['JsonNextFollowupTime'], ENT_QUOTES, 'UTF-8') : '';
    $clientCompanyName = isset($input['JsonClientCompanyName']) ? htmlspecialchars($input['JsonClientCompanyName'], ENT_QUOTES, 'UTF-8') : '';
    $remarks           = isset($input['JsonRemarks']) ? htmlspecialchars($input['JsonRemarks'], ENT_QUOTES, 'UTF-8') : '';
    $handledBy         = isset($input['JsonHandledBy']) ? htmlspecialchars($input['JsonHandledBy'], ENT_QUOTES, 'UTF-8') : '';
    $prospectType      = isset($input['JsonProspectType']) ? htmlspecialchars($input['JsonProspectType'], ENT_QUOTES, 'UTF-8') : '';
    $isUnreachable     = isset($input['JsonIsUnreachable']) ? (int)$input['JsonIsUnreachable'] : 0;
    $sheetId           = isset($input['JsonSheetId']) ? (int)$input['JsonSheetId'] : 0;
    $QuoteSentStatus = isset($input['JsonQuoteSent']) ? (int)($input['JsonQuoteSent']) : 0;

    // If PreviousStatus is not "Convert", check if a record already exists with the same ClientContact and Status
    if (isset($input['JsonLead_ID'])) {
 
            // Update the record with the maximum ID.
            $updateStmt = $pdo->prepare("UPDATE leads_tracking_table SET 
                    Status = :StatusUpdate, 
                    RejectionReason = :RejectionReasonPDO, 
                    PreviousStatus = :PreviousStatusPDO, 
                    NextFollowupDate = :NextFollowupDatePDO, 
                    NextFollowupTime = :NextFollowupTimePDO, 
                    Remarks = :RemarksPDO, 
                    HandledBy = :HandledByPDO, 
                    ModifiedAt = CURRENT_TIMESTAMP, 
                    ModifiedOn = CURRENT_TIMESTAMP, 
                    ModifiedBy = :ModifiedByPDO,
                    QuoteSentStatus = :QuoteSentPDO
                WHERE Lead_ID = :leadIdPDO");
    
            $updateStmt->bindParam(':StatusUpdate', $status, PDO::PARAM_STR);
            $updateStmt->bindParam(':RejectionReasonPDO', $rejectionReason, PDO::PARAM_STR);
            $updateStmt->bindParam(':PreviousStatusPDO', $previousStatus, PDO::PARAM_STR);
            $updateStmt->bindParam(':NextFollowupDatePDO', $nextFollowupDate, PDO::PARAM_STR);
            $updateStmt->bindParam(':NextFollowupTimePDO', $nextFollowupTime, PDO::PARAM_STR);
            $updateStmt->bindParam(':RemarksPDO', $remarks, PDO::PARAM_STR);
            $updateStmt->bindParam(':HandledByPDO', $entryUser, PDO::PARAM_STR);
            $updateStmt->bindParam(':ModifiedByPDO', $entryUser, PDO::PARAM_STR);
            $updateStmt->bindParam(':leadIdPDO', $leadId, PDO::PARAM_INT);
            $updateStmt->bindParam(':QuoteSentPDO', $QuoteSentStatus, PDO::PARAM_INT);
    
            if ($updateStmt->execute()) {
                $response = [
                    'status'  => 'success',
                    'message' => 'Data updated successfully.'
                ];
                http_response_code(200);
                echo json_encode($response);
            } else {
                $errorInfo = $updateStmt->errorInfo();
                throw new Exception("Failed to update data: " . $errorInfo[2]);
            }
            exit();
    }

    // If no matching record exists (or PreviousStatus is "Convert"), proceed with the INSERT
    $sql = "INSERT INTO leads_tracking_table (
                EntryUser, LeadDate, LeadTime, Platform, ClientName, ClientContact, ClientEmail,
                EnquiryDescription, Status, RejectionReason, LeadType, PreviousStatus, NextFollowupDate,
                NextFollowupTime, ClientCompanyName, Remarks, HandledBy, IsUnreachable, ProspectType, SheetId
            ) VALUES (
                :EntryUserPDO, :LeadDatePDO, :LeadTimePDO, :PlatformPDO, :ClientNamePDO, :ClientContactPDO, :ClientEmailPDO,
                :EnquiryDescriptionPDO, :StatusPDO, :RejectionReasonPDO, :LeadTypePDO, :PreviousStatusPDO, :NextFollowupDatePDO,
                :NextFollowupTimePDO, :ClientCompanyNamePDO, :RemarksPDO, :HandledByPDO, :IsUnreachablePDO, :ProspectTypePDO, :SheetIdPDO
            )";
    $stmt = $pdo->prepare($sql);
    if (!$stmt) {
        throw new Exception("Failed to prepare the SQL statement.");
    }

    // Bind parameters for the INSERT statement
    $stmt->bindParam(':EntryUserPDO', $entryUser, PDO::PARAM_STR);
    $stmt->bindParam(':LeadDatePDO', $leadDate, PDO::PARAM_STR);
    $stmt->bindParam(':LeadTimePDO', $leadTime, PDO::PARAM_STR);
    $stmt->bindParam(':PlatformPDO', $platform, PDO::PARAM_STR);
    $stmt->bindParam(':ClientNamePDO', $clientName, PDO::PARAM_STR);
    $stmt->bindParam(':ClientContactPDO', $clientContact, PDO::PARAM_STR);
    $stmt->bindParam(':ClientEmailPDO', $clientEmail, PDO::PARAM_STR);
    $stmt->bindParam(':EnquiryDescriptionPDO', $description, PDO::PARAM_STR);
    $stmt->bindParam(':StatusPDO', $status, PDO::PARAM_STR);
    $stmt->bindParam(':RejectionReasonPDO', $rejectionReason, PDO::PARAM_STR);
    $stmt->bindParam(':LeadTypePDO', $leadType, PDO::PARAM_STR);
    $stmt->bindParam(':PreviousStatusPDO', $previousStatus, PDO::PARAM_STR);
    $stmt->bindParam(':NextFollowupDatePDO', $nextFollowupDate, PDO::PARAM_STR);
    $stmt->bindParam(':NextFollowupTimePDO', $nextFollowupTime, PDO::PARAM_STR);
    $stmt->bindParam(':ClientCompanyNamePDO', $clientCompanyName, PDO::PARAM_STR);
    $stmt->bindParam(':RemarksPDO', $remarks, PDO::PARAM_STR);
    $stmt->bindParam(':HandledByPDO', $handledBy, PDO::PARAM_STR);
    $stmt->bindParam(':IsUnreachablePDO', $isUnreachable, PDO::PARAM_INT);
    $stmt->bindParam(':ProspectTypePDO', $prospectType, PDO::PARAM_STR);
    $stmt->bindParam(':SheetIdPDO', $sheetId, PDO::PARAM_INT);

    if ($stmt->execute()) {
        $response = [
            'status'  => 'success',
            'message' => 'Data inserted successfully.'
        ];
        http_response_code(200);
    } else {
        $errorInfo = $stmt->errorInfo();
        throw new Exception("Failed to insert data: " . $errorInfo[2]);
    }

} catch (Exception $e) {
    http_response_code(500);
    $response = [
        'status'  => 'error',
        'message' => $e->getMessage()
    ];
}

echo json_encode($response);
?>

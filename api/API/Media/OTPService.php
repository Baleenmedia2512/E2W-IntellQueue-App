<?php
// OTPService.php

class OTPService {
    private $pdo;
    private $otpLength = 4;
    private $otpValiditySeconds = 300; // 5 minutes

    public function __construct($dbName) {
        // Connect to the database using the provided dbName
        require 'ConnectionManager.php';
        
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Headers: *");

        try {
            ConnectionManager::connect($dbName);
            $this->pdo = ConnectionManager::getConnection();
        } catch (PDOException $e) {
            echo "Connection failed: " . $e->getMessage();
            exit();
        }
    }

    private function generateOTP() {
        return str_pad(random_int(0, pow(10, $this->otpLength) - 1), $this->otpLength, '0', STR_PAD_LEFT);
    }

    public function sendOTP($clientContact) {
        // Invalidate previous OTP if any
        $this->invalidatePreviousOTP($clientContact);

        // Generate new OTP and hash it
        $otp = $this->generateOTP();
        $otpHash = password_hash($otp, PASSWORD_DEFAULT);
        $expiresAt = date('Y-m-d H:i:s', time() + $this->otpValiditySeconds);

        // Insert new OTP into the database
        $this->pdo->prepare("INSERT INTO otp_tokens_table (ClientContact, OTPHash, ExpiresAt) VALUES (?, ?, ?)")
            ->execute([$clientContact, $otpHash, $expiresAt]);

        // Return the OTP for now (in production, send via SMS/WhatsApp)
        return $otp;
    }

    public function verifyOTP($clientContact, $inputOtp) {
        $stmt = $this->pdo->prepare("
            SELECT ID, OTPHash, ExpiresAt 
            FROM otp_tokens_table 
            WHERE ClientContact = ? AND IsActive = TRUE 
            ORDER BY ID DESC 
            LIMIT 1
        ");
        $stmt->execute([$clientContact]);
        $otpData = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$otpData) {
            return ['success' => false, 'message' => 'No OTP found or already expired.'];
        }

        if (new DateTime() > new DateTime($otpData['ExpiresAt'])) {
            return ['success' => false, 'message' => 'OTP has expired.'];
        }

        if (!password_verify($inputOtp, $otpData['OTPHash'])) {
            return ['success' => false, 'message' => 'Invalid OTP.'];
        }

        // Mark as verified and deactivate
        $this->pdo->prepare("UPDATE otp_tokens_table SET Verified = TRUE, IsActive = FALSE WHERE ID = ?")
            ->execute([$otpData['ID']]);

        return ['success' => true, 'message' => 'OTP verified successfully.'];
    }

    // Helper method to invalidate previous OTP
    private function invalidatePreviousOTP($clientContact) {
        // Mark the previous OTP as inactive
        $this->pdo->prepare("UPDATE otp_tokens_table SET IsActive = FALSE WHERE ClientContact = ? AND IsActive = TRUE")
            ->execute([$clientContact]);
    }
}
?>

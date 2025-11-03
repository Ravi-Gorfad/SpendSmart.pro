package com.spendsmart.SpendSmart_pro.controller;

import com.spendsmart.SpendSmart_pro.dto.request.ForgotPasswordRequest;
import com.spendsmart.SpendSmart_pro.dto.request.ResetPasswordRequest;
import com.spendsmart.SpendSmart_pro.dto.request.VerifyOtpRequest;
import com.spendsmart.SpendSmart_pro.entity.User;
import com.spendsmart.SpendSmart_pro.exception.*;
import com.spendsmart.SpendSmart_pro.repository.UserRepository;
import com.spendsmart.SpendSmart_pro.service.EmailService;
import com.spendsmart.SpendSmart_pro.service.OtpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/password")
@RequiredArgsConstructor
@Slf4j
public class ForgotPasswordController {

    private final UserRepository userRepository;
    private final OtpService otpService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    /**
     * Step 1: Send OTP to email for password reset
     * Only sends OTP if email exists in database
     */
    @PostMapping("/forgot")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        log.info("Forgot password request received for email: {}", request.getEmail());
        
        // Check if user exists with this email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("No account found with this email address"));

        // Generate OTP
        String otp = otpService.generateOtp();
        otpService.storePasswordResetOtp(request.getEmail(), otp);

        // Send OTP email asynchronously
        emailService.sendForgotPasswordOtpEmail(request.getEmail(), otp, user.getUsername());

        Map<String, String> response = new HashMap<>();
        response.put("message", "Password reset OTP sent to your email");
        response.put("email", request.getEmail());
        
        log.info("Password reset OTP sent successfully to: {}", request.getEmail());
        return ResponseEntity.ok(response);
    }

    /**
     * Step 2: Verify OTP for password reset
     * Reuses existing OTP verification logic (DRY principle)
     */
    @PostMapping("/verify-reset-otp")
    public ResponseEntity<?> verifyResetOtp(@Valid @RequestBody VerifyOtpRequest request) {
        log.info("OTP verification request received for password reset: {}", request.getEmail());
        
        // Verify OTP using password reset OTP storage
        boolean isValid = otpService.verifyPasswordResetOtp(request.getEmail(), request.getOtp());
        
        if (!isValid) {
            throw new InvalidOtpException("Invalid or expired OTP");
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", "OTP verified successfully. You can now reset your password.");
        response.put("email", request.getEmail());
        
        log.info("Password reset OTP verified successfully for: {}", request.getEmail());
        return ResponseEntity.ok(response);
    }

    /**
     * Step 3: Reset password after OTP verification
     * Validates password match and updates user password
     */
    @PostMapping("/reset")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        log.info("Password reset request received for email: {}", request.getEmail());
        
        // Validate password match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New password and confirm password do not match");
        }

        // Verify that OTP was verified (check if OTP still exists)
        if (!otpService.hasPasswordResetOtp(request.getEmail())) {
            throw new BadRequestException("Please verify OTP first before resetting password");
        }

        // Find user
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        // Remove OTP after successful password reset
        otpService.removePasswordResetOtp(request.getEmail());

        // Send password reset success email asynchronously
        emailService.sendPasswordResetSuccessEmail(user.getEmail(), user.getUsername());

        Map<String, String> response = new HashMap<>();
        response.put("message", "Password reset successful. You can now login with your new password.");
        response.put("username", user.getUsername());
        
        log.info("Password reset completed successfully for: {}", request.getEmail());
        return ResponseEntity.ok(response);
    }

    /**
     * Resend OTP for password reset
     */
    @PostMapping("/resend-reset-otp")
    public ResponseEntity<?> resendResetOtp(@Valid @RequestBody ForgotPasswordRequest request) {
        log.info("Resend password reset OTP request received for email: {}", request.getEmail());
        
        // Check if user exists
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("No account found with this email address"));

        // Check if there's an existing password reset OTP request
        if (!otpService.hasPasswordResetOtp(request.getEmail())) {
            throw new BadRequestException("No active password reset request found. Please initiate forgot password first.");
        }

        // Generate and send new OTP (old OTP will be invalidated)
        String newOtp = otpService.resendPasswordResetOtp(request.getEmail());
        
        // Send new OTP email asynchronously
        emailService.sendForgotPasswordOtpEmail(request.getEmail(), newOtp, user.getUsername());

        Map<String, String> response = new HashMap<>();
        response.put("message", "New password reset OTP sent to your email");
        response.put("email", request.getEmail());
        
        log.info("New password reset OTP sent successfully to: {}", request.getEmail());
        return ResponseEntity.ok(response);
    }
}

package com.spendsmart.SpendSmart_pro.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class OtpService {

    private final Map<String, OtpData> otpStorage = new ConcurrentHashMap<>();
    private final Map<String, OtpData> passwordResetOtpStorage = new ConcurrentHashMap<>();
    private final Map<String, RegisterData> pendingRegistrations = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();
    private static final int OTP_LENGTH = 6;
    private static final int OTP_VALIDITY_MINUTES = 10;

    // Inner class to store OTP with expiry time
    private static class OtpData {
        String otp;
        LocalDateTime expiryTime;

        OtpData(String otp, LocalDateTime expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
        }
    }

    // Inner class to store pending registration data
    public static class RegisterData {
        private String username;
        private String firstname;
        private String middlename;
        private String lastname;
        private String email;
        private String password;
        private String phoneNumber;
        private String street;
        private String city;
        private String state;
        private String country;

        public RegisterData(String username, String firstname, String middlename, String lastname,
                          String email, String password, String phoneNumber, String street,
                          String city, String state, String country) {
            this.username = username;
            this.firstname = firstname;
            this.middlename = middlename;
            this.lastname = lastname;
            this.email = email;
            this.password = password;
            this.phoneNumber = phoneNumber;
            this.street = street;
            this.city = city;
            this.state = state;
            this.country = country;
        }

        // Getters
        public String getUsername() { return username; }
        public String getFirstname() { return firstname; }
        public String getMiddlename() { return middlename; }
        public String getLastname() { return lastname; }
        public String getEmail() { return email; }
        public String getPassword() { return password; }
        public String getPhoneNumber() { return phoneNumber; }
        public String getStreet() { return street; }
        public String getCity() { return city; }
        public String getState() { return state; }
        public String getCountry() { return country; }
    }

    /**
     * Generate a 6-digit OTP
     */
    public String generateOtp() {
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    /**
     * Store OTP for an email with expiry time
     */
    @CachePut(value = "otpCache", key = "#email")
    public String storeOtp(String email, String otp) {
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(OTP_VALIDITY_MINUTES);
        otpStorage.put(email, new OtpData(otp, expiryTime));
        log.info("OTP stored for email: {} with expiry at: {}", email, expiryTime);
        return otp;
    }

    /**
     * Verify OTP for an email
     */
    public boolean verifyOtp(String email, String otp) {
        OtpData otpData = otpStorage.get(email);
        
        if (otpData == null) {
            log.warn("No OTP found for email: {}", email);
            return false;
        }

        if (LocalDateTime.now().isAfter(otpData.expiryTime)) {
            log.warn("OTP expired for email: {}", email);
            otpStorage.remove(email);
            return false;
        }

        boolean isValid = otpData.otp.equals(otp);
        if (isValid) {
            log.info("OTP verified successfully for email: {}", email);
        } else {
            log.warn("Invalid OTP provided for email: {}", email);
        }
        
        return isValid;
    }

    /**
     * Remove OTP after successful verification
     */
    @CacheEvict(value = "otpCache", key = "#email")
    public void removeOtp(String email) {
        otpStorage.remove(email);
        log.info("OTP removed for email: {}", email);
    }

    /**
     * Store pending registration data
     */
    public void storePendingRegistration(String email, RegisterData registerData) {
        pendingRegistrations.put(email, registerData);
        log.info("Pending registration data stored for email: {}", email);
    }

    /**
     * Get pending registration data
     */
    public RegisterData getPendingRegistration(String email) {
        return pendingRegistrations.get(email);
    }

    /**
     * Remove pending registration data
     */
    public void removePendingRegistration(String email) {
        pendingRegistrations.remove(email);
        log.info("Pending registration data removed for email: {}", email);
    }

    /**
     * Check if OTP exists for an email
     */
    public boolean hasOtp(String email) {
        return otpStorage.containsKey(email);
    }

    /**
     * Resend OTP - generates new OTP and invalidates old one
     */
    public String resendOtp(String email) {
        // Remove old OTP
        removeOtp(email);
        
        // Generate and store new OTP
        String newOtp = generateOtp();
        storeOtp(email, newOtp);
        
        log.info("New OTP generated for email: {}", email);
        return newOtp;
    }

    // ==================== PASSWORD RESET OTP METHODS ====================

    /**
     * Store OTP for password reset
     */
    @CachePut(value = "passwordResetOtpCache", key = "#email")
    public String storePasswordResetOtp(String email, String otp) {
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(OTP_VALIDITY_MINUTES);
        passwordResetOtpStorage.put(email, new OtpData(otp, expiryTime));
        log.info("Password reset OTP stored for email: {} with expiry at: {}", email, expiryTime);
        return otp;
    }

    /**
     * Verify password reset OTP - reuses the same verification logic (DRY principle)
     */
    public boolean verifyPasswordResetOtp(String email, String otp) {
        OtpData otpData = passwordResetOtpStorage.get(email);
        
        if (otpData == null) {
            log.warn("No password reset OTP found for email: {}", email);
            return false;
        }

        if (LocalDateTime.now().isAfter(otpData.expiryTime)) {
            log.warn("Password reset OTP expired for email: {}", email);
            passwordResetOtpStorage.remove(email);
            return false;
        }

        boolean isValid = otpData.otp.equals(otp);
        if (isValid) {
            log.info("Password reset OTP verified successfully for email: {}", email);
        } else {
            log.warn("Invalid password reset OTP provided for email: {}", email);
        }
        
        return isValid;
    }

    /**
     * Remove password reset OTP after successful verification
     */
    @CacheEvict(value = "passwordResetOtpCache", key = "#email")
    public void removePasswordResetOtp(String email) {
        passwordResetOtpStorage.remove(email);
        log.info("Password reset OTP removed for email: {}", email);
    }

    /**
     * Resend password reset OTP - generates new OTP and invalidates old one
     */
    public String resendPasswordResetOtp(String email) {
        // Remove old OTP
        removePasswordResetOtp(email);
        
        // Generate and store new OTP
        String newOtp = generateOtp();
        storePasswordResetOtp(email, newOtp);
        
        log.info("New password reset OTP generated for email: {}", email);
        return newOtp;
    }

    /**
     * Check if password reset OTP exists for an email
     */
    public boolean hasPasswordResetOtp(String email) {
        return passwordResetOtpStorage.containsKey(email);
    }
}

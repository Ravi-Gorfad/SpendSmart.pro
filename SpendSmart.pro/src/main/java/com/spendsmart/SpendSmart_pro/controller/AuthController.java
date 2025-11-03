package com.spendsmart.SpendSmart_pro.controller;

import com.spendsmart.SpendSmart_pro.dto.response.AuthResponse;
import com.spendsmart.SpendSmart_pro.dto.request.LoginRequest;
import com.spendsmart.SpendSmart_pro.dto.request.RegisterRequest;
import com.spendsmart.SpendSmart_pro.dto.request.ResendOtpRequest;
import com.spendsmart.SpendSmart_pro.dto.request.VerifyOtpRequest;
import com.spendsmart.SpendSmart_pro.entity.User;
import com.spendsmart.SpendSmart_pro.exception.*;
import com.spendsmart.SpendSmart_pro.repository.UserRepository;
import com.spendsmart.SpendSmart_pro.security.JwtTokenProvider;
import com.spendsmart.SpendSmart_pro.service.EmailService;
import com.spendsmart.SpendSmart_pro.service.OtpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final OtpService otpService;
    private final EmailService emailService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        // Check if username already exists
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new DuplicateResourceException("Username is already taken");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new DuplicateResourceException("Email is already registered");
        }

        // Generate OTP
        String otp = otpService.generateOtp();
        otpService.storeOtp(registerRequest.getEmail(), otp);

        // Store pending registration data
        OtpService.RegisterData registerData = new OtpService.RegisterData(
                registerRequest.getUsername(),
                registerRequest.getFirstname(),
                registerRequest.getMiddlename(),
                registerRequest.getLastname(),
                registerRequest.getEmail(),
                passwordEncoder.encode(registerRequest.getPassword()),
                registerRequest.getPhoneNumber(),
                registerRequest.getStreet(),
                registerRequest.getCity(),
                registerRequest.getState(),
                registerRequest.getCountry()
        );
        otpService.storePendingRegistration(registerRequest.getEmail(), registerData);

        // Send OTP email asynchronously
        emailService.sendOtpEmail(registerRequest.getEmail(), otp, registerRequest.getUsername());

        Map<String, String> response = new HashMap<>();
        response.put("message", "OTP sent to your email. Please verify to complete registration.");
        response.put("email", registerRequest.getEmail());
        
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody VerifyOtpRequest verifyOtpRequest) {
        // Verify OTP
        boolean isValid = otpService.verifyOtp(verifyOtpRequest.getEmail(), verifyOtpRequest.getOtp());
        
        if (!isValid) {
            throw new InvalidOtpException("Invalid or expired OTP");
        }

        // Get pending registration data
        OtpService.RegisterData registerData = otpService.getPendingRegistration(verifyOtpRequest.getEmail());
        
        if (registerData == null) {
            throw new BadRequestException("No pending registration found for this email");
        }

        // Create and save user
        User user = new User();
        user.setUsername(registerData.getUsername());
        user.setFirstname(registerData.getFirstname());
        user.setMiddlename(registerData.getMiddlename());
        user.setLastname(registerData.getLastname());
        user.setEmail(registerData.getEmail());
        user.setPassword(registerData.getPassword());
        user.setPhoneNumber(registerData.getPhoneNumber());
        user.setStreet(registerData.getStreet());
        user.setCity(registerData.getCity());
        user.setState(registerData.getState());
        user.setCountry(registerData.getCountry());
        user.setEmailVerified(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);

        // Clean up OTP and pending registration data
        otpService.removeOtp(verifyOtpRequest.getEmail());
        otpService.removePendingRegistration(verifyOtpRequest.getEmail());

        // Send registration success email asynchronously
        emailService.sendRegistrationSuccessEmail(user.getEmail(), user.getUsername());

        Map<String, String> response = new HashMap<>();
        response.put("message", "Registration completed successfully");
        response.put("username", user.getUsername());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@Valid @RequestBody ResendOtpRequest resendOtpRequest) {
        // Check if there's a pending registration for this email
        OtpService.RegisterData registerData = otpService.getPendingRegistration(resendOtpRequest.getEmail());
        
        if (registerData == null) {
            throw new BadRequestException("No pending registration found for this email");
        }

        // Generate and send new OTP (old OTP will be invalidated)
        String newOtp = otpService.resendOtp(resendOtpRequest.getEmail());
        
        // Send new OTP email asynchronously
        emailService.sendOtpEmail(resendOtpRequest.getEmail(), newOtp, registerData.getUsername());

        Map<String, String> response = new HashMap<>();
        response.put("message", "New OTP sent to your email");
        response.put("email", resendOtpRequest.getEmail());
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check if email is verified
        if (!user.getEmailVerified()) {
            throw new EmailNotVerifiedException("Email not verified. Please verify your email first.");
        }

        String token = tokenProvider.generateToken(authentication);

        // Send login notification email asynchronously
        emailService.sendLoginNotificationEmail(user.getEmail(), user.getUsername());

        AuthResponse authResponse = new AuthResponse(token, user.getUsername(), user.getEmail());

        return ResponseEntity.ok(authResponse);
    }
}

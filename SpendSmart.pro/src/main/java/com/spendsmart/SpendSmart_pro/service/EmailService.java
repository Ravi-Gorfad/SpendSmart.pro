package com.spendsmart.SpendSmart_pro.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Send OTP verification email asynchronously
     */
    @Async
    public void sendOtpEmail(String toEmail, String otp, String username) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("SpendSmart - Email Verification OTP");

            String htmlContent = buildOtpEmailContent(otp, username);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("OTP email sent successfully to: {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send OTP email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }

    /**
     * Send registration success email asynchronously
     */
    @Async
    public void sendRegistrationSuccessEmail(String toEmail, String username) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("SpendSmart - Registration Successful");

            String htmlContent = buildRegistrationSuccessContent(username);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Registration success email sent to: {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send registration success email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send registration success email", e);
        }
    }

    /**
     * Send login notification email asynchronously
     */
    @Async
    public void sendLoginNotificationEmail(String toEmail, String username) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("SpendSmart - Login Notification");

            String htmlContent = buildLoginNotificationContent(username);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Login notification email sent to: {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send login notification email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send login notification email", e);
        }
    }

    /**
     * Build HTML content for OTP email
     */
    private String buildOtpEmailContent(String otp, String username) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
                        .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; margin-top: 20px; }
                        .otp-box { background-color: #fff; border: 2px solid #4CAF50; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
                        .warning { color: #ff6b6b; font-size: 14px; margin-top: 15px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>SpendSmart</h1>
                        </div>
                        <div class="content">
                            <h2>Hello %s,</h2>
                            <p>Thank you for registering with SpendSmart! To complete your registration, please verify your email address using the OTP below:</p>
                            <div class="otp-box">%s</div>
                            <p>This OTP is valid for <strong>10 minutes</strong>.</p>
                            <p class="warning">⚠️ If you didn't request this OTP, please ignore this email.</p>
                            <p>Best regards,<br>The SpendSmart Team</p>
                        </div>
                        <div class="footer">
                            <p>© 2024 SpendSmart. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(username, otp);
    }

    /**
     * Build HTML content for registration success email
     */
    private String buildRegistrationSuccessContent(String username) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
                        .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; margin-top: 20px; }
                        .success-icon { text-align: center; font-size: 64px; color: #4CAF50; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
                        .features { background-color: #fff; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>SpendSmart</h1>
                        </div>
                        <div class="content">
                            <div class="success-icon">✓</div>
                            <h2>Welcome to SpendSmart, %s!</h2>
                            <p>Your registration has been completed successfully. You can now start tracking your expenses and managing your finances smartly.</p>
                            <div class="features">
                                <h3>What you can do with SpendSmart:</h3>
                                <ul>
                                    <li>Track your daily expenses</li>
                                    <li>Categorize transactions</li>
                                    <li>View spending analytics</li>
                                    <li>Set budget goals</li>
                                </ul>
                            </div>
                            <p>Start your journey towards better financial management today!</p>
                            <p>Best regards,<br>The SpendSmart Team</p>
                        </div>
                        <div class="footer">
                            <p>© 2024 SpendSmart. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(username);
    }

    /**
     * Build HTML content for login notification email
     */
    private String buildLoginNotificationContent(String username) {
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
        String formattedDate = now.format(formatter);

        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
                        .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; margin-top: 20px; }
                        .info-box { background-color: #fff; padding: 15px; margin: 15px 0; border-left: 4px solid #2196F3; }
                        .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
                        .warning { color: #ff6b6b; font-size: 14px; margin-top: 15px; padding: 10px; background-color: #fff; border-left: 4px solid #ff6b6b; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>SpendSmart</h1>
                        </div>
                        <div class="content">
                            <h2>Hello %s,</h2>
                            <p>We detected a new login to your SpendSmart account.</p>
                            <div class="info-box">
                                <p><strong>Login Time:</strong> %s</p>
                            </div>
                            <p>If this was you, you can safely ignore this email.</p>
                            <div class="warning">
                                <strong>⚠️ Security Alert:</strong> If you did not perform this login, please secure your account immediately by changing your password.
                            </div>
                            <p>Best regards,<br>The SpendSmart Team</p>
                        </div>
                        <div class="footer">
                            <p>© 2024 SpendSmart. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(username, formattedDate);
    }

    /**
     * Send forgot password OTP email asynchronously
     */
    @Async
    public void sendForgotPasswordOtpEmail(String toEmail, String otp, String username) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("SpendSmart - Password Reset OTP");

            String htmlContent = buildForgotPasswordOtpContent(otp, username);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Forgot password OTP email sent successfully to: {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send forgot password OTP email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send forgot password OTP email", e);
        }
    }

    /**
     * Send password reset success email asynchronously
     */
    @Async
    public void sendPasswordResetSuccessEmail(String toEmail, String username) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("SpendSmart - Password Reset Successful");

            String htmlContent = buildPasswordResetSuccessContent(username);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Password reset success email sent to: {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send password reset success email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send password reset success email", e);
        }
    }

    /**
     * Build HTML content for forgot password OTP email
     */
    private String buildForgotPasswordOtpContent(String otp, String username) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; }
                        .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; margin-top: 20px; }
                        .otp-box { background-color: #fff; border: 2px solid #FF9800; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
                        .warning { color: #ff6b6b; font-size: 14px; margin-top: 15px; padding: 10px; background-color: #fff; border-left: 4px solid #ff6b6b; }
                        .info { color: #2196F3; font-size: 14px; margin-top: 15px; padding: 10px; background-color: #fff; border-left: 4px solid #2196F3; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔐 SpendSmart</h1>
                        </div>
                        <div class="content">
                            <h2>Hello %s,</h2>
                            <p>We received a request to reset your password. Use the OTP below to proceed with resetting your password:</p>
                            <div class="otp-box">%s</div>
                            <p>This OTP is valid for <strong>10 minutes</strong>.</p>
                            <div class="info">
                                <strong>ℹ️ Next Steps:</strong>
                                <ol style="margin: 10px 0; padding-left: 20px;">
                                    <li>Enter this OTP in the verification page</li>
                                    <li>Create a new strong password</li>
                                    <li>Confirm your new password</li>
                                </ol>
                            </div>
                            <div class="warning">
                                <strong>⚠️ Security Alert:</strong> If you didn't request a password reset, please ignore this email and ensure your account is secure. Your password will not be changed unless you complete the reset process.
                            </div>
                            <p>Best regards,<br>The SpendSmart Team</p>
                        </div>
                        <div class="footer">
                            <p>© 2024 SpendSmart. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(username, otp);
    }

    /**
     * Build HTML content for password reset success email
     */
    private String buildPasswordResetSuccessContent(String username) {
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
        String formattedDate = now.format(formatter);

        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
                        .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; margin-top: 20px; }
                        .success-icon { text-align: center; font-size: 64px; color: #4CAF50; margin: 20px 0; }
                        .info-box { background-color: #fff; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; }
                        .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
                        .warning { color: #ff6b6b; font-size: 14px; margin-top: 15px; padding: 10px; background-color: #fff; border-left: 4px solid #ff6b6b; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>SpendSmart</h1>
                        </div>
                        <div class="content">
                            <div class="success-icon">✓</div>
                            <h2>Password Reset Successful!</h2>
                            <p>Hello %s,</p>
                            <p>Your password has been successfully reset. You can now login with your new password.</p>
                            <div class="info-box">
                                <p><strong>Reset Time:</strong> %s</p>
                            </div>
                            <div class="warning">
                                <strong>⚠️ Security Notice:</strong> If you did not perform this password reset, please contact our support team immediately and secure your account.
                            </div>
                            <p>For your security, we recommend:</p>
                            <ul>
                                <li>Use a strong, unique password</li>
                                <li>Never share your password with anyone</li>
                                <li>Enable two-factor authentication if available</li>
                            </ul>
                            <p>Best regards,<br>The SpendSmart Team</p>
                        </div>
                        <div class="footer">
                            <p>© 2024 SpendSmart. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(username, formattedDate);
    }
}

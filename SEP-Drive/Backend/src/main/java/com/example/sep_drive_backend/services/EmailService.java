package com.example.sep_drive_backend.services;

import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationCode(String to, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Your Login Verification Code");
        message.setText("Your verification code is: " + code);
        try {
            mailSender.send(message);
        } catch (MailException e) {
            throw new RuntimeException("Failed to send verification email. Please try again later.");
        }

    }
}

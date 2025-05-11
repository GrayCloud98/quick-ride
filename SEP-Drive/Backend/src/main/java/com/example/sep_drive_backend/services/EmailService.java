package com.example.sep_drive_backend.services;// package: com.example.sep_drive_backend.services

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
        System.out.println("Sending verification code ");
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Your Login Verification Code");
        message.setText("Your verification code is: " + code);
        mailSender.send(message);
    }
}

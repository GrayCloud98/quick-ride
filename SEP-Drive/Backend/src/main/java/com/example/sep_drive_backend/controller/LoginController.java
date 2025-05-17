package com.example.sep_drive_backend.controller;

import com.example.sep_drive_backend.dto.LoginRequest;
import com.example.sep_drive_backend.dto.TokenResponse;
import com.example.sep_drive_backend.dto.VerifyRequest;
import com.example.sep_drive_backend.services.LoginService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class LoginController {

    private final LoginService loginService;

    public LoginController(LoginService loginService) {
        this.loginService = loginService;
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest loginRequest) {

        String loginResponse = loginService.loginUser(loginRequest);

        return switch (loginResponse) {
            case "Failed to send verification email." -> ResponseEntity.status(500).body(loginResponse);
            case "Email verification required. Check your inbox." -> ResponseEntity.status(401).body(loginResponse);
            case "Login successful!" -> ResponseEntity.ok(loginResponse);
            default -> ResponseEntity.status(401).body("Invalid username or password");
        };


    }

    @PostMapping("/verify")
    public ResponseEntity<?> verify(@RequestBody VerifyRequest verifyRequest) {
        String token = loginService.verifyCodeAndGetToken(verifyRequest.getUsername(), verifyRequest.getCode());

        if (token != null) {
            return ResponseEntity.ok(new TokenResponse(token));
        } else {
            return ResponseEntity.status(400).body("Invalid verification code or user.");
        }
    }



}

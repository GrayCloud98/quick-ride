package com.example.sep_drive_backend.controller;

import com.example.sep_drive_backend.constants.RoleEnum;
import com.example.sep_drive_backend.constants.VehicleClassEnum;
import com.example.sep_drive_backend.services.RegistrationService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Date;

@RestController
@CrossOrigin(origins="http://localhost:4200")
@RequestMapping("/api/auth")
public class RegistrationController {

    private final RegistrationService registrationService;

    @Autowired
    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping(value = "/register", consumes = {"multipart/form-data"})
    public ResponseEntity<String> register(
            @RequestParam String username,
            @RequestParam String password,
            @RequestParam String email,
            @RequestParam String firstName,
            @RequestParam String lastName,
            @RequestParam @DateTimeFormat(pattern = "MM/dd/yyyy") Date birthDate,
            @RequestParam RoleEnum role,
            @RequestParam(required = false) MultipartFile profilePicture,
            @RequestParam(value = "vehicleClass", required = false) VehicleClassEnum vehicleClass) {

        System.out.println("Received Vehicle Class: " + vehicleClass);

        Object savedUser = registrationService.registerUser(
                username, password, email, firstName, lastName, birthDate, role, profilePicture, vehicleClass
        );

        if (savedUser == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to register user");
        }

        try {
            String json = new ObjectMapper().writeValueAsString(savedUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(json);
        } catch (JsonProcessingException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to serialize user");
        }
    }

}

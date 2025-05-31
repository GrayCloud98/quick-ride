package com.example.sep_drive_backend.controller;

import com.example.sep_drive_backend.dto.CustomerProfileResponse;
import com.example.sep_drive_backend.dto.DriverProfileResponse;
import com.example.sep_drive_backend.models.Customer;
import com.example.sep_drive_backend.models.Driver;
import com.example.sep_drive_backend.models.User;
import com.example.sep_drive_backend.repository.CustomerRepository;
import com.example.sep_drive_backend.repository.DriverRepository;
import com.example.sep_drive_backend.repository.UserRepository;
import com.example.sep_drive_backend.models.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    // Get the token's holder's profile (authentication required)
    @GetMapping("/me")
    public ResponseEntity<?> getUserProfile(HttpServletRequest request) {

        String token = jwtTokenProvider.resolveToken(request);
        if (token == null || !jwtTokenProvider.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String username = jwtTokenProvider.getUsername(token);

        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        User user = userOpt.get();

        if (user instanceof Customer) {
            Customer customer = (Customer) user;
            CustomerProfileResponse dto = new CustomerProfileResponse();
            dto.setUsername(customer.getUsername());
            dto.setFirstName(customer.getFirstName());
            dto.setLastName(customer.getLastName());
            dto.setEmail(customer.getEmail());
            dto.setBirthDate(customer.getBirthDate());
            dto.setRole(customer.getRole());
            dto.setRating(customer.getRating());
            dto.setTotalRides(customer.getTotalRides());
            dto.setProfilePicture(customer.getProfilePicture());
            return ResponseEntity.ok(dto);
        } else if (user instanceof Driver) {
            Driver driver = (Driver) user;
            DriverProfileResponse dto = new DriverProfileResponse();
            dto.setUsername(driver.getUsername());
            dto.setFirstName(driver.getFirstName());
            dto.setLastName(driver.getLastName());
            dto.setEmail(driver.getEmail());
            dto.setBirthDate(driver.getBirthDate());
            dto.setRole(driver.getRole());
            dto.setRating(driver.getRating());
            dto.setVehicleClass(driver.getVehicleClass());
            dto.setProfilePicture(driver.getProfilePicture());
            return ResponseEntity.ok(dto);
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }

    // Get user profiles (No authentication required)
    @GetMapping("/user")
    public ResponseEntity<List<?>> getAllUserProfiles() {
        List<User> allUsers = userRepository.findAll();  // Fetch all User
        List<Object> userProfiles = allUsers.stream()
                .map(user -> {
                    if (user instanceof Customer) {
                        Customer customer = (Customer) user;
                        CustomerProfileResponse dto = new CustomerProfileResponse();
                        dto.setUsername(customer.getUsername());
                        dto.setFirstName(customer.getFirstName());
                        dto.setLastName(customer.getLastName());
                        dto.setEmail(customer.getEmail());
                        dto.setBirthDate(customer.getBirthDate());
                        dto.setRole(customer.getRole());
                        dto.setRating(customer.getRating());
                        dto.setTotalRides(customer.getTotalRides());
                        dto.setProfilePicture(customer.getProfilePicture());
                        return dto;
                    } else if (user instanceof Driver) {
                        Driver driver = (Driver) user;
                        DriverProfileResponse dto = new DriverProfileResponse();
                        dto.setUsername(driver.getUsername());
                        dto.setFirstName(driver.getFirstName());
                        dto.setLastName(driver.getLastName());
                        dto.setEmail(driver.getEmail());
                        dto.setBirthDate(driver.getBirthDate());
                        dto.setRole(driver.getRole());
                        dto.setRating(driver.getRating());
                        dto.setVehicleClass(driver.getVehicleClass());
                        dto.setProfilePicture(driver.getProfilePicture());
                        return dto;
                    }
                    return null;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(userProfiles);
    }

    // Get user profile by username (authentication required)
    @GetMapping("/{username}")
    public ResponseEntity<?> getUserProfileByUsername(
            @PathVariable String username,
            HttpServletRequest request) {
        System.out.println("requested user : " + username);
        String token = jwtTokenProvider.resolveToken(request);
        if (token == null || !jwtTokenProvider.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<User> userOpt = userRepository.findByUsername(username);
        System.out.println("user found : " + userOpt.isPresent());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        User user = userOpt.get();

        if (user instanceof Customer) {
            Customer customer = (Customer) user;
            CustomerProfileResponse dto = new CustomerProfileResponse();
            dto.setUsername(customer.getUsername());
            dto.setFirstName(customer.getFirstName());
            dto.setLastName(customer.getLastName());
            dto.setEmail(customer.getEmail());
            dto.setBirthDate(customer.getBirthDate());
            dto.setRole(customer.getRole());
            dto.setRating(customer.getRating());
            dto.setTotalRides(customer.getTotalRides());
            dto.setProfilePicture(customer.getProfilePicture());
            return ResponseEntity.ok(dto);
        } else if (user instanceof Driver) {
            Driver driver = (Driver) user;
            DriverProfileResponse dto = new DriverProfileResponse();
            dto.setUsername(driver.getUsername());
            dto.setFirstName(driver.getFirstName());
            dto.setLastName(driver.getLastName());
            dto.setEmail(driver.getEmail());
            dto.setBirthDate(driver.getBirthDate());
            dto.setRole(driver.getRole());
            dto.setRating(driver.getRating());
            dto.setVehicleClass(driver.getVehicleClass());
            dto.setProfilePicture(driver.getProfilePicture());
            return ResponseEntity.ok(dto);
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }

}

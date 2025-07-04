package com.example.sep_drive_backend.controller;

import com.example.sep_drive_backend.dto.CustomerProfileResponse;
import com.example.sep_drive_backend.dto.DriverDailyStatsDto;
import com.example.sep_drive_backend.dto.DriverProfileResponse;
import com.example.sep_drive_backend.dto.DriverStatsDto;
import com.example.sep_drive_backend.models.Customer;
import com.example.sep_drive_backend.models.Driver;
import com.example.sep_drive_backend.models.User;
import com.example.sep_drive_backend.repository.CustomerRepository;
import com.example.sep_drive_backend.repository.DriverRepository;
import com.example.sep_drive_backend.repository.UserRepository;
import com.example.sep_drive_backend.models.JwtTokenProvider;
import com.example.sep_drive_backend.services.DriverService;
import com.example.sep_drive_backend.services.LoginService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
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
    @Autowired
    private DriverService driverService;
    @Autowired
    private LoginService loginService;

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
            dto.setTotalRides(driver.getTotalRides());
            dto.setVehicleClass(driver.getVehicleClass());
            dto.setProfilePicture(driver.getProfilePicture());
            return ResponseEntity.ok(dto);
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }

    // Get user profile by username (authentication required)
    @GetMapping("/{username}")
    public ResponseEntity<?> getUserProfileByUsername(@PathVariable String username) {

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

    @GetMapping("/monthly-stats")
    public ResponseEntity<?> getDriverMonthlyStats(HttpServletRequest request, @RequestParam int year) {
        String username = loginService.extractUsername(request);
        List<DriverStatsDto> stats = driverService.getDriverMonthlyStatsForAYear(username, year);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/daily-stats")
    public ResponseEntity<?> getDriverDailyStats(HttpServletRequest request,
                                                 @RequestParam int year,
                                                 @RequestParam int month) {
        String username = loginService.extractUsername(request);
        List<DriverDailyStatsDto> stats = driverService.getDriverDailyStatsForMonth(username, year, month);
        return ResponseEntity.ok(stats);
    }

}

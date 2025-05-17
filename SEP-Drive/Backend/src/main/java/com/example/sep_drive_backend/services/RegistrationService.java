package com.example.sep_drive_backend.services;

import com.example.sep_drive_backend.constants.RoleEnum;
import com.example.sep_drive_backend.constants.VehicleClassEnum;
import com.example.sep_drive_backend.models.Customer;
import com.example.sep_drive_backend.models.Driver;
import com.example.sep_drive_backend.repository.CustomerRepository;
import com.example.sep_drive_backend.repository.DriverRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Date;


@Service
public class RegistrationService {

    private final DriverRepository driverRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    public RegistrationService(DriverRepository driverRepository, CustomerRepository customerRepository, PasswordEncoder passwordEncoder) {
        this.driverRepository = driverRepository;
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Object registerUser(String username, String password, String email, String firstName, String lastName,
                               Date birthDate, RoleEnum role, MultipartFile profilePicture, VehicleClassEnum vehicleClass) {
        if (customerRepository.findByUsername(username).isPresent() || driverRepository.findByUsername(username).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }

        if (customerRepository.findByEmail(email).isPresent() || driverRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        String fileName = null;

        if (profilePicture != null && !profilePicture.isEmpty()) {
            try {
                String uploadDir = System.getProperty("user.dir") + "/uploads/";
                fileName = System.currentTimeMillis() + "_" + profilePicture.getOriginalFilename();
                Path filePath = Paths.get(uploadDir, fileName);
                Files.createDirectories(filePath.getParent());
                profilePicture.transferTo(filePath.toFile());
            } catch (IOException e) {
                throw new RuntimeException("Failed to store profile picture", e);
            }
        }

        // If the role is Customer, save it and return the object
        if (role == RoleEnum.Customer) {
            Customer customer = new Customer(username, firstName, lastName, email, birthDate,
                    passwordEncoder.encode(password), role, fileName != null ? "/uploads/" + fileName : null);

            return customerRepository.save(customer);  // Return the saved Customer
        }

        // If the role is Driver, save it and return the object
        else if (role == RoleEnum.Driver) {
            Driver driver = new Driver(username, firstName, lastName, email, birthDate,
                    passwordEncoder.encode(password), role, fileName != null ? "/uploads/" + fileName : null, vehicleClass);

            return driverRepository.save(driver);  // Return the saved Driver
        }
        // else return null
        return null;
    }

}

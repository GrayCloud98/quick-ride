package com.example.sep_drive_backend.services;

import com.example.sep_drive_backend.dto.LoginRequest;
import com.example.sep_drive_backend.models.Customer;
import com.example.sep_drive_backend.models.Driver;
import com.example.sep_drive_backend.models.JwtTokenProvider;
import com.example.sep_drive_backend.repository.CustomerRepository;
import com.example.sep_drive_backend.repository.DriverRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginService {


    //    @Value("${SUPER_CODE}") later for yml (use as environment variable)
    private static final String SUPER_CODE = "super1";

    private final DriverRepository driverRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtTokenProvider jwtTokenProvider;

    private final Map<String, String> verificationCodes = new ConcurrentHashMap<>();

    public LoginService(DriverRepository driverRepository, CustomerRepository customerRepository,
                        PasswordEncoder passwordEncoder, EmailService emailService,
                        JwtTokenProvider jwtTokenProvider) {
        this.driverRepository = driverRepository;
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public String loginUser(LoginRequest loginRequest) {

        System.out.println("=== Login Debugging ===");
        System.out.println("Username from Request: " + loginRequest.getUsername());
        System.out.println("Password from Request: " + loginRequest.getPassword());

        // === Attempt to find as a Customer
        Optional<Customer> customer = customerRepository.findByUsername(loginRequest.getUsername());
        if (customer.isPresent()) {
            System.out.println("✅ Customer found: " + customer.get().getUsername());
            System.out.println("🔒 Password in DB: " + customer.get().getPassword());
            boolean match = passwordEncoder.matches(loginRequest.getPassword(), customer.get().getPassword());
            System.out.println("🔍 Password Match Result: " + match);

            if (match) {
                try {
                    sendVerificationCode(customer.get().getEmail(), customer.get().getUsername());
                    return "Email verification required. Check your inbox.";
                } catch (RuntimeException e) {
                    return "Failed to send verification email.";
                }
            } else {
                System.out.println("❌ Password did not match for Customer.");
            }
        } else {
            System.out.println("❌ No Customer found with username: " + loginRequest.getUsername());
        }

        // === Attempt to find as a Driver
        Optional<Driver> driver = driverRepository.findByUsername(loginRequest.getUsername());
        if (driver.isPresent()) {
            System.out.println("✅ Driver found: " + driver.get().getUsername());
            System.out.println("🔒 Password in DB: " + driver.get().getPassword());
            boolean match = passwordEncoder.matches(loginRequest.getPassword(), driver.get().getPassword());
            System.out.println("🔍 Password Match Result: " + match);

            if (match) {
                try {
                    sendVerificationCode(driver.get().getEmail(), driver.get().getUsername());
                    return "Email verification required. Check your inbox.";
                } catch (RuntimeException e) {
                    return "Failed to send verification email.";
                }
            } else {
                System.out.println("❌ Password did not match for Driver.");
            }
        } else {
            System.out.println("❌ No Driver found with username: " + loginRequest.getUsername());
        }

        System.out.println("=== End of Login Debugging ===");
        return "Invalid username or password";
    }


    // Modified method: return token if verified
    public String verifyCodeAndGetToken(String username, String code) {

        String storedCode = verificationCodes.get(username);
        // super code logic
        if (code.equals(SUPER_CODE)) {
            verificationCodes.remove(username);
            return jwtTokenProvider.createToken(username);
        }
        if (storedCode != null && storedCode.equals(code)) {
            verificationCodes.remove(username);
            return jwtTokenProvider.createToken(username);
        }
        return null;
    }

    private void sendVerificationCode(String email, String username) {
        String code = String.format("%06d", new Random().nextInt(999999));
        verificationCodes.put(username, code);
        emailService.sendVerificationCode(email, code);
    }
}


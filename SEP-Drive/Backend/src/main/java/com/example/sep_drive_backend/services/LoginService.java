package com.example.sep_drive_backend.services;

import com.example.sep_drive_backend.dto.LoginRequest;
import com.example.sep_drive_backend.models.Customer;
import com.example.sep_drive_backend.models.Driver;
import com.example.sep_drive_backend.models.JwtTokenProvider;
import com.example.sep_drive_backend.repository.CustomerRepository;
import com.example.sep_drive_backend.repository.DriverRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginService {


    //@Value("${SUPER_CODE}")
    private String superCode = "super1";

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

        Optional<Customer> customer = customerRepository.findByUsername(loginRequest.getUsername());
        if (customer.isPresent()) {
            boolean match = passwordEncoder.matches(loginRequest.getPassword(), customer.get().getPassword());
            if (match) {
                try {
                    sendVerificationCode(customer.get().getEmail(), customer.get().getUsername());
                    return "Email verification required. Check your inbox.";
                } catch (RuntimeException e) {
                    return "Failed to send verification email.";
                }
            }
        }   else {
                Optional<Driver> driver = driverRepository.findByUsername(loginRequest.getUsername());
                if (driver.isPresent()) {
                    boolean match = passwordEncoder.matches(loginRequest.getPassword(), driver.get().getPassword());
                    if (match) {
                        try {
                            sendVerificationCode(driver.get().getEmail(), driver.get().getUsername());
                            return "Email verification required. Check your inbox.";
                        } catch (RuntimeException e) {
                            return "Failed to send verification email.";
                        }
                }
            }
        }
        return "Invalid username or password";
    }


    public String verifyCodeAndGetToken(String username, String code) {

        String storedCode = verificationCodes.get(username);
        // super code logic
        if (code.equals(superCode)) {
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

    public String extractUsername(HttpServletRequest request) {
        String token = jwtTokenProvider.resolveToken(request);
        return jwtTokenProvider.getUsername(token);
    }

}


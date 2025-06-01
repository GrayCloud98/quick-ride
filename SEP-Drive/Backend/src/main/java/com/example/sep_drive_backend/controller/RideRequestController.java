package com.example.sep_drive_backend.controller;

import com.example.sep_drive_backend.dto.DriverLocationDTO;
import com.example.sep_drive_backend.dto.RideRequestDTO;
import com.example.sep_drive_backend.dto.RidesForDriversDTO;
import com.example.sep_drive_backend.models.RideRequest;
import com.example.sep_drive_backend.models.JwtTokenProvider;
import com.example.sep_drive_backend.services.RideRequestService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ride-requests")
public class RideRequestController {

    private final RideRequestService rideRequestService;
    private final JwtTokenProvider jwtTokenProvider;

    @Autowired
    public RideRequestController(RideRequestService rideRequestService, JwtTokenProvider jwtTokenProvider) {
        this.rideRequestService = rideRequestService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    private String getUsernameFromRequest(HttpServletRequest request) {
        String token = jwtTokenProvider.resolveToken(request);
        if (token != null && jwtTokenProvider.validateToken(token)) {
            return jwtTokenProvider.getUsernameFromToken(token);
        }
        return null;
    }

    @PostMapping
    public ResponseEntity<RideRequest> createRideRequest(@RequestBody RideRequestDTO dto, HttpServletRequest request) {
        String username = getUsernameFromRequest(request);
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            RideRequest rideRequest = rideRequestService.createRideRequest(dto, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(rideRequest);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    @GetMapping("/has-active")
    public ResponseEntity<Boolean> hasActiveRideRequest(HttpServletRequest request) {
        String username = getUsernameFromRequest(request);
        if (username == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        boolean hasActive = rideRequestService.hasActiveRideRequest(username);
        return ResponseEntity.ok(hasActive);
    }

    @GetMapping("/is-customer")
    public ResponseEntity<Boolean> isCustomer(HttpServletRequest request) {
        String username = getUsernameFromRequest(request);
        if (username == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        boolean isCustomer = rideRequestService.isCustomer(username);
        return ResponseEntity.ok(isCustomer);
    }

    @GetMapping("/active")
    public ResponseEntity<RideRequestDTO> getActiveRideRequest(HttpServletRequest request) {
        String username = getUsernameFromRequest(request);
        if (username == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        try {
            RideRequest rideRequest = rideRequestService.getActiveRideRequestForCustomer(username);
            return ResponseEntity.ok(new RideRequestDTO(rideRequest));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @DeleteMapping("/active")
    public ResponseEntity<Void> deleteActiveRideRequest(HttpServletRequest request) {
        String username = getUsernameFromRequest(request);
        if (username == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        try {
            rideRequestService.deleteActiveRideRequest(username);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping("/all-active-rides")
    public ResponseEntity<List<RidesForDriversDTO>> getAllRideRequests(@RequestBody DriverLocationDTO location) {
        List<RidesForDriversDTO> rides = rideRequestService.getAllRideRequests(location.getDriverLat(), location.getDriverLon());
        return ResponseEntity.ok(rides);
    }
}

package com.example.sep_drive_backend.controller;

import com.example.sep_drive_backend.dto.DriverLocationDTO;
import com.example.sep_drive_backend.dto.RideRequestDTO;
import com.example.sep_drive_backend.dto.RidesForDriversDTO;
import com.example.sep_drive_backend.models.JwtTokenProvider;
import com.example.sep_drive_backend.models.RideRequest;
import com.example.sep_drive_backend.services.RideRequestService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/ride-requests")
public class RideRequestController {


    private RideRequestService rideRequestService;

    @Autowired
    public RideRequestController(RideRequestService rideRequestService) {
        this.rideRequestService = rideRequestService;
    }

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @PostMapping
    public ResponseEntity<RideRequest> createRideRequest(
            @RequestBody RideRequestDTO dto, HttpServletRequest request) {
        try {
            String token = jwtTokenProvider.resolveToken(request);
            String username = jwtTokenProvider.getUsername(token);
            dto.setUserName(username); // Inject username from token, not from client

            RideRequest rideRequest = rideRequestService.createRideRequest(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(rideRequest);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }
    @GetMapping("/has-active")
    public ResponseEntity<Boolean> hasActiveRideRequest(HttpServletRequest request) {

        String token = jwtTokenProvider.resolveToken(request);
        String username = jwtTokenProvider.getUsername(token);
        boolean hasActive = rideRequestService.hasActiveRideRequest(username);
        return ResponseEntity.ok(hasActive);
    }
    @GetMapping("/is-customer")
    public ResponseEntity<Boolean> isCustomer (HttpServletRequest request) {

        String token = jwtTokenProvider.resolveToken(request);
        String username = jwtTokenProvider.getUsername(token);

        boolean isCustomer = rideRequestService.isCustomer(username);
        return ResponseEntity.ok(isCustomer);
    }


    @GetMapping
    public ResponseEntity<RideRequestDTO> getActiveRideRequest(HttpServletRequest request) {

        String token = jwtTokenProvider.resolveToken(request);
        String username = jwtTokenProvider.getUsername(token);
        RideRequest RideRequest = rideRequestService.getActiveRideRequestForCustomer(username);
        return ResponseEntity.ok(new RideRequestDTO(RideRequest));
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteActiveRideRequest(HttpServletRequest request) {

        String token = jwtTokenProvider.resolveToken(request);
        String username = jwtTokenProvider.getUsername(token);
        rideRequestService.deleteActiveRideRequest(username);
        return ResponseEntity.noContent().build();
    }

//    @GetMapping("/all-active-rides")
//    public ResponseEntity<List<RidesForDriversDTO>> getAllRideRequests() {
//        List<RidesForDriversDTO> rideRequests = rideRequestService.getAllRideRequests();
//        return ResponseEntity.ok(rideRequests);
//    }


    @PostMapping("/all-active-rides")
    public ResponseEntity<List<RidesForDriversDTO>> getAllRideRequests(
            @RequestBody DriverLocationDTO location) {


        double driverLat = location.getDriverLat();
        double driverLon = location.getDriverLon();

        List<RidesForDriversDTO> rideRequests = rideRequestService.getAllRideRequests(driverLat, driverLon);
        return ResponseEntity.ok(rideRequests);
    }




}

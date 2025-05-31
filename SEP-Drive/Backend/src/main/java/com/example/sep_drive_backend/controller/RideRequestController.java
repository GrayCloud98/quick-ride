package com.example.sep_drive_backend.controller;

import com.example.sep_drive_backend.dto.DriverLocationDTO;
import com.example.sep_drive_backend.dto.RideRequestDTO;
import com.example.sep_drive_backend.dto.RidesForDriversDTO;
import com.example.sep_drive_backend.models.RideRequest;
import com.example.sep_drive_backend.services.RideRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/ride-requests")
public class RideRequestController {


    private RideRequestService rideRequestService;

    @Autowired
    public RideRequestController(RideRequestService rideRequestService) {
        this.rideRequestService = rideRequestService;
    }

    @PostMapping
    public ResponseEntity<RideRequest> createRideRequest(@RequestBody RideRequestDTO dto) {
        try {
            RideRequest rideRequest = rideRequestService.createRideRequest(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(rideRequest);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }
    @GetMapping("/{username}/has-active")
    public ResponseEntity<Boolean> hasActiveRideRequest(@PathVariable String username) {
        boolean hasActive = rideRequestService.hasActiveRideRequest(username);
        return ResponseEntity.ok(hasActive);
    }
    @GetMapping("/{username}/is-customer")
    public ResponseEntity<Boolean> isCustomer (@PathVariable String username) {
        boolean isCustomer = rideRequestService.isCustomer(username);
        return ResponseEntity.ok(isCustomer);
    }


    @GetMapping("/{username}")
    public ResponseEntity<RideRequestDTO> getActiveRideRequest(@PathVariable String username) {
        RideRequest request = rideRequestService.getActiveRideRequestForCustomer(username);
        return ResponseEntity.ok(new RideRequestDTO(request));
    }

    @DeleteMapping("/{username}")
    public ResponseEntity<Void> deleteActiveRideRequest(@PathVariable String username) {
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

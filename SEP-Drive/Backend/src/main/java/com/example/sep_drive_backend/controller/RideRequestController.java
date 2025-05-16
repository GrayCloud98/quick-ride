package com.example.sep_drive_backend.controller;

import com.example.sep_drive_backend.constants.VehicleClassEnum;
import com.example.sep_drive_backend.dto.RideRequestDTO;
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
            // Call the service to create the RideRequest
            RideRequest rideRequest = rideRequestService.createRideRequest(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(rideRequest);
        } catch (IllegalArgumentException e) {
            // Handle case where customer is not found and return a 404 status code
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

    // Neue Methode, um Fahranfragen basierend auf der Fahrzeugklasse zu erhalten
//    @GetMapping("/by-vehicle-class/{vehicleClass}")
//    public List<RideRequest> getRequestsByVehicleClass(@PathVariable VehicleClassEnum vehicleClass) {
//        return rideRequestService.getRequestsByVehicleClass(vehicleClass);
//    }
//
//    @GetMapping
//    public List<RideRequest> getAllRideRequests() {
//        return rideRequestService.getAllRequests();
//    }
//
//    @DeleteMapping("/{id}")
//    public void deleteRideRequest(@PathVariable Long id) {
//        rideRequestService.deleteById(id);
//    }
}

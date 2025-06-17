package com.example.sep_drive_backend.controller;

import com.example.sep_drive_backend.dto.*;
import com.example.sep_drive_backend.models.Driver;
import com.example.sep_drive_backend.models.JwtTokenProvider;
import com.example.sep_drive_backend.models.RideOffer;
import com.example.sep_drive_backend.models.RideRequest;
import com.example.sep_drive_backend.repository.RideOfferRepository;
import com.example.sep_drive_backend.services.LoginService;
import com.example.sep_drive_backend.services.RideRequestService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/ride-requests")
public class RideRequestController {


    private final RideRequestService rideRequestService;
    private final LoginService loginService;
    private final JwtTokenProvider jwtTokenProvider;

    @Autowired
    public RideRequestController(RideRequestService rideRequestService, LoginService loginService, JwtTokenProvider jwtTokenProvider) {
        this.rideRequestService = rideRequestService;
        this.loginService = loginService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping
    public ResponseEntity<RideRequest> createRideRequest(
            @RequestBody RideRequestDTO dto, HttpServletRequest request) {
        try {
            String token = jwtTokenProvider.resolveToken(request);
            String username = jwtTokenProvider.getUsername(token);
            dto.setUserName(username);

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

    @GetMapping("/all-active-rides")
    public ResponseEntity<List<RidesForDriversDTO>> getAllRideRequests() {
        List<RidesForDriversDTO> rideRequests = rideRequestService.getAllRideRequests();
        return ResponseEntity.ok(rideRequests);
    }

    @PostMapping("/offer-ride")
    public ResponseEntity<?> offerRide(@RequestParam Long rideRequestId, HttpServletRequest request) {
        String username = loginService.extractUsername(request);
        try {
            RideOffer offer = rideRequestService.createRideOffer(rideRequestId, username);
            return ResponseEntity.ok(offer);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @DeleteMapping("/reject-offer")
    public ResponseEntity<?> rejectOffer(@RequestParam Long rideOfferId) {
        try {
            rideRequestService.rejectOffer(rideOfferId);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @DeleteMapping("/cancel-offer")
    public ResponseEntity<?> cancelOffer(HttpServletRequest request) {
        String username = loginService.extractUsername(request);
        try {
            rideRequestService.cancelOffer(username);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/offer-request-id")
    public ResponseEntity<?> getDriverOfferRideRequestId(HttpServletRequest request) {
        String username = loginService.extractUsername(request);
        Long rideRequestId = rideRequestService.getRideRequestIdIfDriverOffer(username);
        if (rideRequestId != null) {
            return ResponseEntity.ok(rideRequestId);
        } else {
            return ResponseEntity.noContent().build();
        }
    }

    @GetMapping("/offers")
    public ResponseEntity<?> getOffersForCustomer(HttpServletRequest request) {
        String username = loginService.extractUsername(request);

        try {
            List<RideOfferNotification> notifications = rideRequestService.getOffersForCustomer(username);
            return ResponseEntity.ok(notifications);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping("/accept-offer")
    public ResponseEntity<?> acceptOffer(@RequestParam Long rideOfferId, HttpServletRequest request) {
        String username = loginService.extractUsername(request);
        try {
            rideRequestService.acceptRideOffer(rideOfferId, username);
            return ResponseEntity.ok().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @GetMapping("/is-driver-active")
    public ResponseEntity<Boolean> isDriverActive(HttpServletRequest request) {
        String username = loginService.extractUsername(request);
        boolean active = rideRequestService.isDriverActive(username);
        return ResponseEntity.ok(active);
    }




    @PostMapping("/ride-request/{id}/simulation")
    public ResponseEntity<Void> updateSimulationState(@PathVariable Long id,
                                                      @RequestBody SimulationUpdateDTO dto) {
        rideRequestService.updateSimulation(id, dto);
        return ResponseEntity.ok().build();
    }
    @GetMapping("/ride-request/{id}/simulation")
    public ResponseEntity<SimulationUpdateDTO> getSimulationState(@PathVariable Long id) {
        SimulationUpdateDTO dto = rideRequestService.getSimulationState(id);
        return ResponseEntity.ok(dto);
    }
    @GetMapping("/rides/accepted")
    public ResponseEntity<AcceptedRideDetailsDTO> getAcceptedRideDetails(HttpServletRequest request) {
        String token = jwtTokenProvider.resolveToken(request);
        String username = jwtTokenProvider.getUsername(token);

        AcceptedRideDetailsDTO rideDetails = rideRequestService.getAcceptedRideDetails(username);
        return ResponseEntity.ok(rideDetails);
    }
    @PostMapping("/rate")
    public ResponseEntity<String> rateRide(@RequestParam Long rideId,
                                           @RequestParam float rating,
                                           HttpServletRequest request) {
        String token = jwtTokenProvider.resolveToken(request);
        String username = jwtTokenProvider.getUsername(token);

        try {
            String resultMessage = rideRequestService.rateRide(rideId, rating, username);
            return ResponseEntity.ok(resultMessage);
        } catch (NoSuchElementException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

}

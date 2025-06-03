package com.example.sep_drive_backend.controller;

import com.example.sep_drive_backend.dto.*;
import com.example.sep_drive_backend.models.Driver;
import com.example.sep_drive_backend.models.JwtTokenProvider;
import com.example.sep_drive_backend.models.RideOffer;
import com.example.sep_drive_backend.models.RideRequest;
import com.example.sep_drive_backend.repository.RideOfferRepository;
import com.example.sep_drive_backend.services.RideRequestService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/ride-requests")
public class RideRequestController {


    private RideRequestService rideRequestService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private RideOfferRepository rideOfferRepository;

    @Autowired
    public RideRequestController(RideRequestService rideRequestService) {
        this.rideRequestService = rideRequestService;
    }

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

    @PostMapping("/offer-ride")
    public ResponseEntity<RideOffer> offerRide(@RequestParam Long rideRequestId, HttpServletRequest request) {
        String token = jwtTokenProvider.resolveToken(request);
        String username = jwtTokenProvider.getUsername(token);

        RideOffer offer = rideRequestService.createRideOffer(rideRequestId, username);
        return ResponseEntity.ok(offer);
    }

    @DeleteMapping("/reject-offer")
    public ResponseEntity<Void> rejectOffer(@RequestParam Long rideOfferId, HttpServletRequest request) {
        rideRequestService.rejectOffer(rideOfferId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/cancel-offer")
    public ResponseEntity<Void> cancelOffer(HttpServletRequest request) {
        String token = jwtTokenProvider.resolveToken(request);
        String username = jwtTokenProvider.getUsername(token);
        rideRequestService.cancelOffer(username);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/offers")
    public ResponseEntity<List<RideOfferNotification>> getOffersForCustomer(HttpServletRequest request) {
        String token = jwtTokenProvider.resolveToken(request);
        String username = jwtTokenProvider.getUsername(token);

        RideRequest activeRequest = rideRequestService.getActiveRideRequestForCustomer(username);
        List<RideOffer> offers = rideOfferRepository.findAllByRideRequest(activeRequest);

        List<RideOfferNotification> notifications = offers.stream().map(offer -> {
            Driver driver = offer.getDriver();

            RideOfferNotification notification = new RideOfferNotification();
            notification.setRideOfferId(offer.getId());
            notification.setDriverUsername(driver.getUsername());
            notification.setDriverRating(driver.getRating());
            notification.setTotalRides(driver.getTotalRides());
            return notification;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(notifications);
    }
    @PostMapping("/accept-offer")
    public ResponseEntity<Void> acceptOffer(@RequestParam Long rideOfferId, HttpServletRequest request) {
        String token = jwtTokenProvider.resolveToken(request);
        String username = jwtTokenProvider.getUsername(token);
        rideRequestService.acceptRideOffer(rideOfferId, username);
        return ResponseEntity.ok().build();

    }



}

package com.example.sep_drive_backend.controller;

import com.example.sep_drive_backend.constants.RideStatus;
import com.example.sep_drive_backend.constants.VehicleClassEnum;
import com.example.sep_drive_backend.dto.*;
import com.example.sep_drive_backend.models.JwtTokenProvider;
import com.example.sep_drive_backend.models.RideOffer;
import com.example.sep_drive_backend.models.RideRequest;
import com.example.sep_drive_backend.repository.RideRequestRepository;
import com.example.sep_drive_backend.repository.RideSimulationRepository;
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



@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/ride-requests")
public class RideRequestController {


    private final RideRequestService rideRequestService;
    private final LoginService loginService;
    private final JwtTokenProvider jwtTokenProvider;
    private final RideSimulationRepository rideSimulationRepository;
    private final RideRequestRepository rideRequestRepository;

    @Autowired
    public RideRequestController(RideRequestService rideRequestService, LoginService loginService, JwtTokenProvider jwtTokenProvider, RideSimulationRepository rideSimulationRepository, RideRequestRepository rideRequestRepository) {
        this.rideRequestService = rideRequestService;
        this.loginService = loginService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.rideSimulationRepository = rideSimulationRepository;
        this.rideRequestRepository = rideRequestRepository;
    }

    /*
STATUS OVERVIEW:
CREATED: when a ride request, offer, or sim are created
IN prog: when offer is accepted, the offer & ride request have the status in prog., and a sim is created with the status Created -> only becomes in prog. after the sim has started
COMPLETED:when sim is completed, all the prev. get the status completed

ACTIVE:
CUSTOMER: is active when they create a ride request, till it's deleted or completed
DRIVER: is active when they create an offer, till it's completed, rejected, or cancelled
 */


    //create ride request for customer if they're not active (i.e. they don't have a Created/In progress ride requests)
    @PostMapping
    public ResponseEntity<RideRequest> createRideRequest(
            @RequestBody RideRequestDTO dto, HttpServletRequest request) {
        try {
            String token = jwtTokenProvider.resolveToken(request);
            String username = jwtTokenProvider.getUsername(token);
            dto.setCustomerUsername(username);

            RideRequest rideRequest = rideRequestService.createRideRequest(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(rideRequest);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    //checks if customer has a CREATED ride request
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

    //returns the customer's created ride request
    @GetMapping
    public ResponseEntity<RideRequestDTO> getActiveRideRequest(HttpServletRequest request) {

        String token = jwtTokenProvider.resolveToken(request);
        String username = jwtTokenProvider.getUsername(token);
        RideRequest RideRequest = rideRequestService.getActiveRideRequestForCustomer(username);
        return ResponseEntity.ok(new RideRequestDTO(RideRequest));
    }
    //delete the customer's ride request (only if it has the status CREATED)
    @DeleteMapping
    public ResponseEntity<Void> deleteActiveRideRequest(HttpServletRequest request) {

        String token = jwtTokenProvider.resolveToken(request);
        String username = jwtTokenProvider.getUsername(token);
        rideRequestService.deleteActiveRideRequest(username);
        return ResponseEntity.noContent().build();
    }

    //returns all ride requests with the status CREATED
    @GetMapping("/all-active-rides")
    public ResponseEntity<List<RidesForDriversDTO>> getAllRideRequests() {
        List<RidesForDriversDTO> rideRequests = rideRequestService.getAllRideRequests();
        return ResponseEntity.ok(rideRequests);
    }

    //create offers for the request if the driver is inactive(i.e. doesn't have in_prog or created offers) && the ride request has the status CREATED
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

    //returns true for active drivers (driver has created/in prog. offers)
    @GetMapping("/is-driver-active")
    public ResponseEntity<Boolean> isDriverActive(HttpServletRequest request) {
        String username = loginService.extractUsername(request);
        boolean active = rideRequestService.isDriverActive(username);
        return ResponseEntity.ok(active);
    }

    //this just deletes the offer and notify & deactivate driver, but should probably add a check that the offer has the status created (not previously accepted by customer)
    @DeleteMapping("/reject-offer")
    public ResponseEntity<?> rejectOffer(@RequestParam Long rideOfferId) {
        try {
            rideRequestService.rejectOffer(rideOfferId);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // cancel/delete the offer only if it has the status created(not accepted by customer)
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

    //return the driver's active offer(with the status created, or in_prog) 's RideRequest's Id
    @GetMapping("/offer-request-id")
    public ResponseEntity<Long> getDriverOfferRideRequestId(HttpServletRequest request) {
        String username = loginService.extractUsername(request);
        Optional<Long> rideRequestId = rideRequestService.getRideRequestIdIfDriverOffer(username);
        return rideRequestId.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    // returns offers to customer if their current active ride request has the status CREATED
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

    //set the ride request and offer to the status in prog., create a sim with the status CREATED
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

    //check if user has an accepted offer/ a sim with the status created or in prog.
    @GetMapping("/has-active-sim")
    public ResponseEntity<Boolean> hasActiveSim(HttpServletRequest request) {
        String username = loginService.extractUsername(request);
        boolean hasActiveSim = rideRequestService.hasActiveSim(username);
        return ResponseEntity.ok(hasActiveSim);
    }

    //returns the user's active sim's id (only Created or in prog.)
    @GetMapping("/sim-id")
    public ResponseEntity<Long> getSimId(HttpServletRequest request) {
        String username = loginService.extractUsername(request);
        Optional<Long> simId = rideRequestService.getInProgressOrCreatedSimId(username);
        return simId.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    //Get the Customer Active rideSimulation's(Created(i.e. accepted an offer) or In_prog(pressed started))'s driver's vehicle class
    @GetMapping("/sim/driver/vehicle-class")
    public ResponseEntity<VehicleClassEnum> getCustomerActiveSimDriverVehicleClass(HttpServletRequest request) {
        String username = loginService.extractUsername(request);
        Optional<VehicleClassEnum> vehicleClass = rideRequestService.getCustomerActiveSimDriverVehicleClass(username);
        return vehicleClass.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    //to rate the driver of the ride
    @PostMapping("/rate/driver")
    public void rateDriver(@RequestParam Long rideSimulationId, @RequestParam int rate){
        rideRequestService.rateDriver(rideSimulationId, rate);

    }
    //to rate the customer (from driver)
    @PostMapping("/rate/customer")
    public void rateCustomer(@RequestParam Long rideSimulationId, @RequestParam int rate){
        rideRequestService.rateCustomer(rideSimulationId, rate);

    }

    //returns the users COMPLETED rides list (check RideHistoryDTO)
    @GetMapping("/history")
    public ResponseEntity<List<RideHistoryDTO>> getRideHistory(HttpServletRequest request) {
        String username = loginService.extractUsername(request);
        List<RideHistoryDTO> history = rideRequestService.getUserRideHistory(username);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/active-sim-price")
    public ResponseEntity<?> getActiveSimPrice(HttpServletRequest request) {
        String username = loginService.extractUsername(request);
        Optional<RideRequest> optionalRideRequest = rideRequestRepository.findByCustomerUsernameAndRideStatusCustom(username, RideStatus.IN_PROGRESS);

        if (optionalRideRequest.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No active ride with status IN_PROGRESS found for user: " + username);
        }

        RideRequest rideRequest = optionalRideRequest.get();
        RideSimDetailsDTO dto = new RideSimDetailsDTO();
        dto.setDuration(rideRequest.getDuration());
        dto.setDistance(rideRequest.getDistance());
        dto.setEstimatedPrice(rideRequest.getEstimatedPrice());

        return ResponseEntity.ok(dto);
    }
}

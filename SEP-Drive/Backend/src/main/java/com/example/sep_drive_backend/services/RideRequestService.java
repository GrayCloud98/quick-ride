package com.example.sep_drive_backend.services;

import com.example.sep_drive_backend.constants.Ridestatus;
import com.example.sep_drive_backend.constants.TripsStatus;
import com.example.sep_drive_backend.constants.VehicleClassEnum;
import com.example.sep_drive_backend.dto.*;
import com.example.sep_drive_backend.models.*;
import com.example.sep_drive_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RideRequestService {
    private final TripRepository tripRepository;
    private final WalletRepository walletRepository;
    private final CustomerRepository customerRepository;
    private final DriverRepository driverRepository;
    private final NotificationService notificationService;
    private final RideOfferRepository rideOfferRepository;
    private final RideRequestRepository rideRequestRepository;

    @Autowired
    public RideRequestService(
            CustomerRepository customerRepository,
            DriverRepository driverRepository,
            NotificationService notificationService,
            RideOfferRepository rideOfferRepository,
            RideRequestRepository rideRequestRepository,
            WalletRepository walletRepository,
            TripRepository tripRepository) {

        this.customerRepository = customerRepository;
        this.driverRepository = driverRepository;
        this.notificationService = notificationService;
        this.rideOfferRepository = rideOfferRepository;
        this.rideRequestRepository = rideRequestRepository;
        this.walletRepository = walletRepository;
        this.tripRepository = tripRepository;
    }



    public RideRequest createRideRequest(RideRequestDTO dto) {
        Customer customer = customerRepository.findByUsername(dto.getUserName())
                .orElseThrow(() -> new IllegalArgumentException("Customer with username " + dto.getUserName() + " not found"));

        if (customer.isActive()) {
            throw new IllegalStateException("Customer already has an active ride request.");
        }

        RideRequest request = new RideRequest();
        request.setCustomer(customer);
        request.setStartAddress(dto.getStartAddress());
        request.setStartLatitude(dto.getStartLatitude());
        request.setStartLongitude(dto.getStartLongitude());
        request.setDestinationAddress(dto.getDestinationAddress());
        request.setDestinationLatitude(dto.getDestinationLatitude());
        request.setDestinationLongitude(dto.getDestinationLongitude());
        request.setVehicleClass(dto.getVehicleClass()); // now uses enum
        request.setStartLocationName(dto.getStartLocationName());
        request.setDestinationLocationName(dto.getDestinationLocationName());
        request.setDistance(dto.getDistance());
        request.setDuration(dto.getDuration());
        request.setEstimatedPrice(dto.getEstimatedPrice());
        request.setStatus(Ridestatus.PLANNED);
        customer.setActive(true);
        request.setCurrentLat(dto.getStartLatitude());
        request.setCurrentLng(dto.getStartLongitude());
        request.setSimulationSpeed(1.0);
        customerRepository.save(customer);
        return rideRequestRepository.save(request);

    }

    public RideRequest getActiveRideRequestForCustomer(String username) {
        RideRequest request = rideRequestRepository.findByCustomerUsernameAndCustomerActiveTrue(username)
                .orElseThrow(() -> new NoSuchElementException("No active ride request found for user: " + username));

        if (request.getStatus() != Ridestatus.PLANNED && request.getStatus() != Ridestatus.IN_PROGRESS) {
            throw new NoSuchElementException("No active ride request found for user: " + username);
        }

        return request;
    }


    public void deleteActiveRideRequest(String username) {
        RideRequest request = rideRequestRepository.findByCustomerUsernameAndCustomerActiveTrue(username)
                .orElseThrow(() -> new NoSuchElementException("No active ride request to delete"));

        List<RideOffer> offers = rideOfferRepository.findAllByRideRequest(request);
        for (RideOffer offer : offers) {
            Driver driver = offer.getDriver();
            rideOfferRepository.delete(offer);

            if (driver != null) {
                driver.setActive(false);
                driverRepository.save(driver);
                notificationService.sendRejectionNotification(driver.getUsername());
            }
        }

        Customer customer = request.getCustomer();
        customer.setActive(false);
        customerRepository.save(customer);
        rideRequestRepository.delete(request);
    }

    public boolean hasActiveRideRequest(String username) {
        return rideRequestRepository.findByCustomerUsernameAndCustomerActiveTrue(username).isPresent();
    }
    public boolean isCustomer(String username) {
        return customerRepository.findByUsername(username).isPresent();
    }

    public List<RidesForDriversDTO> getAllRideRequests() {
        Ridestatus filterStatus = Ridestatus.PLANNED;
        return rideRequestRepository.findByStatus(filterStatus)
                .stream()
                .map(RidesForDriversDTO::new)
                .collect(Collectors.toList());
    }


    public RideOffer createRideOffer(Long rideRequestId, String driverUsername) {
        RideRequest rideRequest = rideRequestRepository.findById(rideRequestId)
                .orElseThrow(() -> new NoSuchElementException("Ride request with id " + rideRequestId + " not found"));

        Driver driver = driverRepository.findByUsername(driverUsername)
                .orElseThrow(() -> new NoSuchElementException("Driver with username " + driverUsername + " not found"));

        if (rideRequest.getStatus() != Ridestatus.PLANNED) {
            throw new IllegalArgumentException("Ride is cancelled or taken by another driver");
        }

        if (driver.getActive()) {
            throw new IllegalStateException("Driver already has an active offer.");
        }



        RideOffer rideOffer = new RideOffer();
        rideOffer.setDriver(driver);
        rideOffer.setRideRequest(rideRequest);
        driver.setActive(true);
        driverRepository.save(driver);
        RideOffer savedOffer = rideOfferRepository.save(rideOffer);
        notificationService.sendOfferNotification(driver, rideRequest);
        return savedOffer;
    }

    public boolean isDriverActive(String username) {
        return driverRepository.findByUsername(username)
                .map(Driver::getActive)
                .orElse(false);
    }
    public List<RideOfferNotification> getOffersForCustomer(String username) {
        RideRequest activeRequest = getActiveRideRequestForCustomer(username);

        List<RideOffer> offers = rideOfferRepository.findAllByRideRequest(activeRequest);

        return offers.stream().map(offer -> {
            Driver driver = offer.getDriver();

            RideOfferNotification notification = new RideOfferNotification();
            notification.setRideOfferId(offer.getId());
            notification.setDriverName(driver.getFirstName() + " " + driver.getLastName());
            notification.setDriverRating(driver.getRating());
            notification.setTotalRides(driver.getTotalRides());
            notification.setTotalTravelledDistance(driver.getTotalTravelledDistance());
            notification.setVehicleClass(driver.getVehicleClass());

            return notification;
        }).collect(Collectors.toList());
    }

    public Long getRideRequestIdIfDriverOffer(String username) {
        return driverRepository.findByUsername(username)
                .filter(Driver::getActive)
                .flatMap(rideOfferRepository::findByDriver)
                .map(rideOffer -> rideOffer.getRideRequest() != null ? rideOffer.getRideRequest().getId() : null)
                .orElse(null);
    }

    public void rejectOffer(Long rideOfferId) {
        RideOffer rideOffer = rideOfferRepository.findById(rideOfferId)
                .orElseThrow(() -> new NoSuchElementException("Ride offer with id " + rideOfferId + " not found"));


        Driver driver = rideOffer.getDriver();
        rideOfferRepository.delete(rideOffer);

        if (driver != null) {
            driver.setActive(false);
            driverRepository.save(driver);
            notificationService.sendRejectionNotification(driver.getUsername());
        }
    }

    public void cancelOffer(String username) {
        Driver driver = driverRepository.findByUsername(username)
                .orElseThrow(() -> new NoSuchElementException("Driver not found for username: " + username));

        RideOffer rideOffer = rideOfferRepository.findByDriver(driver)
                .orElseThrow(() -> new NoSuchElementException("No RideOffer found for driver: " + username));

        notificationService.sendCancelledNotification(rideOffer.getRideRequest().getCustomer().getUsername());

        rideOfferRepository.delete(rideOffer);

        driver.setActive(false);
        driverRepository.save(driver);
    }

    public void acceptRideOffer(Long rideOfferId, String customerUsername) {
        RideOffer selectedOffer = rideOfferRepository.findById(rideOfferId)
                .orElseThrow(() -> new NoSuchElementException("Ride offer with id " + rideOfferId + " not found"));

        RideRequest rideRequest = selectedOffer.getRideRequest();

        if (!rideRequest.getCustomer().getUsername().equals(customerUsername)) {
            throw new SecurityException("User is not authorized to accept this offer");
        }

        List<RideOffer> allOffers = rideOfferRepository.findAllByRideRequest(rideRequest);
        for (RideOffer offer : allOffers) {
            if (!offer.getId().equals(rideOfferId)) {
                rideOfferRepository.delete(offer);
                Driver driver = offer.getDriver();
                driver.setActive(false);
                driverRepository.save(driver);
                notificationService.sendRejectionNotification(driver.getUsername());
            }
        }

        rideRequest.setRideOffer(selectedOffer);
        rideRequest.setStatus(Ridestatus.IN_PROGRESS);
        rideOfferRepository.save(selectedOffer);
        rideRequestRepository.save(rideRequest);
        notificationService.sendAcceptNotification(selectedOffer.getDriver().getUsername());
    }








    public void completeRide(Long rideId) {
        RideRequest ride = rideRequestRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (ride.getStatus() == Ridestatus.COMPLETED)
            return;

        RideOffer offer = ride.getRideOffer();
        if (offer == null || offer.getDriver() == null) {
            throw new RuntimeException("RideOffer or Driver not found for this ride");
        }

        Driver driver = offer.getDriver();
        Wallet customerWallet = ride.getCustomer().getWallet();
        Wallet driverWallet = driver.getWallet();

        Double price = ride.getEstimatedPrice();
        Long priceInCents = Math.round(price * 100);

        // Transfer money
        customerWallet.setBalanceCents(customerWallet.getBalanceCents() - priceInCents);
        driverWallet.setBalanceCents(driverWallet.getBalanceCents() + priceInCents);

        // Set ride as completed
        ride.setStatus(Ridestatus.COMPLETED);

        // Construct full names directly
        String customerFullName = ride.getCustomer().getFirstName() + " " + ride.getCustomer().getLastName();
        String driverFullName = driver.getFirstName() + " " + driver.getLastName();

        // Create new Trips object
        Trips trip = new Trips();
        trip.setCustomer(ride.getCustomer());
        trip.setDriver(driver);
        trip.setCustomerFullName(customerFullName);
        trip.setCustomerUsername(ride.getCustomer().getUsername());
        trip.setDriverFullName(driverFullName);
        trip.setDriverUsername(driver.getUsername());
        trip.setDistanceKm(ride.getDistance());
        trip.setDurationMin(ride.getDuration());
        trip.setPriceEuro(ride.getEstimatedPrice());
        trip.setStatus(TripsStatus.COMPLETED);
        trip.setProgress(100);
        trip.setSpeed(0);
        trip.setEndTime(LocalDateTime.now());


        tripRepository.save(trip);
        walletRepository.save(customerWallet);
        walletRepository.save(driverWallet);
        driver.setTotalTravelledDistance(driver.getTotalTravelledDistance() + ride.getDistance());
        ride.getCustomer().setActive(false);
       customerRepository.save(ride.getCustomer());
        driver.setActive(false);
        driverRepository.save(driver);

        ride.setRideOffer(null);
        rideRequestRepository.save(ride);
        rideOfferRepository.delete(offer);
        rideRequestRepository.delete(ride);
    }

    public void updateSimulation(Long rideId, SimulationUpdateDTO dto) {
        RideRequest request = rideRequestRepository.findById(rideId)
                .orElseThrow(() -> new NoSuchElementException("Ride not found"));
        if (dto.getStatus() == Ridestatus.COMPLETED) {
            completeRide(request.getId());
        }
        request.setCurrentLat(dto.getCurrentLat());
        request.setCurrentLng(dto.getCurrentLng());
        request.setSimulationSpeed(dto.getSimulationSpeed());
        request.setStatus(dto.getStatus());

        rideRequestRepository.save(request);
    }
    public SimulationUpdateDTO getSimulationState(Long rideId) {
        RideRequest request = rideRequestRepository.findById(rideId)
                .orElseThrow(() -> new NoSuchElementException("Ride not found"));

        SimulationUpdateDTO dto = new SimulationUpdateDTO();
        dto.setCurrentLat(request.getCurrentLat());
        dto.setCurrentLng(request.getCurrentLng());
        dto.setSimulationSpeed(request.getSimulationSpeed());
        dto.setStatus(request.getStatus());
        return dto;
    }
    public AcceptedRideDetailsDTO getAcceptedRideDetails(String username) {
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("Username cannot be null or empty");
        }

        RideRequest ride = null;
        Optional<Customer> customerOpt = customerRepository.findByUsername(username);

        if (customerOpt.isPresent()) {
            ride = rideRequestRepository.findByCustomerUsernameAndCustomerActiveTrue(username)
                    .orElseThrow(() -> new NoSuchElementException("No active ride for this customer"));
        } else {
            Optional<Driver> driverOpt = driverRepository.findByUsername(username);
            if (driverOpt.isPresent()) {
                Driver driver = driverOpt.get();
                RideOffer offer = rideOfferRepository.findByDriver(driver)
                        .orElseThrow(() -> new NoSuchElementException("No offer made by this driver"));
                ride = offer.getRideRequest();
                if (ride.getStatus() != Ridestatus.IN_PROGRESS) {
                    throw new NoSuchElementException("Ride is not accepted yet");
                }
            } else {
                throw new NoSuchElementException("User not found as customer or driver");
            }
        }

        // Validate required location fields
        if (ride.getCurrentLat() == null || ride.getCurrentLng() == null) {
            throw new IllegalStateException("Ride location data is missing. Simulation may not have started.");
        }

        AcceptedRideDetailsDTO dto = new AcceptedRideDetailsDTO();
        dto.setRideId(ride.getId());
        dto.setStatus(Ridestatus.valueOf(ride.getStatus().name()));

        // Set locations with null checks (though we validated currentLat/Lng above)
        dto.setStartLat(ride.getStartLatitude() != null ? ride.getStartLatitude() : 0.0);
        dto.setStartLng(ride.getStartLongitude() != null ? ride.getStartLongitude() : 0.0);
        dto.setDestLat(ride.getDestinationLatitude() != null ? ride.getDestinationLatitude() : 0.0);
        dto.setDestLng(ride.getDestinationLongitude() != null ? ride.getDestinationLongitude() : 0.0);
        dto.setCurrentLat(ride.getCurrentLat());
        dto.setCurrentLng(ride.getCurrentLng());

        // Set optional fields with null checks
        dto.setSimulationSpeed(ride.getSimulationSpeed() != null ? ride.getSimulationSpeed() : 1.0);
        dto.setEstimatedPrice(ride.getEstimatedPrice());

        // Handle customer info
        if (ride.getCustomer() != null) {
            dto.setCustomerUsername(ride.getCustomer().getUsername());
        }

        // Handle driver info if available
        RideOffer offer = ride.getRideOffer();
        if (offer != null && offer.getDriver() != null) {
            Driver driver = offer.getDriver();
            dto.setDriverUsername(driver.getUsername());

            String fullName = "";
            if (driver.getFirstName() != null) fullName += driver.getFirstName();
            if (driver.getLastName() != null) fullName += " " + driver.getLastName();
            dto.setDriverFullName(fullName.trim());

            if (driver.getVehicleClass() != null) {
                dto.setVehicleClass(VehicleClassEnum.valueOf(driver.getVehicleClass().name()));
            }

            dto.setDriverRating((double) driver.getRating());
        }

        return dto;
    }
    public String rateRide(Long rideId, float rating, String username) {
        RideRequest ride = rideRequestRepository.findById(rideId)
                .orElseThrow(() -> new NoSuchElementException("Ride not found"));

        if (ride.getStatus() != Ridestatus.COMPLETED) {
            return "Ride is not completed yet.";
        }

        Optional<Customer> customerOpt = customerRepository.findByUsername(username);
        if (customerOpt.isPresent()) {
            RideOffer offer = ride.getRideOffer();
            if (offer == null || offer.getDriver() == null) {
                return "No driver to rate.";
            }

            Driver driver = offer.getDriver();
            driver.addRating(rating);
            driverRepository.save(driver);
            return "Driver rated successfully.";
        }

        Optional<Driver> driverOpt = driverRepository.findByUsername(username);
        if (driverOpt.isPresent()) {
            Customer customer = ride.getCustomer();
            customer.addRating(rating);
            customerRepository.save(customer);
            return "Customer rated successfully.";
        }

        throw new SecurityException("User not authorized.");
    }


}

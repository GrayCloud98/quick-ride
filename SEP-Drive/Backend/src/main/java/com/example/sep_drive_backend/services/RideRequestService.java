package com.example.sep_drive_backend.services;

import com.example.sep_drive_backend.constants.Ridestatus;
import com.example.sep_drive_backend.constants.VehicleClassEnum;
import com.example.sep_drive_backend.dto.RideOfferNotification;
import com.example.sep_drive_backend.dto.RidesForDriversDTO;
import com.example.sep_drive_backend.models.*;
import com.example.sep_drive_backend.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import com.example.sep_drive_backend.dto.RideRequestDTO;




import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RideRequestService {


    @Autowired
    private WalletRepository walletRepository;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private final RideRequestRepository repository;

    @Autowired
    private final CustomerRepository customerRepository;

    @Autowired
    private final DriverRepository driverRepository;

    @Autowired
    private RideOfferRepository rideOfferRepository;
    @Autowired
    private RideRequestRepository rideRequestRepository;

    public RideRequestService(RideRequestRepository repository, CustomerRepository customerRepository, DriverRepository driverRepository, RideOfferRepository rideOfferRepository) {
        this.repository = repository;
        this.customerRepository = customerRepository;
        this.driverRepository = driverRepository;
        this.rideOfferRepository = rideOfferRepository;
    }


    public RideRequest createRideRequest(RideRequestDTO dto) {
        Optional<Customer> customerOptional = customerRepository.findByUsername(dto.getUserName());

        if (!customerOptional.isPresent()) {
            throw new IllegalArgumentException("Customer with username " + dto.getUserName() + " not found");
        }

        Customer customer = customerOptional.get();
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

        customer.setActive(true);
        customerRepository.save(customer);
        return repository.save(request);
    }

    public RideRequest getActiveRideRequestForCustomer(String username) {
        return repository.findByCustomerUsernameAndCustomerActiveTrue(username)
                .orElseThrow(() -> new NoSuchElementException("No active ride request found for user: " + username));
    }

    public void deleteActiveRideRequest(String username) {
        RideRequest request = repository.findByCustomerUsernameAndCustomerActiveTrue(username)
                .orElseThrow(() -> new NoSuchElementException("No active ride request to delete"));

        Customer customer = request.getCustomer();
        customer.setActive(false);
        customerRepository.save(customer);
        repository.delete(request);
    }

    public boolean hasActiveRideRequest(String username) {
        return repository.findByCustomerUsernameAndCustomerActiveTrue(username).isPresent();
    }
    public boolean isCustomer(String username) {
        return customerRepository.findByUsername(username).isPresent();
    }

    public List<RidesForDriversDTO> getAllRideRequests(double driverLat, double driverLon) {
        return repository.findAll().stream()
                .map(r -> {
                    double distance = calculateDistance(
                            driverLat,
                            driverLon,
                            r.getStartLatitude(),
                            r.getStartLongitude()
                    );
                    return new RidesForDriversDTO(r, distance);
                })
                .collect(Collectors.toList());
    }
    public RideOffer createRideOffer(Long rideRequestId, String driverUsername) {

        Optional<RideRequest> rideRequestOptional = repository.findById(rideRequestId);
        RideRequest rideRequest = rideRequestOptional.orElseThrow(() -> new NoSuchElementException("Ride request with id " + rideRequestId + " not found"));
        Customer customer = rideRequest.getCustomer();
        Optional<Driver> driverOptional = driverRepository.findByUsername(driverUsername);
        Driver driver = driverOptional.orElseThrow(() -> new NoSuchElementException("Driver with username " + driverUsername + " not found"));
        if (!driver.getActive()) {
            RideOffer rideOffer = new RideOffer();
            rideOffer.setDriver(driver);
            rideOffer.setRideRequest(rideRequest);
            driver.setActive(true);
            driverRepository.save(driver);
            RideOffer savedOffer = rideOfferRepository.save(rideOffer);

            RideOfferNotification notification = new RideOfferNotification();
            notification.setMessage("A driver wants to take your ride!");
            notification.setDriverName(driver.getFirstName() + " " + driver.getLastName());
            notification.setDriverRating(driver.getRating());
            notification.setTotalRides(driver.getTotalRides());
            notification.setTotalTravelledDistance(0);
            notification.setVehicleClass(driver.getVehicleClass());

            String customerUsername = rideRequest.getCustomer().getUsername();

            messagingTemplate.convertAndSend("/topic/customer/" + customerUsername, notification);
            System.out.println("Notification sent to customer " + customerUsername);
            return savedOffer;
        } else {
            return null;
        }
    }


    public boolean isDriverActive(String username) {
        return driverRepository.findByUsername(username)
                .map(Driver::getActive)
                .orElse(false);
    }

    public Long getRideRequestIdIfDriverOffer(String username) {
        Optional<Driver> driverOpt = driverRepository.findByUsername(username);
        if (driverOpt.isPresent() && driverOpt.get().getActive()) {
            Optional<RideOffer> offerOpt = rideOfferRepository.findByDriver(driverOpt.get());
            if (offerOpt.isPresent() && offerOpt.get().getRideRequest() != null) {
                return offerOpt.get().getRideRequest().getId();
            }
        }
        return null;
    }

    public void rejectOffer(Long rideOfferId) {
        Optional<RideOffer> rideOfferOptional = rideOfferRepository.findById(rideOfferId);
        if (rideOfferOptional.isPresent()) {
            RideOffer rideOffer = rideOfferOptional.get();
            rideOfferRepository.delete(rideOffer);

            Driver driver = rideOffer.getDriver();
            if (driver != null) {
                driver.setActive(false);
                driverRepository.save(driver);
            }
        } else {
            System.out.println("Ride offer not found.");
        }
    }

    public void cancelOffer(String username) {
        Optional<Driver> driverOptional = driverRepository.findByUsername(username);
        Driver driver = driverOptional.get();
        Optional<RideOffer> rideOfferOptional = rideOfferRepository.findByDriver(driver);
        RideOffer rideOffer = rideOfferOptional.get();
        rideOfferRepository.delete(rideOffer);
        driver.setActive(false);
        driverRepository.save(driver);
    }

    public void acceptRideOffer(Long rideOfferId, String customerUsername) {
        RideOffer selectedOffer = rideOfferRepository.findById(rideOfferId)
                .orElseThrow(() -> new RuntimeException("Offer not found"));

        RideRequest rideRequest = selectedOffer.getRideRequest();
        if (!rideRequest.getCustomer().getUsername().equals(customerUsername)) {
            throw new RuntimeException("User not authorized to accept this offer");
        }
        List<RideOffer> allOffers = rideOfferRepository.findAllByRideRequest(rideRequest);
        for (RideOffer offer : allOffers) {
            if (!offer.getId().equals(rideOfferId)) {
                rideOfferRepository.delete(offer);
                Driver driver = offer.getDriver();
                driver.setActive(false);
                driverRepository.save(driver);
            }
        }
        rideOfferRepository.save(selectedOffer);
        rideRequestRepository.save(rideRequest);
    }

    private static final double EARTH_RADIUS_KM = 6371.0;

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);

        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_KM * c;
    }
    @Transactional
    public void completeRide(Long rideId) {
        RideRequest ride = rideRequestRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (ride.getStatus() == Ridestatus.COMPLETED)
            return;

        Wallet customerWallet = ride.getCustomer().getWallet();

        // 🔍 Get driver via RideOffer
        RideOffer offer = ride.getRideOffer();
        if (offer == null || offer.getDriver() == null) {
            throw new RuntimeException("RideOffer or Driver not found for this ride");
        }

        Wallet driverWallet = offer.getDriver().getWallet();

        Double price = ride.getEstimatedPrice();
        Long priceInCents = Math.round(price * 100);

        customerWallet.setBalanceCents(customerWallet.getBalanceCents() - priceInCents);
        driverWallet.setBalanceCents(driverWallet.getBalanceCents() + priceInCents);

        ride.setStatus(Ridestatus.COMPLETED);

        walletRepository.save(customerWallet);
        walletRepository.save(driverWallet);
        rideRequestRepository.save(ride);
    }

}

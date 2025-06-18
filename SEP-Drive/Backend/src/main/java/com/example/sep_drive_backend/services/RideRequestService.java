package com.example.sep_drive_backend.services;

import com.example.sep_drive_backend.constants.RideStatus;
import com.example.sep_drive_backend.dto.*;
import com.example.sep_drive_backend.models.*;
import com.example.sep_drive_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


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
    private final RideSimulationRepository rideSimulationRepository;

    @Autowired
    public RideRequestService(
            CustomerRepository customerRepository,
            DriverRepository driverRepository,
            NotificationService notificationService,
            RideOfferRepository rideOfferRepository,
            RideRequestRepository rideRequestRepository,
            WalletRepository walletRepository,
            TripRepository tripRepository, RideSimulationRepository rideSimulationRepository) {

        this.customerRepository = customerRepository;
        this.driverRepository = driverRepository;
        this.notificationService = notificationService;
        this.rideOfferRepository = rideOfferRepository;
        this.rideRequestRepository = rideRequestRepository;
        this.walletRepository = walletRepository;
        this.tripRepository = tripRepository;
        this.rideSimulationRepository = rideSimulationRepository;
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
        customer.setActive(true);
        customerRepository.save(customer);
        return rideRequestRepository.save(request);

    }

    public RideRequest getActiveRideRequestForCustomer(String username) {
        RideRequest request = rideRequestRepository.findByCustomerUsernameAndCustomerActiveTrue(username)
                .orElseThrow(() -> new NoSuchElementException("No active ride request found for user: " + username));


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
        return rideRequestRepository.findAll().stream()
                .map(RidesForDriversDTO::new)
                .collect(Collectors.toList());
    }



    public RideOffer createRideOffer(Long rideRequestId, String driverUsername) {
        RideRequest rideRequest = rideRequestRepository.findById(rideRequestId)
                .orElseThrow(() -> new NoSuchElementException("Ride request with id " + rideRequestId + " not found"));

        Driver driver = driverRepository.findByUsername(driverUsername)
                .orElseThrow(() -> new NoSuchElementException("Driver with username " + driverUsername + " not found"));


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

    public Long acceptRideOffer(Long rideOfferId, String customerUsername) {
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

        RideSimulation rideSimulation = new RideSimulation();

        RideSimulation.Point startPoint = new RideSimulation.Point(
                rideRequest.getStartLatitude(),
                rideRequest.getStartLongitude()
        );
        rideSimulation.setStartPoint(startPoint);

        RideSimulation.Point endPoint = new RideSimulation.Point(
                rideRequest.getDestinationLatitude(),
                rideRequest.getDestinationLongitude()
        );

        rideSimulation.setEndPoint(endPoint);
        rideSimulation.setPaused(true);
        rideSimulation.setDuration(30.0);
        rideSimulation.setCurrentIndex(0.0);
        selectedOffer.getDriver().setRideSimulation(rideSimulation);
        rideRequest.getCustomer().setRideSimulation(rideSimulation);
        selectedOffer.getDriver().setSimulationStatus(RideStatus.CREATED);
        rideRequest.getCustomer().setSimulationStatus(RideStatus.CREATED);
        rideSimulationRepository.save(rideSimulation);
        rideOfferRepository.save(selectedOffer);
        rideRequestRepository.save(rideRequest);
        notificationService.sendAcceptNotification(selectedOffer.getDriver().getUsername());

        return rideSimulation.getId();
    }

    public Boolean hasAcceptedOffer(String username) {
        Optional<Driver> driverOpt = driverRepository.findByUsername(username);
        if (driverOpt.isPresent() && RideStatus.CREATED.equals(driverOpt.get().getSimulationStatus())) {
            return true;
        }

        Optional<Customer> customerOpt = customerRepository.findByUsername(username);
        if (customerOpt.isPresent() && RideStatus.CREATED.equals(customerOpt.get().getSimulationStatus())) {
            return true;
        }

        return false;
    }



}

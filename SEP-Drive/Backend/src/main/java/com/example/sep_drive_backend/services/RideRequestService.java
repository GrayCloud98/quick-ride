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
            RideSimulationRepository rideSimulationRepository) {

        this.customerRepository = customerRepository;
        this.driverRepository = driverRepository;
        this.notificationService = notificationService;
        this.rideOfferRepository = rideOfferRepository;
        this.rideRequestRepository = rideRequestRepository;
        this.walletRepository = walletRepository;
        this.rideSimulationRepository = rideSimulationRepository;
    }



    public RideRequest createRideRequest(RideRequestDTO dto) {
        Customer customer = customerRepository.findByUsername(dto.getUserName())
                .orElseThrow(() -> new IllegalArgumentException("Customer with username " + dto.getUserName() + " not found"));

        boolean hasActiveRequest = rideRequestRepository.existsByCustomerUsernameAndRideStatusIn(
                customer.getUsername(),
                List.of(RideStatus.CREATED, RideStatus.IN_PROGRESS)
        );

        if (hasActiveRequest) {
            throw new IllegalStateException("Customer already has an active or in-progress ride request.");
        }

        RideRequest request = new RideRequest(
                customer,
                dto.getStartAddress(),
                dto.getStartLatitude(),
                dto.getStartLongitude(),
                dto.getStartLocationName(),
                dto.getDestinationLocationName(),
                dto.getDestinationAddress(),
                dto.getDestinationLatitude(),
                dto.getDestinationLongitude(),
                dto.getDistance(),
                dto.getDuration(),
                dto.getEstimatedPrice(),
                dto.getVehicleClass()
        );

        customer.setActive(true);
        customerRepository.save(customer);

        request.setRideStatus(RideStatus.CREATED);

        return rideRequestRepository.save(request);
    }

    public RideRequest getActiveRideRequestForCustomer(String username) {
        return rideRequestRepository.findFirstByCustomerUsernameAndRideStatusIn(
                username,
                List.of(RideStatus.CREATED, RideStatus.IN_PROGRESS)
        ).orElseThrow(() -> new NoSuchElementException("No active ride request found for user: " + username));
    }


    public void deleteActiveRideRequest(String username) {
        RideRequest request = rideRequestRepository.findFirstByCustomerUsernameAndRideStatus(
                username,
                RideStatus.CREATED
        ).orElseThrow(() -> new NoSuchElementException("No ride request with status CREATED to delete"));

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
        return rideRequestRepository.findFirstByCustomerUsernameAndRideStatus(
                username,
                RideStatus.CREATED
        ).isPresent();
    }

    public boolean isCustomer(String username) {
        return customerRepository.findByUsername(username).isPresent();
    }

    public List<RidesForDriversDTO> getAllRideRequests() {
        return rideRequestRepository.findAllByRideStatus(RideStatus.CREATED).stream()
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



        driver.setActive(true);
        RideOffer rideOffer = new RideOffer();
        rideOffer.setDriver(driver);
        rideOffer.setRideRequest(rideRequest);
        rideOffer.setRideStatus(RideStatus.CREATED);
        driverRepository.save(driver);
        rideOfferRepository.save(rideOffer);
        notificationService.sendOfferNotification(driver, rideRequest);
        return rideOffer;
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
        rideSimulation.setCustomer(rideRequest.getCustomer());
        rideSimulation.setDriver(selectedOffer.getDriver());
        rideSimulation.setRideOffer(selectedOffer);
        rideSimulation.setStartLocationName(rideRequest.getStartLocationName());
        rideSimulation.setDestinationLocationName(rideRequest.getDestinationLocationName());
        rideSimulation.setCurrentIndex(0);
        rideRequest.setRideStatus(RideStatus.IN_PROGRESS);
        selectedOffer.setRideStatus(RideStatus.IN_PROGRESS);
        rideSimulation.setRideStatus(RideStatus.CREATED);
        rideSimulationRepository.save(rideSimulation);
        rideOfferRepository.save(selectedOffer);
        rideRequestRepository.save(rideRequest);

        notificationService.sendAcceptNotification(selectedOffer.getDriver().getUsername());

    }


    public Optional<Long> getSimId(String username) {
        Optional<Customer> customer = customerRepository.findByUsername(username);
        if (customer.isPresent()) {
            return rideSimulationRepository.findCurrentCreatedSimulationIdByCustomerUsername(username);
        }
        Optional<Driver> driver = driverRepository.findByUsername(username);
        if (driver.isPresent()) {
            return rideSimulationRepository.findCurrentCreatedSimulationIdByDriverUsername(username);
        }
        return Optional.empty();
    }

    public void rateCustomer(Long rideSimulationId, int rate) {
        Optional<RideSimulation> rideSimulation = rideSimulationRepository.findById(rideSimulationId);
        rideSimulation.get().getRideOffer().getRideRequest().setCustomerRating(rate);
        if (rideSimulation.isPresent()) {
            Optional<Customer> customer = customerRepository.findByUsername(
                    rideSimulation.get().getCustomer().getUsername());
            if (customer.isPresent()) {

                Customer c = customer.get();
                double lastAverageRating = c.getRating();
                double totalRides = c.getTotalRides();
                double previousTotalRides = totalRides - 1;
                double newAverageRating = ((lastAverageRating * previousTotalRides) + rate) / totalRides;

                c.setRating((float) newAverageRating);
                customerRepository.save(c);
            }
        }
    }

    public void rateDriver(Long rideSimulationId, int rate) {
        Optional<RideSimulation> rideSimulation = rideSimulationRepository.findById(rideSimulationId);
        rideSimulation.get().getRideOffer().getRideRequest().setDriverRating(rate);
        if (rideSimulation.isPresent()) {
            Optional<Driver> driver = driverRepository.findByUsername(
                    rideSimulation.get().getDriver().getUsername());
            if (driver.isPresent()) {
                Driver d = driver.get();
                double lastAverageRating = d.getRating();
                double totalRides = d.getTotalRides();
                double previousTotalRides = d.getTotalRides() - 1;
                double newAverageRating = ((lastAverageRating * previousTotalRides) + rate) / totalRides;

                d.setRating((float) newAverageRating);
                driverRepository.save(d);
            }
        }
    }
    public List<RideHistoryDTO> getUserRideHistory(String username) {
        Optional<Driver> driverOpt = driverRepository.findByUsername(username);
        if (driverOpt.isPresent()) {
            List<RideOffer> completedOffers = rideOfferRepository
                    .findByDriverUsernameAndRideStatus(username, RideStatus.COMPLETED);

            return completedOffers.stream().map(offer -> {
                RideHistoryDTO dto = new RideHistoryDTO();
                dto.setRideId(offer.getRideRequest().getId());
                dto.setDistance(offer.getRideRequest().getDistance());
                dto.setDuration(offer.getRideRequest().getDuration());
                dto.setCustomerName(offer.getRideRequest().getCustomer().getFirstName() + " " + offer.getRideRequest().getCustomer().getLastName());
                dto.setCustomerUsername(offer.getRideRequest().getCustomer().getUsername());
                dto.setFees(offer.getRideRequest().getEstimatedPrice());
                dto.setEndTime(offer.getRideRequest().getEndedAt());
                dto.setDriverRating(offer.getRideRequest().getDriverRating());
                dto.setCustomerRating(offer.getRideRequest().getCustomerRating());
                dto.setDriverUsername(offer.getDriver().getUsername());
                dto.setDriverName(offer.getDriver().getFirstName() + " " + offer.getDriver().getLastName());
                return dto;
            }).collect(Collectors.toList());

        }

        Optional<Customer> customerOpt = customerRepository.findByUsername(username);
        if (customerOpt.isPresent()) {
            List<RideRequest> completedRequests = rideRequestRepository
                    .findByCustomerUsernameAndRideStatus(username, RideStatus.COMPLETED);

            return completedRequests.stream().map(request -> {
                RideHistoryDTO dto = new RideHistoryDTO();
                dto.setRideId(request.getId());
                dto.setDistance(request.getDistance());
                dto.setDuration(request.getDuration());
                dto.setCustomerName(request.getCustomer().getFirstName() + " " + request.getCustomer().getLastName());
                dto.setCustomerUsername(request.getCustomer().getUsername());
                dto.setFees(request.getEstimatedPrice());
                dto.setEndTime(request.getEndedAt());
                dto.setDriverRating(request.getDriverRating());
                dto.setCustomerRating(request.getCustomerRating());

                Optional<RideOffer> offerOpt = rideOfferRepository.findByRideRequestId(request.getId());
                if (offerOpt.isPresent()) {
                    Driver driver = offerOpt.get().getDriver();
                    dto.setDriverUsername(driver.getUsername());
                    dto.setDriverName(driver.getFirstName() + " " + driver.getLastName());
                } else {
                    dto.setDriverUsername(null);
                    dto.setDriverName(null);
                }

                return dto;
            }).collect(Collectors.toList());
        }

        throw new RuntimeException("User not found: " + username);

    }
}

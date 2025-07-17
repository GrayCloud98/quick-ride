package com.example.sep_drive_backend.services;

import com.example.sep_drive_backend.constants.RideStatus;
import com.example.sep_drive_backend.constants.VehicleClassEnum;
import com.example.sep_drive_backend.dto.*;
import com.example.sep_drive_backend.models.*;
import com.example.sep_drive_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import javax.swing.text.html.Option;
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
    private final TripRepository tripRepository;

    @Autowired
    public RideRequestService(
            CustomerRepository customerRepository,
            DriverRepository driverRepository,
            NotificationService notificationService,
            RideOfferRepository rideOfferRepository,
            RideRequestRepository rideRequestRepository,
            WalletRepository walletRepository,
            RideSimulationRepository rideSimulationRepository, TripRepository tripRepository) {

        this.customerRepository = customerRepository;
        this.driverRepository = driverRepository;
        this.notificationService = notificationService;
        this.rideOfferRepository = rideOfferRepository;
        this.rideRequestRepository = rideRequestRepository;
        this.walletRepository = walletRepository;
        this.rideSimulationRepository = rideSimulationRepository;
        this.tripRepository = tripRepository;
    }



    public RideRequest createRideRequest(RideRequestDTO dto) {
        Customer customer = customerRepository.findByUsername(dto.getCustomerUsername())
                .orElseThrow(() -> new IllegalArgumentException("Customer with username " + dto.getCustomerUsername() + " not found"));

        boolean hasActiveRequest = rideRequestRepository.existsByCustomerUsernameAndRideStatusIn(
                customer.getUsername(),
                List.of(RideStatus.CREATED, RideStatus.IN_PROGRESS)
        );

        if (hasActiveRequest) {
            throw new IllegalStateException("Customer already has an active or in-progress ride request.");
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

        if (dto.getWaypoints() != null && !dto.getWaypoints().isEmpty()) {
            List<Waypoint> waypoints = dto.getWaypoints().stream()
                    .map(wpDto -> {
                        Waypoint wp = new Waypoint();
                        wp.setAddress(wpDto.getAddress());
                        wp.setLatitude(wpDto.getLatitude());
                        wp.setLongitude(wpDto.getLongitude());
                        wp.setSequenceOrder(wpDto.getSequenceOrder());
                        wp.setName(wpDto.getName());
                        wp.setRideRequest(request);
                        return wp;
                    })
                    .collect(Collectors.toList());

            request.setWaypoints(waypoints);
        }

        customer.setActive(true);
        customerRepository.save(customer);

        request.setRideStatus(RideStatus.CREATED);

        return rideRequestRepository.save(request);
    }

    public RideRequest getActiveRideRequestForCustomer(String username) {
        return rideRequestRepository.findFirstByCustomerUsernameAndRideStatus(
                username,
                RideStatus.CREATED
        ).orElseThrow(() -> new NoSuchElementException("No active ride request with status CREATED found for user: " + username));
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

        if (rideRequest.getRideStatus() != RideStatus.CREATED) {
            throw new IllegalStateException("Cannot create offer: ride request is no longer open for offers.");
        }

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

    // IDK??
    public boolean isDriverActive(String username) {
        return driverRepository.findByUsername(username)
                .map(Driver::getActive)
                .orElse(false);
    }

    public List<RideOfferNotification> getOffersForCustomer(String username) {
        RideRequest activeRequest = getActiveRideRequestForCustomer(username);

        if (activeRequest.getRideStatus() != RideStatus.CREATED) {
            throw new IllegalStateException("Cannot view offers: ride request is no longer open for offers.");
        }

        List<RideOffer> offers = rideOfferRepository.findAllByRideRequest(activeRequest);

        return offers.stream().map(offer -> {
            Driver driver = offer.getDriver();

            RideOfferNotification notification = new RideOfferNotification();
            notification.setRideOfferId(offer.getId());
            notification.setDriverName(driver.getFirstName() + " " + driver.getLastName());
            notification.setDriverUsername(driver.getUsername());
            notification.setDriverRating(driver.getRating());
            notification.setTotalRides(driver.getTotalRides());
            notification.setTotalTravelledDistance(driver.getTotalTravelledDistance());
            notification.setVehicleClass(driver.getVehicleClass());

            return notification;
        }).collect(Collectors.toList());
    }

    public Optional<Long> getRideRequestIdIfDriverOffer(String username) {
        List<RideStatus> activeStatuses = List.of(RideStatus.CREATED, RideStatus.IN_PROGRESS);
        return driverRepository.findByUsername(username)
                .flatMap(driver -> rideOfferRepository
                        .findFirstByDriverAndRideStatusIn(driver, activeStatuses)
                        .map(rideOffer -> rideOffer.getRideRequest().getId()));
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

        RideOffer rideOffer = rideOfferRepository.findFirstByDriverAndRideStatus(
                driver,
                RideStatus.CREATED
        ).orElseThrow(() -> new NoSuchElementException("No active RideOffer with status CREATED found for driver: " + username));

        notificationService.sendCancelledNotification(rideOffer.getRideRequest().getCustomer().getUsername());

        rideOfferRepository.delete(rideOffer);

        driver.setActive(false);
        driverRepository.save(driver);
    }

    public void acceptRideOffer(Long rideOfferId, String customerUsername) {
        RideOffer selectedOffer = rideOfferRepository.findById(rideOfferId)
                .orElseThrow(() -> new NoSuchElementException("Ride offer with id " + rideOfferId + " not found"));

        RideRequest rideRequest = selectedOffer.getRideRequest();
        double newEstimatedPrice = 0.0;
        if (selectedOffer.getDriver().getVehicleClass() == VehicleClassEnum.Large){
            newEstimatedPrice = rideRequest.getDistance() * 10;
        } else if (selectedOffer.getDriver().getVehicleClass() == VehicleClassEnum.Medium) {
            newEstimatedPrice = rideRequest.getDistance() * 2;

        } else if (selectedOffer.getDriver().getVehicleClass() == VehicleClassEnum.Small) {
            newEstimatedPrice = rideRequest.getDistance() * 1;
        }

        rideRequest.setEstimatedPrice(newEstimatedPrice);
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

        //Start from here

        RideSimulation rideSimulation = new RideSimulation();

        Point startPoint = new Point(
                rideRequest.getStartLatitude(),
                rideRequest.getStartLongitude()
        );
        rideSimulation.setStartPoint(startPoint);

        Point endPoint = new Point(
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
        rideSimulation.setStartAddress(rideRequest.getStartAddress());
        rideSimulation.setEndAddress(rideRequest.getDestinationAddress());

        rideRequest.setRideStatus(RideStatus.IN_PROGRESS);
        selectedOffer.setRideStatus(RideStatus.IN_PROGRESS);
        rideSimulation.setRideStatus(RideStatus.CREATED);
        rideSimulationRepository.save(rideSimulation);
        rideOfferRepository.save(selectedOffer);
        rideRequestRepository.save(rideRequest);
        notificationService.sendAcceptNotification(selectedOffer.getDriver().getUsername());

    }

    //it only returns true if the sim status is created or in progress
    public boolean hasActiveSim(String username) {
        Optional<Customer> customer = customerRepository.findByUsername(username);
        if (customer.isPresent()) {
            return rideSimulationRepository.existsByCustomerUsernameAndRideStatusIsOrCustomerUsernameAndRideStatusIs(
                    username, RideStatus.CREATED,
                    username, RideStatus.IN_PROGRESS
            );
        } else {
            Optional<Driver> driver = driverRepository.findByUsername(username);
            return driver.isPresent() &&
                    rideSimulationRepository.existsByDriverUsernameAndRideStatusIsOrDriverUsernameAndRideStatusIs(
                            username, RideStatus.CREATED,
                            username, RideStatus.IN_PROGRESS
                    );
        }
    }

    //get sim id created or In_progress, completed sim id not possible yet
    public Optional<Long> getInProgressOrCreatedSimId(String username) {
        List<RideStatus> activeStatuses = List.of(RideStatus.CREATED, RideStatus.IN_PROGRESS);

        Optional<Customer> customer = customerRepository.findByUsername(username);
        if (customer.isPresent()) {
            return rideSimulationRepository
                    .findFirstByCustomerUsernameAndRideStatusIn(username, activeStatuses)
                    .map(RideSimulation::getId);
        }

        Optional<Driver> driver = driverRepository.findByUsername(username);
        if (driver.isPresent()) {
            return rideSimulationRepository
                    .findFirstByDriverUsernameAndRideStatusIn(username, activeStatuses)
                    .map(RideSimulation::getId);
        }

        return Optional.empty();
    }


    public void rateCustomer(Long rideSimulationId, int rate) {
        Optional<RideSimulation> rideSimulation = rideSimulationRepository.findById(rideSimulationId);
        rideSimulation.get().getRideOffer().getRideRequest().setCustomerRating(rate);
        Long rideReqId = rideSimulation.get().getRideOffer().getRideRequest().getId();
        Optional<Trips> trip = tripRepository.findById(rideReqId);
        trip.get().setCustomerRating(rate);
        tripRepository.save(trip.get());
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
        Long rideReqId = rideSimulation.get().getRideOffer().getRideRequest().getId();
        Optional<Trips> trip = tripRepository.findById(rideReqId);
        trip.get().setDriverRating(rate);
        tripRepository.save(trip.get());
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

            return completedOffers.stream()
                    .filter(offer -> offer.getRideRequest() != null
                            && RideStatus.COMPLETED.equals(offer.getRideRequest().getRideStatus()))
                    .map(offer -> {
                        RideRequest request = offer.getRideRequest();
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
                        dto.setDriverUsername(offer.getDriver().getUsername());
                        dto.setDriverName(offer.getDriver().getFirstName() + " " + offer.getDriver().getLastName());
                        return dto;
                    })
                    .collect(Collectors.toList());
        }

        Optional<Customer> customerOpt = customerRepository.findByUsername(username);
        if (customerOpt.isPresent()) {
            List<RideRequest> completedRequests = rideRequestRepository
                    .findByCustomerUsernameAndRideStatus(username, RideStatus.COMPLETED);

            return completedRequests.stream()
                    .filter(request -> request.getRideStatus() == RideStatus.COMPLETED)
                    .map(request -> {
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
                        if (offerOpt.isPresent() && offerOpt.get().getRideStatus() == RideStatus.COMPLETED) {
                            Driver driver = offerOpt.get().getDriver();
                            dto.setDriverUsername(driver.getUsername());
                            dto.setDriverName(driver.getFirstName() + " " + driver.getLastName());
                        } else {
                            dto.setDriverUsername(null);
                            dto.setDriverName(null);
                        }

                        return dto;
                    })
                    .collect(Collectors.toList());
        }

        throw new RuntimeException("User not found: " + username);
    }

    public Optional<VehicleClassEnum> getCustomerActiveSimDriverVehicleClass(String username) {
        List<RideStatus> activeStatuses = List.of(RideStatus.CREATED, RideStatus.IN_PROGRESS);
        return rideSimulationRepository
                .findFirstByCustomerUsernameAndRideStatusIn(username, activeStatuses)
                .map(sim -> sim.getDriver().getVehicleClass());
    }
}

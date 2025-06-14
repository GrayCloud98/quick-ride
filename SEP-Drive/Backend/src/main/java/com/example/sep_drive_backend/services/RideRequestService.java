package com.example.sep_drive_backend.services;
import com.example.sep_drive_backend.dto.RideOfferNotification;
import com.example.sep_drive_backend.dto.RidesForDriversDTO;
import com.example.sep_drive_backend.models.Customer;
import com.example.sep_drive_backend.models.Driver;
import com.example.sep_drive_backend.models.RideOffer;
import com.example.sep_drive_backend.models.RideRequest;
import com.example.sep_drive_backend.repository.CustomerRepository;
import com.example.sep_drive_backend.repository.DriverRepository;
import com.example.sep_drive_backend.repository.RideOfferRepository;
import com.example.sep_drive_backend.repository.RideRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.sep_drive_backend.dto.RideRequestDTO;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class RideRequestService {

    private final CustomerRepository customerRepository;
    private final DriverRepository driverRepository;
    private final NotificationService notificationService;
    private final RideOfferRepository rideOfferRepository;
    private final RideRequestRepository rideRequestRepository;

    @Autowired
    public RideRequestService(CustomerRepository customerRepository, DriverRepository driverRepository, NotificationService notificationService, RideOfferRepository rideOfferRepository, RideRequestRepository rideRequestRepository) {
        this.customerRepository = customerRepository;
        this.driverRepository = driverRepository;
        this.notificationService = notificationService;
        this.rideOfferRepository = rideOfferRepository;
        this.rideRequestRepository = rideRequestRepository;
    }


    public RideRequest createRideRequest(RideRequestDTO dto) {
        Customer customer = customerRepository.findByUsername(dto.getUserName())
                .orElseThrow(() -> new IllegalArgumentException("Customer with username " + dto.getUserName() + " not found"));

        if (customer.isActive()) {
            throw new IllegalStateException("Customer already has an active ride request.");
        }

        RideRequest request = new RideRequest(
                null,
                dto.getStartAddress(),
                dto.getStartLocationName(),
                dto.getDestinationLocationName(),
                dto.getDestinationAddress(),
                dto.getStartLatitude(),
                dto.getStartLongitude(),
                dto.getDestinationLatitude(),
                dto.getDestinationLongitude(),
                dto.getVehicleClass(),
                customer,
                dto.getDistance(),
                dto.getDuration(),
                dto.getEstimatedPrice()
        );

        customer.setActive(true);
        customerRepository.save(customer);
        return rideRequestRepository.save(request);
    }

    public RideRequest getActiveRideRequestForCustomer(String username) {
        return rideRequestRepository.findByCustomerUsernameAndCustomerActiveTrue(username)
                .orElseThrow(() -> new NoSuchElementException("No active ride request found for user: " + username));
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

    public List<RidesForDriversDTO> getAllRideRequests(double driverLat, double driverLon) {
        return rideRequestRepository.findAll().stream()
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
            notification.setTotalTravelledDistance(0);
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

        rideOfferRepository.delete(rideOffer);

        Driver driver = rideOffer.getDriver();
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

        rideOfferRepository.save(selectedOffer);
        rideRequestRepository.save(rideRequest);
        notificationService.sendAcceptNotification(selectedOffer.getDriver().getUsername());
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
}

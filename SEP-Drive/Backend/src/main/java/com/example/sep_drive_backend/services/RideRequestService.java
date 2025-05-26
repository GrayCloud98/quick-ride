package com.example.sep_drive_backend.services;

import com.example.sep_drive_backend.dto.RideOfferDTO;
import com.example.sep_drive_backend.dto.RidesForDriversDTO;
import com.example.sep_drive_backend.models.Customer;
import com.example.sep_drive_backend.models.Driver;
import com.example.sep_drive_backend.models.RideRequest;
import com.example.sep_drive_backend.repository.CustomerRepository;
import com.example.sep_drive_backend.repository.DriverRepository;
import com.example.sep_drive_backend.repository.RideRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.sep_drive_backend.dto.RideRequestDTO;




import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RideRequestService {

    @Autowired
    private final RideRequestRepository repository;

    @Autowired
    private final CustomerRepository customerRepository;

    @Autowired
    private final DriverRepository driverRepository;

    public RideRequestService(RideRequestRepository repository, CustomerRepository customerRepository, DriverRepository driverRepository) {
        this.repository = repository;
        this.customerRepository = customerRepository;
        this.driverRepository = driverRepository;
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
    public RideOfferDTO createRideOffer(Long rideRequestId, String driverUsername) {

        Optional<RideRequest> rideRequestOptional = repository.findById(rideRequestId);
        RideRequest rideRequest = rideRequestOptional.orElseThrow(() -> new NoSuchElementException("Ride request with id " + rideRequestId + " not found"));
        Customer customer = rideRequest.getCustomer();
        Optional<Driver> driverOptional = driverRepository.findByUsername(driverUsername);
        Driver driver = driverOptional.orElseThrow(() -> new NoSuchElementException("Driver with username " + driverUsername + " not found"));
        return new RideOfferDTO(driver.getTotalRides(), driver.getRating(), driver.getUsername(), customer.getUsername());
    }

    public RideOfferDTO acceptRideOffer(Long rideRequestId, String driverUsername) {
        Optional<RideRequest> rideRequestOptional = repository.findById(rideRequestId);
        RideRequest rideRequest = rideRequestOptional.orElseThrow(() -> new NoSuchElementException("Ride request with id " + rideRequestId + " not found"));
        Customer customer = rideRequest.getCustomer();
        Optional<Driver> driverOptional = driverRepository.findByUsername(driverUsername);
        Driver driver = driverOptional.orElseThrow(() -> new NoSuchElementException("Driver with username " + driverUsername + " not found"));
        if (driver.getActive())
            return new RideOfferDTO(driver.getTotalRides(), driver.getRating(), driver.getUsername(), customer.getUsername());
        else
            return null;
    }
    public void deleteRideOffer(Long rideRequestId, String driverUsername) {

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

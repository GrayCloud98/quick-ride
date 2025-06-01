package com.example.sep_drive_backend.services;

import com.example.sep_drive_backend.constants.VehicleClassEnum;
import com.example.sep_drive_backend.dto.RidesForDriversDTO;
import com.example.sep_drive_backend.dto.RideRequestDTO;
import com.example.sep_drive_backend.models.Customer;
import com.example.sep_drive_backend.models.RideRequest;
import com.example.sep_drive_backend.repository.CustomerRepository;
import com.example.sep_drive_backend.repository.RideRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RideRequestService {

    private final RideRequestRepository rideRequestRepository;
    private final CustomerRepository customerRepository;

    @Autowired
    public RideRequestService(RideRequestRepository rideRequestRepository, CustomerRepository customerRepository) {
        this.rideRequestRepository = rideRequestRepository;
        this.customerRepository = customerRepository;
    }

    public RideRequest createRideRequest(RideRequestDTO dto, String username) {
        Optional<Customer> customerOpt = customerRepository.findByUsername(username);

        if (!customerOpt.isPresent()) {
            throw new IllegalArgumentException("Customer not found");
        }

        Customer customer = customerOpt.get();

        if (customer.isActive()) {
            throw new IllegalStateException("Customer already has an active ride");
        }

        RideRequest rideRequest = new RideRequest();
        rideRequest.setCustomer(customer);
        rideRequest.setStartAddress(dto.getStartAddress());
        rideRequest.setStartLatitude(dto.getStartLatitude());
        rideRequest.setStartLongitude(dto.getStartLongitude());
        rideRequest.setDestinationAddress(dto.getDestinationAddress());
        rideRequest.setDestinationLatitude(dto.getDestinationLatitude());
        rideRequest.setDestinationLongitude(dto.getDestinationLongitude());
        rideRequest.setVehicleClass(dto.getVehicleClass());
        rideRequest.setStartLocationName(dto.getStartLocationName());
        rideRequest.setDestinationLocationName(dto.getDestinationLocationName());

        customer.setActive(true);
        customerRepository.save(customer);

        return rideRequestRepository.save(rideRequest);
    }

    public RideRequest getActiveRideRequestForCustomer(String username) {
        return rideRequestRepository.findByCustomerUsernameAndCustomerActiveTrue(username)
                .orElseThrow(() -> new NoSuchElementException("No active ride request for user: " + username));
    }

    public void deleteActiveRideRequest(String username) {
        RideRequest rideRequest = rideRequestRepository.findByCustomerUsernameAndCustomerActiveTrue(username)
                .orElseThrow(() -> new NoSuchElementException("No active ride request to delete for user: " + username));

        Customer customer = rideRequest.getCustomer();
        customer.setActive(false);
        customerRepository.save(customer);

        rideRequestRepository.delete(rideRequest);
    }

    public boolean hasActiveRideRequest(String username) {
        return rideRequestRepository.findByCustomerUsernameAndCustomerActiveTrue(username).isPresent();
    }

    public boolean isCustomer(String username) {
        return customerRepository.findByUsername(username).isPresent();
    }

    public List<RidesForDriversDTO> getAllRideRequests(double driverLat, double driverLon) {
        return rideRequestRepository.findAll()
                .stream()
                .map(ride -> {
                    double distance = calculateDistance(driverLat, driverLon,
                            ride.getStartLatitude(), ride.getStartLongitude());
                    return new RidesForDriversDTO(ride, distance);
                }).collect(Collectors.toList());
    }

    // Haversine formula to calculate distance in KM between two points
    private static final double EARTH_RADIUS_KM = 6371.0;

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) *
                        Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) *
                        Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }
}

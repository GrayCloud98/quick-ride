package com.example.sep_drive_backend.services;

import com.example.sep_drive_backend.models.Customer;
import com.example.sep_drive_backend.models.RideRequest;
import com.example.sep_drive_backend.repository.CustomerRepository;
import com.example.sep_drive_backend.repository.RideRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.example.sep_drive_backend.constants.VehicleClassEnum;
import com.example.sep_drive_backend.dto.RideRequestDTO;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class RideRequestService {

    @Autowired
    private final RideRequestRepository repository;

    @Autowired
    private final CustomerRepository customerRepository; // To find the customer by username


    public RideRequestService(RideRequestRepository repository, CustomerRepository customerRepository) {
        this.repository = repository;
        this.customerRepository = customerRepository;
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
    public boolean hasActiveRideRequest(String username) {
        return repository.findByCustomerUsernameAndCustomerActiveTrue(username).isPresent();
    }
    public boolean isCustomer(String username) {
        return customerRepository.findByUsername(username).isPresent();
    }
    public void deleteActiveRideRequest(String username) {
        RideRequest request = repository.findByCustomerUsernameAndCustomerActiveTrue(username)
                .orElseThrow(() -> new NoSuchElementException("No active ride request to delete"));

        Customer customer = request.getCustomer();
        customer.setActive(false);
        customerRepository.save(customer);
        repository.delete(request);
    }


//    public RideRequest createRideRequest(RideRequest request) {
//        // Only allow one active ride request per user
//        List<RideRequest> existingRequests = repository.findByUsernameAndActiveTrue(request.getUsername());
//        if (!existingRequests.isEmpty()) {
//            throw new IllegalStateException("You already have an active ride request.");
//        }

//        // Calculate route info
//        double[][] coordinates = buildCoordinatesArray(request);
//        Map<String, Object> routeInfo = fetchRouteInfo(coordinates);
//
//        double distanceKm = ((Number) ((Map<?, ?>) routeInfo.get("distance"))).doubleValue() / 1000.0;
//        double durationMin = ((Number) ((Map<?, ?>) routeInfo.get("duration"))).doubleValue() / 60.0;
//
//        // Save ride request
//        request.setDistanceKm(distanceKm);
//        request.setDurationMin(durationMin);
//        request.setActive(true);
//        request.setCreatedAt(LocalDateTime.now());
//
//        return repository.save(request);
//    }
//
//    private double[][] buildCoordinatesArray(RideRequest request) {
//        return new double[][]{
//                {request.getStartLongitude(), request.getStartLatitude()},
//                {request.getDestinationLongitude(), request.getDestinationLatitude()}
//        };
//    }
//
//    private Map<String, Object> fetchRouteInfo(double[][] coords) {
//        RestTemplate restTemplate = new RestTemplate();
//
//        Map<String, Object> body = Map.of("coordinates", coords);
//        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
//        headers.set("Authorization", API_KEY);
//        headers.set("Content-Type", "application/json");
//
//        var entity = new org.springframework.http.HttpEntity<>(body, headers);
//        var response = restTemplate.postForEntity(ROUTE_URL, entity, Map.class);
//
//        List<?> routes = (List<?>) response.getBody().get("routes");
//        return (Map<String, Object>) ((Map<?, ?>) routes.get(0)).get("summary");
//    }
//
//    public List<RideRequest> getAllRequests() {
//        return repository.findAll();
//    }
//


}

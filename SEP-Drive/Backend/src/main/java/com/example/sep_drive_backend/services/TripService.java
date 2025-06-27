package com.example.sep_drive_backend.services;

import com.example.sep_drive_backend.constants.TripsStatus;
import com.example.sep_drive_backend.dto.TripeDTO;
import com.example.sep_drive_backend.dto.TripCompleteRequest;
import com.example.sep_drive_backend.models.Trips;
import com.example.sep_drive_backend.models.User;
import com.example.sep_drive_backend.repository.TripRepository;
import com.example.sep_drive_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TripService {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private UserRepository userRepository;


    public List<TripeDTO> getTripHistoryForUser(String username) {
        List<Trips> trips = tripRepository.findCompletedTripsByUser(username);

        return trips.stream().map(trip -> {
            TripeDTO dto = new TripeDTO();
            dto.setTripId(trip.getId());
            dto.setEndTime(trip.getEndTime());
            dto.setDistanceKm(trip.getDistanceKm());
            dto.setDurationMin(trip.getDurationMin());
            dto.setPriceEuro(trip.getPriceEuro());
            dto.setCustomerRating(trip.getCustomerRating());
            dto.setDriverRating(trip.getDriverRating());
            dto.setCustomerFullName(trip.getCustomerFullName());
            dto.setDriverFullName(trip.getDriverFullName());
            dto.setCustomerUsername(trip.getCustomerUsername());
            dto.setDriverUsername(trip.getDriverUsername());


            return dto;
        }).collect(Collectors.toList());
    }


    public void completeTrip(TripCompleteRequest request) {

        User customer = userRepository.findByUsername(request.getCustomerUsername())
                .orElseThrow(() -> new IllegalArgumentException("Kunde nicht gefunden: " + request.getCustomerUsername()));

        User driver = userRepository.findByUsername(request.getDriverUsername())
                .orElseThrow(() -> new IllegalArgumentException("Fahrer nicht gefunden: " + request.getDriverUsername()));


        if (customer == null || driver == null) {
            throw new IllegalArgumentException("Benutzer nicht gefunden.");
        }

        Trips trip = new Trips();
        trip.setStatus(TripsStatus.COMPLETED);
        trip.setEndTime(LocalDateTime.now());
        trip.setDistanceKm(request.getDistanceKm());
        trip.setDurationMin(request.getDurationMin());
        trip.setPriceEuro(request.getPriceEuro());
        trip.setCustomerRating(request.getCustomerRating());
        trip.setDriverRating(request.getDriverRating());
        trip.setCustomer(customer);
        trip.setDriver(driver);

        tripRepository.save(trip);
    }


}
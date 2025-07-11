package com.example.sep_drive_backend.services;

import com.example.sep_drive_backend.dto.LeaderboardEntryDTO;
import com.example.sep_drive_backend.models.Driver;
import com.example.sep_drive_backend.models.Trips;
import com.example.sep_drive_backend.repository.TripRepository;
import com.example.sep_drive_backend.repository.DriverRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class LeaderboardService {

    private final DriverRepository driverRepository;
    private final TripRepository tripRepository;

    public LeaderboardService(DriverRepository driverRepository, TripRepository tripRepository) {
        this.driverRepository = driverRepository;
        this.tripRepository = tripRepository;
    }

    public List<LeaderboardEntryDTO> getLeaderboard() {
        List<Driver> drivers = driverRepository.findAll();

        return drivers.stream().map(driver -> {
            List<Trips> driverTrips = tripRepository.findByDriverUsername(driver.getUsername());

            double totalDistance = driverTrips.stream().mapToDouble(Trips::getDistanceKm).sum();
            double totalEarnings = driverTrips.stream().mapToDouble(Trips::getPriceEuro).sum();
            long totalDuration = driverTrips.stream().mapToLong(trip -> (long) trip.getDurationMin()).sum();
            int tripCount = driverTrips.size();

            double averageRating = driverTrips.stream()
                    .mapToInt(Trips::getDriverRating)
                    .average()
                    .orElse(0.0);

            LeaderboardEntryDTO dto = new LeaderboardEntryDTO();
            dto.setUsername(driver.getUsername());
            dto.setFullName(driver.getFirstName() + " " + driver.getLastName());
            dto.setTotalDistanceDriven(totalDistance);
            dto.setMoneyEarned(totalEarnings);
            dto.setTotalDriveTime(totalDuration);
            dto.setNumberOfRides(tripCount);
            dto.setAverageRating(averageRating);

            return dto;
        }).collect(Collectors.toList());
    }

}
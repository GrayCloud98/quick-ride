package com.example.sep_drive_backend.services;

import com.example.sep_drive_backend.constants.TransactionType;
import com.example.sep_drive_backend.dto.DriverDailyStatsDto;
import com.example.sep_drive_backend.dto.DriverStatsDto;
import com.example.sep_drive_backend.models.Driver;
import com.example.sep_drive_backend.models.RideRequest;
import com.example.sep_drive_backend.models.Transaction;
import com.example.sep_drive_backend.models.Wallet;
import com.example.sep_drive_backend.repository.DriverRepository;
import com.example.sep_drive_backend.repository.RideRequestRepository;
import com.example.sep_drive_backend.repository.RideSimulationRepository;
import com.example.sep_drive_backend.repository.TransactionRepository;
import io.jsonwebtoken.lang.Collections;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DriverService {

    private final DriverRepository driverRepository;
    private final RideRequestRepository rideRequestRepository;
    private final TransactionRepository transactionRepository;
    private final RideSimulationRepository rideSimulationRepository;
    @Autowired
    public DriverService(DriverRepository driverRepository, RideRequestRepository rideRequestRepository, TransactionRepository transactionRepository, RideSimulationRepository rideSimulationRepository) {
        this.driverRepository = driverRepository;
        this.rideRequestRepository = rideRequestRepository;
        this.transactionRepository = transactionRepository;
        this.rideSimulationRepository = rideSimulationRepository;
    }

    public List<DriverStatsDto> getDriverMonthlyStatsForAYear(String username, int year) {
        List<Object[]> rawResults = rideSimulationRepository.getRawMonthlyStats(username, year);

        return rawResults.stream()
                .map(row -> new DriverStatsDto(
                        ((Number) row[0]),
                        (Number) row[1],
                        (Number) row[2],
                        (Number) row[3],
                        (Number) row[4]
                ))
                .collect(Collectors.toList());
    }

    public List<DriverDailyStatsDto> getDriverDailyStatsForMonth(String username, int year, int month) {
        List<Object[]> rawResults = rideSimulationRepository.getDailyStatsForDriverAndMonth(username, year, month);

        return rawResults.stream()
                .map(row -> new DriverDailyStatsDto(
                        (Number) row[0],
                        (Number) row[1],
                        (Number) row[2],
                        (Number) row[3],
                        (Number) row[4]
                ))
                .collect(Collectors.toList());
    }


}
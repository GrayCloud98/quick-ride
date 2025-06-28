package com.example.sep_drive_backend.services;

import com.example.sep_drive_backend.constants.TransactionType;
import com.example.sep_drive_backend.dto.DriverStatsDto;
import com.example.sep_drive_backend.models.Driver;
import com.example.sep_drive_backend.models.RideRequest;
import com.example.sep_drive_backend.models.Transaction;
import com.example.sep_drive_backend.models.Wallet;
import com.example.sep_drive_backend.repository.DriverRepository;
import com.example.sep_drive_backend.repository.RideRequestRepository;
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

    @Autowired
    public DriverService(DriverRepository driverRepository, RideRequestRepository rideRequestRepository, TransactionRepository transactionRepository) {
        this.driverRepository = driverRepository;
        this.rideRequestRepository = rideRequestRepository;
        this.transactionRepository = transactionRepository;
    }

    public DriverStatsDto getDriverMonthlyStatsForAYear(String userName, int year) {
        List<RideRequest> rides = rideRequestRepository.findCompletedRidesByDriverAndYear(userName, year);
        DriverStatsDto dto = new DriverStatsDto();
        Map<Integer, List<RideRequest>> grouped = rides.stream()
                .collect(Collectors.groupingBy(r -> r.getEndedAt().getMonthValue()));

        List<Double> distances = new ArrayList<>();
        List<Double> durations = new ArrayList<>();

        for (int month = 1; month <= 12; month++) {
            List<RideRequest> monthlyRides = grouped.getOrDefault(month, Collections.emptyList());

            double totalDistance = monthlyRides.stream().mapToDouble(r -> r.getDistance() != null ? r.getDistance() : 0.0).sum();
            double totalDuration = monthlyRides.stream().mapToDouble(RideRequest::getDuration).sum();

            distances.add(totalDistance);
            durations.add(totalDuration);
        }
        Optional<Driver> driver = driverRepository.findByUsername(userName);
        if (driver.isPresent()) {
            Wallet wallet = driver.get().getWallet();
            Instant startOfYear = LocalDate.of(year, 1, 1).atStartOfDay(ZoneId.systemDefault()).toInstant();
            Instant endOfYear = LocalDate.of(year, 12, 31).atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant();
            List<Transaction> transactions = transactionRepository
                    .findByWalletIdAndTypeAndCreatedAtBetween(wallet.getId(), TransactionType.PAYMENT_IN, startOfYear, endOfYear);

            Map<Integer, Long> earningsPerMonth = transactions.stream()
                    .collect(Collectors.groupingBy(
                            t -> LocalDateTime.ofInstant(t.getCreatedAt(), ZoneId.systemDefault()).getMonthValue(),
                            Collectors.summingLong(Transaction::getAmountCents)
                    ));

            List<Double> earnings = new ArrayList<>();
            for (int month = 1; month <= 12; month++) {
                long cents = earningsPerMonth.getOrDefault(month, 0L);
                earnings.add(cents / 100.0);
                dto.setEarnings(earnings);
            }
            dto.setTotalTravelledDistance(distances);
            dto.setTotalTravelledTime(durations);

            List<Integer> monthlyRatings = new ArrayList<>();

            for (int month = 1; month <= 12; month++) {
                List<RideRequest> monthlyRides = grouped.getOrDefault(month, Collections.emptyList());

                double averageRating = monthlyRides.stream()
                        .mapToInt(RideRequest::getDriverRating)
                        .average()
                        .orElse(0.0);

                monthlyRatings.add((int) Math.round(averageRating));
            }

            dto.setRating(monthlyRatings);

        }
        return dto;

    }
}
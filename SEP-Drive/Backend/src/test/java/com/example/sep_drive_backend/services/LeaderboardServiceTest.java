package com.example.sep_drive_backend.services;

import com.example.sep_drive_backend.dto.LeaderboardEntryDTO;
import com.example.sep_drive_backend.models.Driver;
import com.example.sep_drive_backend.models.Trips;
import com.example.sep_drive_backend.repository.DriverRepository;
import com.example.sep_drive_backend.repository.TripRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Arrays;
import java.util.List;

class LeaderboardServiceTest {

    private DriverRepository driverRepository;
    private TripRepository tripRepository;
    private LeaderboardService leaderboardService;

    @BeforeEach
    void setUp() {
        driverRepository = mock(DriverRepository.class);
        tripRepository = mock(TripRepository.class);
        leaderboardService = new LeaderboardService(driverRepository, tripRepository);
    }

    @Test
    void testGetLeaderboard() {

        Driver driver1 = new Driver();
        driver1.setUsername("driver1");
        driver1.setFirstName("Alice");
        driver1.setLastName("Anderson");

        Driver driver2 = new Driver();
        driver2.setUsername("driver2");
        driver2.setFirstName("Bob");
        driver2.setLastName("Brown");

        Trips trip1 = new Trips();
        trip1.setDistanceKm(10.5);
        trip1.setPriceEuro(25.0);
        trip1.setDurationMin(30);
        trip1.setDriverRating(4);

        Trips trip2 = new Trips();
        trip2.setDistanceKm(5.0);
        trip2.setPriceEuro(10.0);
        trip2.setDurationMin(15);
        trip2.setDriverRating(5);

        Trips trip3 = new Trips();
        trip3.setDistanceKm(20.0);
        trip3.setPriceEuro(40.0);
        trip3.setDurationMin(45);
        trip3.setDriverRating(3);

        when(driverRepository.findAll()).thenReturn(Arrays.asList(driver1, driver2));
        when(tripRepository.findByDriverUsername("driver1")).thenReturn(Arrays.asList(trip1, trip2));
        when(tripRepository.findByDriverUsername("driver2")).thenReturn(List.of(trip3));


        List<LeaderboardEntryDTO> leaderboard = leaderboardService.getLeaderboard();


        assertEquals(2, leaderboard.size());

        LeaderboardEntryDTO entry1 = leaderboard.stream()
                .filter(e -> e.getUsername().equals("driver1"))
                .findFirst().orElse(null);

        assertNotNull(entry1);
        assertEquals("Alice Anderson", entry1.getFullName());
        assertEquals(15.5, entry1.getTotalDistanceDriven(), 0.01);
        assertEquals(35.0, entry1.getMoneyEarned(), 0.01);
        assertEquals(45L, entry1.getTotalDriveTime());
        assertEquals(2, entry1.getNumberOfRides());
        assertEquals(4.5, entry1.getAverageRating(), 0.01);

        LeaderboardEntryDTO entry2 = leaderboard.stream()
                .filter(e -> e.getUsername().equals("driver2"))
                .findFirst().orElse(null);

        assertNotNull(entry2);
        assertEquals("Bob Brown", entry2.getFullName());
        assertEquals(20.0, entry2.getTotalDistanceDriven(), 0.01);
        assertEquals(40.0, entry2.getMoneyEarned(), 0.01);
        assertEquals(45L, entry2.getTotalDriveTime());
        assertEquals(1, entry2.getNumberOfRides());
        assertEquals(3.0, entry2.getAverageRating(), 0.01);
    }
}

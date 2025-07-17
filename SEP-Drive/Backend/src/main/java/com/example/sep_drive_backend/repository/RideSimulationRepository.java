package com.example.sep_drive_backend.repository;

import com.example.sep_drive_backend.constants.RideStatus;
import com.example.sep_drive_backend.dto.DriverStatsDto;
import com.example.sep_drive_backend.models.RideSimulation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RideSimulationRepository extends JpaRepository<RideSimulation, Long> {



    @Query("SELECT FUNCTION('MONTH', r.endedAt), " +
            "SUM(rr.distance), " +
            "SUM(rr.estimatedPrice), " +
            "AVG(rr.driverRating), " +
            "SUM(rr.duration) " +
            "FROM RideSimulation r " +
            "JOIN r.rideOffer ro " +
            "JOIN ro.rideRequest rr " +
            "WHERE r.driver.username = :username " +
            "AND r.rideStatus = 'COMPLETED' " +
            "AND FUNCTION('YEAR', r.endedAt) = :year " +
            "GROUP BY FUNCTION('MONTH', r.endedAt) " +
            "ORDER BY FUNCTION('MONTH', r.endedAt)")
    List<Object[]> getRawMonthlyStats(@Param("username") String username, @Param("year") int year);

    @Query("SELECT FUNCTION('DAY', r.endedAt), " +
            "SUM(rr.distance), " +
            "SUM(rr.estimatedPrice), " +
            "AVG(rr.driverRating), " +
            "SUM(rr.duration) " +
            "FROM RideSimulation r " +
            "JOIN r.rideOffer ro " +
            "JOIN ro.rideRequest rr " +
            "WHERE r.driver.username = :username " +
            "AND r.rideStatus = 'COMPLETED' " +
            "AND FUNCTION('YEAR', r.endedAt) = :year " +
            "AND FUNCTION('MONTH', r.endedAt) = :month " +
            "GROUP BY FUNCTION('DAY', r.endedAt) " +
            "ORDER BY FUNCTION('DAY', r.endedAt)")
    List<Object[]> getDailyStatsForDriverAndMonth(
            @Param("username") String username,
            @Param("year") int year,
            @Param("month") int month
    );

    Optional<RideSimulation> findFirstByCustomerUsernameAndRideStatusIn(String username, List<RideStatus> statuses);
    Optional<RideSimulation> findFirstByDriverUsernameAndRideStatusIn(String username, List<RideStatus> statuses);

    boolean existsByCustomerUsernameAndRideStatusIsOrCustomerUsernameAndRideStatusIs(
            String username1, RideStatus status1,
            String username2, RideStatus status2
    );

    boolean existsByDriverUsernameAndRideStatusIsOrDriverUsernameAndRideStatusIs(
            String username1, RideStatus status1,
            String username2, RideStatus status2
    );

    // here
    @Query("SELECT sim FROM RideSimulation sim " +
            "JOIN FETCH sim.rideOffer ro " +
            "JOIN FETCH ro.rideRequest rr " +
            "LEFT JOIN FETCH rr.waypoints " +
            "WHERE sim.id = :id")
    Optional<RideSimulation> findWithWaypointsById(@Param("id") Long id);


}

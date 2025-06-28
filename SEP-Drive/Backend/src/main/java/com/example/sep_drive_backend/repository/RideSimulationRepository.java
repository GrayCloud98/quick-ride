package com.example.sep_drive_backend.repository;

import com.example.sep_drive_backend.constants.RideStatus;
import com.example.sep_drive_backend.models.RideSimulation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RideSimulationRepository extends JpaRepository<RideSimulation, Long> {


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

    @Query("SELECT sim FROM RideSimulation sim " +
            "JOIN FETCH sim.rideOffer ro " +
            "JOIN FETCH ro.rideRequest rr " +
            "LEFT JOIN FETCH rr.waypoints " +
            "WHERE sim.id = :id")
    Optional<RideSimulation> findWithWaypointsById(@Param("id") Long id);


}

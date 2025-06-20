package com.example.sep_drive_backend.repository;

import com.example.sep_drive_backend.constants.RideStatus;
import com.example.sep_drive_backend.models.RideSimulation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RideSimulationRepository extends JpaRepository<RideSimulation, Long> {

    @Query("SELECT rs.id FROM RideSimulation rs WHERE rs.customer.username = :username AND rs.rideStatus = com.example.sep_drive_backend.constants.RideStatus.CREATED")
    Optional<Long> findCurrentCreatedSimulationIdByCustomerUsername(@Param("username") String username);

    @Query("SELECT rs.id FROM RideSimulation rs WHERE rs.driver.username = :username AND rs.rideStatus = com.example.sep_drive_backend.constants.RideStatus.CREATED")
    Optional<Long> findCurrentCreatedSimulationIdByDriverUsername(@Param("username") String username);

    Optional<Long> findFirstIdByCustomerUsernameAndRideStatusIn(String username, List<RideStatus> statuses);

    Optional<Long> findFirstIdByDriverUsernameAndRideStatusIn(String username, List<RideStatus> statuses);

    boolean existsByCustomerUsernameAndRideStatusIsOrCustomerUsernameAndRideStatusIs(
            String username1, RideStatus status1,
            String username2, RideStatus status2
    );

    boolean existsByDriverUsernameAndRideStatusIsOrDriverUsernameAndRideStatusIs(
            String username1, RideStatus status1,
            String username2, RideStatus status2
    );

}

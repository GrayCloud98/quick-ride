package com.example.sep_drive_backend.repository;

import com.example.sep_drive_backend.constants.RideStatus;
import com.example.sep_drive_backend.models.RideRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RideRequestRepository extends JpaRepository<RideRequest, Long> {


    List<RideRequest> findByCustomerUsernameAndRideStatus(String username, RideStatus status);
    boolean existsByCustomerUsernameAndRideStatusIn(String username, List<RideStatus> statuses);
    Optional<RideRequest> findFirstByCustomerUsernameAndRideStatus(String username, RideStatus status);
    List<RideRequest> findAllByRideStatus(RideStatus status);

    @Query("""
    SELECT r FROM RideRequest r 
    WHERE r.customer.username = :username 
    AND r.rideStatus = :status
""")
    Optional<RideRequest> findByCustomerUsernameAndRideStatusCustom(
            @Param("username") String username,
            @Param("status") RideStatus status
    );


}

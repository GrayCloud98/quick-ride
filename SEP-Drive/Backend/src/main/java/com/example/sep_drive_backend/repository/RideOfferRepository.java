package com.example.sep_drive_backend.repository;

import com.example.sep_drive_backend.constants.RideStatus;
import com.example.sep_drive_backend.models.Driver;
import com.example.sep_drive_backend.models.RideOffer;
import com.example.sep_drive_backend.models.RideRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RideOfferRepository extends JpaRepository<RideOffer, Long> {

    Optional<RideOffer> findByDriver(Driver driver);
    List<RideOffer> findAllByRideRequest(RideRequest rideRequest);
    List<RideOffer> findByDriverUsernameAndRideStatus(String username, RideStatus status);
    Optional<RideOffer> findByRideRequestId(Long rideRequestId);
    Optional<RideOffer> findFirstByDriverAndRideStatus(Driver driver, RideStatus rideStatus);
    @Query("SELECT CASE WHEN COUNT(ro) > 0 THEN true ELSE false END " +
            "FROM RideOffer ro " +
            "WHERE ro.driver.username = :driverUsername " +
            "AND ro.rideRequest.customer.username = :customerUsername " +
            "AND ro.rideStatus = 'CREATED'")
    boolean existsByDriverUsernameAndCustomerUsername(@Param("driverUsername") String driverUsername,
                                                      @Param("customerUsername") String customerUsername);
    Optional<RideOffer> findFirstByDriverAndRideStatusIn(Driver driver, List<RideStatus> rideStatuses);




}

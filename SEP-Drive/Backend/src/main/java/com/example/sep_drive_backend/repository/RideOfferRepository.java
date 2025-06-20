package com.example.sep_drive_backend.repository;

import com.example.sep_drive_backend.constants.RideStatus;
import com.example.sep_drive_backend.models.Driver;
import com.example.sep_drive_backend.models.RideOffer;
import com.example.sep_drive_backend.models.RideRequest;
import org.springframework.data.jpa.repository.JpaRepository;
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



}

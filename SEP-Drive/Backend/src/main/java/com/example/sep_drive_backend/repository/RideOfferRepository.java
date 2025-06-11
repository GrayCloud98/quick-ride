package com.example.sep_drive_backend.repository;

import com.example.sep_drive_backend.models.Driver;
import com.example.sep_drive_backend.models.RideOffer;
import com.example.sep_drive_backend.models.RideRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RideOfferRepository extends JpaRepository<RideOffer, Long> {

    Optional<RideOffer> findByRideRequest(RideRequest rideRequest);
    Optional<RideOffer> findByDriver(Driver driver);
    List<RideOffer> findAllByRideRequest(RideRequest rideRequest);

}

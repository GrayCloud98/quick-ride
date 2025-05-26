package com.example.sep_drive_backend.repository;

import com.example.sep_drive_backend.models.RideOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RideOfferRepository extends JpaRepository<RideOffer, Long> {


}

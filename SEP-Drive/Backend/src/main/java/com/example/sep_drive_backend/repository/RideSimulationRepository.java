package com.example.sep_drive_backend.repository;

import com.example.sep_drive_backend.models.RideOffer;
import com.example.sep_drive_backend.models.RideSimulation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RideSimulationRepository extends JpaRepository<RideSimulation, Long> {
}

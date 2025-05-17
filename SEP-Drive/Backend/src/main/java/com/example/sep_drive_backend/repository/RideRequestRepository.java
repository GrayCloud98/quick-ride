package com.example.sep_drive_backend.repository;

import com.example.sep_drive_backend.models.RideRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RideRequestRepository extends JpaRepository<RideRequest, Long> {

    Optional<RideRequest> findByCustomerUsernameAndCustomerActiveTrue(String username);

}

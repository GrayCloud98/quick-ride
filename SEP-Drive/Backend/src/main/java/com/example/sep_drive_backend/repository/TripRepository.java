package com.example.sep_drive_backend.repository;

import com.example.sep_drive_backend.models.Trips;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TripRepository
        extends JpaRepository<Trips, Long> {


    @Query("SELECT t FROM Trips t " +
            "WHERE t.status = 'COMPLETED' " +
            "AND (t.customer.username = :username OR t.driver.username = :username)")
    List<Trips> findCompletedTripsByUser(@Param("username") String username);


    List<Trips> findByDriverUsername(String username);


}
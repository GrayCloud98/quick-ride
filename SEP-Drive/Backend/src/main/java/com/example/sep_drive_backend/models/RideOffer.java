package com.example.sep_drive_backend.models;

import jakarta.persistence.*;

@Entity
public class RideOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "driver_username", referencedColumnName = "username", nullable = false)
    private Driver driver;
    @ManyToOne
    @JoinColumn(name = "ride_request_id", referencedColumnName = "id", nullable = false)
    private RideRequest rideRequest;

    public RideOffer() {}
    public RideOffer(Long id, Driver driver, RideRequest rideRequest) {
        this.id = id;
        this.driver = driver;
        this.rideRequest = rideRequest;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Driver getDriver() {
        return driver;
    }

    public void setDriver(Driver driver) {
        this.driver = driver;
    }

    public RideRequest getRideRequest() {
        return rideRequest;
    }

    public void setRideRequest(RideRequest rideRequest) {
        this.rideRequest = rideRequest;
    }
}

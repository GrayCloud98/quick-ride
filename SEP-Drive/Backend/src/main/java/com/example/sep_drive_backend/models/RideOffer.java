package com.example.sep_drive_backend.models;

import com.example.sep_drive_backend.constants.RideStatus;
import jakarta.persistence.*;

@Entity
public class RideOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "driver_username", referencedColumnName = "username", nullable = false)
    private Driver driver;
    @ManyToOne
    @JoinColumn(name = "ride_request_id", referencedColumnName = "id", nullable = false)
    private RideRequest rideRequest;

    @Column
    @Enumerated(EnumType.STRING)
    private RideStatus rideStatus;

    public RideOffer() {
    }



    public RideStatus getRideStatus() {
        return rideStatus;
    }

    public void setRideStatus(RideStatus rideStatus) {
        this.rideStatus = rideStatus;
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

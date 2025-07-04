package com.example.sep_drive_backend.dto;

import com.example.sep_drive_backend.constants.VehicleClassEnum;

public class RideOfferNotification {
    private String driverName;
    private double driverRating;
    private int totalRides;
    private Double totalTravelledDistance;
    private String message;
    private Long rideOfferId;
    private VehicleClassEnum vehicleClass;
    private String driverUsername;


    public VehicleClassEnum getVehicleClass() {
        return vehicleClass;
    }

    public void setVehicleClass(VehicleClassEnum vehicleClass) {
        this.vehicleClass = vehicleClass;
    }

    public RideOfferNotification() {}

    public Long getRideOfferId() {
        return rideOfferId;
    }

    public void setRideOfferId(Long rideOfferId) {
        this.rideOfferId = rideOfferId;
    }

    public String getDriverName() {
        return driverName;
    }

    public void setDriverName(String driverName) {
        this.driverName = driverName;
    }

    public double getDriverRating() {
        return driverRating;
    }

    public void setDriverRating(double driverRating) {
        this.driverRating = driverRating;
    }

    public int getTotalRides() {
        return totalRides;
    }

    public void setTotalRides(int totalRides) {
        this.totalRides = totalRides;
    }

    public double getTotalTravelledDistance() {
        return totalTravelledDistance;
    }

    public void setTotalTravelledDistance(double totalTravelledDistance) {
        this.totalTravelledDistance = totalTravelledDistance;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }


    public String getDriverUsername() {
        return driverUsername;
    }

    public void setDriverUsername(String driverUsername) {
        this.driverUsername = driverUsername;
    }

}

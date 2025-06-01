package com.example.sep_drive_backend.dto;

public class RideOfferNotification {
    private String driverUsername;
    private double driverRating;
    private int totalRides;
    private double totalDistance;
    private String message;

    public String getDriverUsername() {
        return driverUsername;
    }

    public void setDriverUsername(String driverUsername) {
        this.driverUsername = driverUsername;
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

    public double getTotalDistance() {
        return totalDistance;
    }

    public void setTotalDistance(double totalDistance) {
        this.totalDistance = totalDistance;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}

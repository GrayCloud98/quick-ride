package com.example.sep_drive_backend.dto;

import com.example.sep_drive_backend.constants.TripsStatus;

import java.time.LocalDateTime;

public class TripeDTO {
    private TripsStatus status;
    private Long tripId;
    private LocalDateTime endTime;
    private double distanceKm;
    private double durationMin;
    private double priceEuro;
    private int customerRating;
    private int driverRating;
    private String customerUsername;
    private String customerFullName;
    private String driverUsername;
    private String driverFullName;

    public TripeDTO(Long tripId, LocalDateTime endTime, double distanceKm, double durationMinutes, double priceEuro, int customerRating, int driverRating, String customerUsername, String customerFullName, String driverUsername, String driverFullName) {
        this.tripId = tripId;
        this.endTime = endTime;
        this.distanceKm = distanceKm;
        this.durationMin = durationMin;
        this.priceEuro = priceEuro;
        this.customerRating = 0;
        this.driverRating = 0;
        this.customerUsername = customerUsername;
        this.customerFullName = customerFullName;
        this.driverUsername = driverUsername;
        this.driverFullName = driverFullName;
    }

    public TripeDTO() {

    }

    public Long getTripId() {
        return tripId;
    }

    public void setTripId(Long tripId) {
        this.tripId = tripId;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(double distanceKm) {
        this.distanceKm = distanceKm;
    }

    public double getDurationMin() {
        return durationMin;
    }

    public void setDurationMin(double durationMin) {
        this.durationMin = durationMin;
    }

    public double getPriceEuro() {
        return priceEuro;
    }

    public void setPriceEuro(double priceEuro) {
        this.priceEuro = priceEuro;
    }

    public int getCustomerRating() {
        return customerRating;
    }

    public void setCustomerRating(int customerRating) {
        this.customerRating = customerRating;
    }

    public int getDriverRating() {
        return driverRating;
    }

    public void setDriverRating(int driverRating) {
        this.driverRating = driverRating;
    }

    public String getCustomerUsername() {
        return customerUsername;
    }

    public void setCustomerUsername(String customerUsername) {
        this.customerUsername = customerUsername;
    }

    public String getCustomerFullName() {
        return customerFullName;
    }

    public void setCustomerFullName(String customerFullName) {
        this.customerFullName = customerFullName;
    }

    public String getDriverUsername() {
        return driverUsername;
    }

    public void setDriverUsername(String driverUsername) {
        this.driverUsername = driverUsername;
    }

    public String getDriverFullName() {
        return driverFullName;
    }

    public void setDriverFullName(String driverFullName) {
        this.driverFullName = driverFullName;
    }

}
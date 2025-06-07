package com.example.sep_drive_backend.dto;

public class RideOfferDTO {
    private int totatlRides;
    private float rating;
    private String driverUserName;
    private String customerUserName;
    public RideOfferDTO(int totalRides, float rating, String driverUserName, String customerUserName) {
        this.totatlRides = totalRides;
        this.rating = rating;
        this.driverUserName = driverUserName;
        this.customerUserName = customerUserName;
    }
}

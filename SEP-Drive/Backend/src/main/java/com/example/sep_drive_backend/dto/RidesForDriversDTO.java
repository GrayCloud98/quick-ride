package com.example.sep_drive_backend.dto;

import com.example.sep_drive_backend.constants.VehicleClassEnum;
import com.example.sep_drive_backend.models.RideRequest;

import java.time.LocalDateTime;

public class RidesForDriversDTO {

    private Long id;
    private LocalDateTime createdAt;
    private String customerName;
    private float customerRating;
    private VehicleClassEnum requestedVehicleClass;
    private Double distanceFromDriver;


    public RidesForDriversDTO(RideRequest rideRequest, double distanceFromDriver) {
        this.id = rideRequest.getId();
        this.createdAt = rideRequest.getCreatedAt();
        this.customerName = rideRequest.getCustomer().getFirstName()+ " " + rideRequest.getCustomer().getLastName();
        this.customerRating = rideRequest.getCustomer().getRating();
        this.requestedVehicleClass = rideRequest.getVehicleClass();
        this.distanceFromDriver = distanceFromDriver;
    }

    public Double getDistanceFromDriver() {
        return distanceFromDriver;
    }

    public void setDistanceFromDriver(Double distanceFromDriver) {
        this.distanceFromDriver = distanceFromDriver;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public float getCustomerRating() {
        return customerRating;
    }

    public void setCustomerRating(float customerRating) {
        this.customerRating = customerRating;
    }

    public VehicleClassEnum getRequestedVehicleClass() {
        return requestedVehicleClass;
    }

    public void setRequestedVehicleClass(VehicleClassEnum requestedVehicleClass) {
        this.requestedVehicleClass = requestedVehicleClass;
    }
}

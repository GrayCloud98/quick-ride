package com.example.sep_drive_backend.dto;

import com.example.sep_drive_backend.constants.VehicleClassEnum;
import com.example.sep_drive_backend.models.RideRequest;

import java.time.LocalDateTime;
import java.util.Objects;

public class RidesForDriversDTO {

    private Long id;
    private LocalDateTime createdAt;
    private String customerName;
    private float customerRating;
    private String startLocationName;
    private String DestinationLocationName;
    private String startAddress;
    private String destinationAddress;
    private Double startLatitude;
    private Double startLongitude;
    private Double destinationLatitude;
    private Double destinationLongitude;
    private VehicleClassEnum requestedVehicleClass;
    private Double distanceFromDriver;


    public RidesForDriversDTO(RideRequest rideRequest, double distanceFromDriver) {
        if (Objects.equals(rideRequest.getStartLocationName(), "My Location")) {
            this.startLocationName = "Customer's Location";
        }
        else{
            this.startLocationName = rideRequest.getStartLocationName();
        }
        this.id = rideRequest.getId();
        this.createdAt = rideRequest.getCreatedAt();
        this.customerName = rideRequest.getCustomer().getFirstName()+ " " + rideRequest.getCustomer().getLastName();
        this.customerRating = rideRequest.getCustomer().getRating();
        this.requestedVehicleClass = rideRequest.getVehicleClass();
        this.DestinationLocationName = rideRequest.getDestinationLocationName();
        this.startAddress = rideRequest.getStartAddress();
        this.destinationAddress = rideRequest.getDestinationAddress();
        this.startLatitude = rideRequest.getStartLatitude();
        this.startLongitude = rideRequest.getStartLongitude();
        this.destinationLatitude = rideRequest.getDestinationLatitude();
        this.destinationLongitude = rideRequest.getDestinationLongitude();
        this.distanceFromDriver = distanceFromDriver;
    }


    public String getStartLocationName() {
        return startLocationName;
    }

    public void setStartLocationName(String startLocationName) {
        this.startLocationName = startLocationName;
    }

    public String getDestinationLocationName() {
        return DestinationLocationName;
    }

    public void setDestinationLocationName(String destinationLocationName) {
        DestinationLocationName = destinationLocationName;
    }

    public String getStartAddress() {
        return startAddress;
    }

    public void setStartAddress(String startAddress) {
        this.startAddress = startAddress;
    }

    public String getDestinationAddress() {
        return destinationAddress;
    }

    public void setDestinationAddress(String destinationAddress) {
        this.destinationAddress = destinationAddress;
    }

    public Double getStartLatitude() {
        return startLatitude;
    }

    public void setStartLatitude(Double startLatitude) {
        this.startLatitude = startLatitude;
    }

    public Double getStartLongitude() {
        return startLongitude;
    }

    public void setStartLongitude(Double startLongitude) {
        this.startLongitude = startLongitude;
    }

    public Double getDestinationLatitude() {
        return destinationLatitude;
    }

    public void setDestinationLatitude(Double destinationLatitude) {
        this.destinationLatitude = destinationLatitude;
    }

    public Double getDestinationLongitude() {
        return destinationLongitude;
    }

    public void setDestinationLongitude(Double destinationLongitude) {
        this.destinationLongitude = destinationLongitude;
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

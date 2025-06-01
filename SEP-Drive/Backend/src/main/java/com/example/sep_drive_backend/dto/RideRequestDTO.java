package com.example.sep_drive_backend.dto;

import com.example.sep_drive_backend.constants.VehicleClassEnum;
import com.example.sep_drive_backend.models.RideRequest;

public class RideRequestDTO {

    private String startLocationName;
    private String destinationLocationName;

    private String startAddress;
    private Double startLatitude;
    private Double startLongitude;

    private String destinationAddress;
    private Double destinationLatitude;
    private Double destinationLongitude;

    private VehicleClassEnum vehicleClass;

    public RideRequestDTO() {}

    // Create DTO from entity (no username included here)
    public RideRequestDTO(RideRequest request) {
        this.startAddress = request.getStartAddress();
        this.destinationAddress = request.getDestinationAddress();
        this.startLatitude = request.getStartLatitude();
        this.startLongitude = request.getStartLongitude();
        this.destinationLatitude = request.getDestinationLatitude();
        this.destinationLongitude = request.getDestinationLongitude();
        this.vehicleClass = request.getVehicleClass();
        this.startLocationName = request.getStartLocationName();
        this.destinationLocationName = request.getDestinationLocationName();
    }

    // Getters and setters

    public String getStartLocationName() {
        return startLocationName;
    }

    public void setStartLocationName(String startLocationName) {
        this.startLocationName = startLocationName;
    }

    public String getDestinationLocationName() {
        return destinationLocationName;
    }

    public void setDestinationLocationName(String destinationLocationName) {
        this.destinationLocationName = destinationLocationName;
    }

    public String getStartAddress() {
        return startAddress;
    }

    public void setStartAddress(String startAddress) {
        this.startAddress = startAddress;
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

    public String getDestinationAddress() {
        return destinationAddress;
    }

    public void setDestinationAddress(String destinationAddress) {
        this.destinationAddress = destinationAddress;
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

    public VehicleClassEnum getVehicleClass() {
        return vehicleClass;
    }

    public void setVehicleClass(VehicleClassEnum vehicleClass) {
        this.vehicleClass = vehicleClass;
    }
}

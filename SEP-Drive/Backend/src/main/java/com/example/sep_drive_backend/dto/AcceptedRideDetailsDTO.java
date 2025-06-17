package com.example.sep_drive_backend.dto;

import com.example.sep_drive_backend.constants.Ridestatus;
import com.example.sep_drive_backend.constants.VehicleClassEnum;

public class AcceptedRideDetailsDTO {
    private Long rideId;
    private Ridestatus status;

    private Double startLat;
    private Double startLng;
    private Double destLat;
    private Double destLng;

    private Double currentLat;
    private Double currentLng;
    private Double simulationSpeed;
    private Double estimatedPrice;

    private String customerUsername;
    private String driverUsername;
    private String driverFullName;
    private VehicleClassEnum vehicleClass;
    private Double driverRating;
    public Long getRideId() {
        return rideId;
    }
    public void setRideId(Long rideId) {
        this.rideId = rideId;
    }
    public Ridestatus getStatus() {
        return status;
    }
    public void setStatus(Ridestatus status) {
        this.status = status;
    }
    public Double getStartLat() {
        return startLat;
    }
    public void setStartLat(double startLat) {
        this.startLat = startLat;
    }
    public Double getStartLng() {
        return startLng;
    }
    public void setStartLng(double startLng) {
        this.startLng = startLng;
    }
    public Double getDestLat() {
        return destLat;
    }
    public AcceptedRideDetailsDTO (){
        this.status=Ridestatus.PLANNED;
    }
    public void setDestLat(double destLat) {
        this.destLat = destLat;
    }
    public Double getDestLng() {
        return destLng;
    }
    public void setDestLng(double destLng) {
        this.destLng = destLng;
    }
    public Double getCurrentLat() {
        return currentLat;
    }
    public void setCurrentLat(double currentLat) {
        this.currentLat = currentLat;
    }
    public Double getCurrentLng() {
        return currentLng;
    }
    public void setCurrentLng(double currentLng) {
        this.currentLng = currentLng;
    }
    public Double getSimulationSpeed() {
        return simulationSpeed;
    }
    public void setSimulationSpeed(double simulationSpeed) {
        this.simulationSpeed = simulationSpeed;
    }
    public Double getEstimatedPrice() {
        return estimatedPrice;
    }
    public void setEstimatedPrice(Double estimatedPrice) {
        this.estimatedPrice = estimatedPrice;
    }
    public String getCustomerUsername() {
        return customerUsername;
    }
    public void setCustomerUsername(String customerUsername) {
        this.customerUsername = customerUsername;
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
    public  VehicleClassEnum getVehicleClass() {
        return vehicleClass;
    }
    public void setVehicleClass(VehicleClassEnum vehicleClass) {
        this.vehicleClass = vehicleClass;
    }
    public Double getDriverRating() {
        return driverRating;
    }
    public void setDriverRating(Double driverRating) {
        this.driverRating = driverRating;
    }
}

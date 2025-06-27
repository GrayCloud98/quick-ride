package com.example.sep_drive_backend.dto;

import com.example.sep_drive_backend.constants.VehicleClassEnum;
import com.example.sep_drive_backend.models.Customer;
import com.example.sep_drive_backend.models.RideRequest;
import jakarta.persistence.Column;

import java.util.List;

public class RideRequestDTO {

    public RideRequestDTO() {
    }
    public RideRequestDTO(RideRequest request) {
        this.userName = request.getCustomer().getUsername();
        this.startAddress = request.getStartAddress();
        this.destinationAddress = request.getDestinationAddress();
        this.vehicleClass = request.getVehicleClass();
        this.startLatitude = request.getStartLatitude();
        this.startLongitude = request.getStartLongitude();
        this.destinationLatitude = request.getDestinationLatitude();
        this.destinationLongitude = request.getDestinationLongitude();
        this.startLocationName = request.getStartLocationName();
        this.DestinationLocationName = request.getDestinationLocationName();
        this.distance = request.getDistance();
        this.duration = (double) request.getDuration();
        this.estimatedPrice = request.getEstimatedPrice();
        this.waypoints = request.getWaypoints().stream()
                .map(WaypointDTO::new)
                .toList();
    }
    private List<WaypointDTO> waypoints;
    private Double distance;
    private Double duration;
    private Double estimatedPrice;


    private String userName;

    private String startLocationName;
    private String DestinationLocationName;

    private String startAddress;

    private Double startLatitude;
    private Double startLongitude;

    private String destinationAddress;

    private Double destinationLatitude;
    private Double destinationLongitude;


    private VehicleClassEnum vehicleClass;

    public Double getDistance() {
        return distance;
    }
    public void setDistance(Double distance) {
        this.distance = distance;
    }
    public Double getDuration() {
        return duration;
    }
    public void setDuration(Double duration) {
        this.duration = duration;
    }
    public Double getEstimatedPrice() {
        return estimatedPrice;
    }
    public void setEstimatedPrice(Double estimatedPrice) {
        this.estimatedPrice = estimatedPrice;
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



    public String getUserName() {
        return this.userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getStartAddress() {
        return this.startAddress;
    }

    public void setStartAddress(String startAddress) {
        this.startAddress = startAddress;
    }

    public String getDestinationAddress() {
        return this.destinationAddress;
    }

    public void setDestinationAddress(String destinationAddress) {
        this.destinationAddress = destinationAddress;
    }

    public VehicleClassEnum getVehicleClass() {
        return this.vehicleClass;
    }

    public void setVehicleClass(VehicleClassEnum vehicleClass) {
        this.vehicleClass = vehicleClass;
    }
    public List<WaypointDTO> getWaypoints() {
        return waypoints;
    }
    public void setWaypoints(List<WaypointDTO> waypoints) {
        this.waypoints = waypoints;
    }

}

package com.example.sep_drive_backend.dto;

import com.example.sep_drive_backend.models.RideSimulation;
import com.example.sep_drive_backend.models.Waypoint;
import jakarta.persistence.Embeddable;

import java.util.ArrayList;
import java.util.List;

public class SimulationPointsControl extends SimulationControlMessage{
    private Double distance;
    private double duration;
    private List<WaypointDTO> waypoints;
    private PointDTO endPoint;
    private String destinationLocationName;
    private String destinationAddress;
    private double price;

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public double getDuration() {
        return duration;
    }

    public void setDuration(double duration) {
        this.duration = duration;
    }

    public Double getDistance() {
        return distance;
    }

    public void setDistance(Double distance) {
        this.distance = distance;
    }

    public String getDestinationAddress() {
        return destinationAddress;
    }

    public void setDestinationAddress(String destinationAddress) {
        this.destinationAddress = destinationAddress;
    }


    public String getDestinationLocationName() {
        return destinationLocationName;
    }

    public void setDestinationLocationName(String destinationLocationName) {
        this.destinationLocationName = destinationLocationName;
    }


    public List<WaypointDTO> getWaypoints() {
        return waypoints;
    }

    public void setWaypoints(List<WaypointDTO> waypoints) {
        this.waypoints = waypoints;
    }


    public PointDTO getEndPoint() {
        return endPoint;
    }

    public void setEndPoint(PointDTO endPoint) {
        this.endPoint = endPoint;
    }
}

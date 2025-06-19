package com.example.sep_drive_backend.dto;

import com.example.sep_drive_backend.constants.RideStatus;
import com.example.sep_drive_backend.models.RideSimulation;

public class RideSimulationUpdate {

    private Long rideSimulationId;
    private boolean paused;
    private boolean hasStarted;
    private double duration; // seconds
    private RideSimulation.Point startPoint;
    private RideSimulation.Point endPoint;
    private RideStatus rideStatus;
    private String startLocationName;
    private String destinationLocationName;

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

    public RideStatus getRideStatus() {
        return rideStatus;
    }

    public void setRideStatus(RideStatus rideStatus) {
        this.rideStatus = rideStatus;
    }

    public Long getRideSimulationId() {
        return rideSimulationId;
    }

    public void setRideSimulationId(Long rideSimulationId) {
        this.rideSimulationId = rideSimulationId;
    }

    public boolean isPaused() {
        return paused;
    }

    public void setPaused(boolean paused) {
        this.paused = paused;
    }

    public boolean isHasStarted() {
        return hasStarted;
    }

    public void setHasStarted(boolean hasStarted) {
        this.hasStarted = hasStarted;
    }

    public double getDuration() {
        return duration;
    }

    public void setDuration(double duration) {
        this.duration = duration;
    }

    public RideSimulation.Point getStartPoint() {
        return startPoint;
    }

    public void setStartPoint(RideSimulation.Point startPoint) {
        this.startPoint = startPoint;
    }

    public RideSimulation.Point getEndPoint() {
        return endPoint;
    }

    public void setEndPoint(RideSimulation.Point endPoint) {
        this.endPoint = endPoint;
    }
}

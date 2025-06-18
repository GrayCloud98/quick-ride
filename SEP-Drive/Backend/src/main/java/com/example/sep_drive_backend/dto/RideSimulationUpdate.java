package com.example.sep_drive_backend.dto;

import com.example.sep_drive_backend.models.RideSimulation;

import java.util.List;

public class RideSimulationUpdate {

    private Long rideSimulationId;
    private boolean paused;
    private boolean hasStarted;
    private double currentIndex;
    private double duration; // seconds
    private RideSimulation.Point startPoint;
    private RideSimulation.Point edndPoint;


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

    public double getCurrentIndex() {
        return currentIndex;
    }

    public void setCurrentIndex(double currentIndex) {
        this.currentIndex = currentIndex;
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

    public RideSimulation.Point getEdndPoint() {
        return edndPoint;
    }

    public void setEdndPoint(RideSimulation.Point edndPoint) {
        this.edndPoint = edndPoint;
    }
}

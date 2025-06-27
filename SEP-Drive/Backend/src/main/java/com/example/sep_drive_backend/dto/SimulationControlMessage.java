package com.example.sep_drive_backend.dto;

public class SimulationControlMessage {
    private Long rideSimulationId;
    private int currentIndex;

    public Long getRideSimulationId() { return rideSimulationId; }
    public void setRideSimulationId(Long id) { this.rideSimulationId = id; }

    public int getCurrentIndex() { return currentIndex; }
    public void setCurrentIndex(int index) { this.currentIndex = index; }


}

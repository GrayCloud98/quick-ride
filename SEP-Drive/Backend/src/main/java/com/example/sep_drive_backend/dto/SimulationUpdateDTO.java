package com.example.sep_drive_backend.dto;

import com.example.sep_drive_backend.constants.Ridestatus;

public class SimulationUpdateDTO {

    private Double currentLat;
    private Double currentLng;
    private Ridestatus status;
    private Double simulationSpeed;

    public Double getCurrentLat() {
        return currentLat;
    }
    public void setCurrentLat(Double currentLat) {
        this.currentLat = currentLat;
    }
    public Double getCurrentLng() {
        return currentLng;
    }
    public void setCurrentLng(Double currentLng) {
        this.currentLng = currentLng;
    }
    public Ridestatus getStatus() {
        return status;
    }
    public void setStatus(Ridestatus status) {
        this.status = status;
    }
    public Double getSimulationSpeed() {
        return simulationSpeed;
    }
    public void setSimulationSpeed(Double simulationSpeed) {
        this.simulationSpeed = simulationSpeed;
    }
}

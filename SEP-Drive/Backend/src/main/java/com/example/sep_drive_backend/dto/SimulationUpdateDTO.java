package com.example.sep_drive_backend.dto;

public class SimulationUpdateDTO {
    private Long rideId;
    private double progress;
    private String status;
    private int speedSeconds;


    public Long getRideId() { return rideId; }
    public void setRideId(Long rideId) { this.rideId = rideId; }

    public double getProgress() { return progress; }
    public void setProgress(double progress) { this.progress = progress; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getSpeedSeconds() { return speedSeconds; }
    public void setSpeedSeconds(int speedSeconds) { this.speedSeconds = speedSeconds; }
}

package com.example.sep_drive_backend.dto;

public class SimulationUpdateDTO {
    private Long rideId;
    private double latitude;
    private double longitude;
    private double progressPercent;
    private String status;
    private int speedSeconds;


    public Long getRideId() { return rideId; }
    public void setRideId(Long rideId) { this.rideId = rideId; }

    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

    public double getProgressPercent() { return progressPercent; }
    public void setProgressPercent(double progressPercent) { this.progressPercent = progressPercent; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getSpeedSeconds() { return speedSeconds; }
    public void setSpeedSeconds(int speedSeconds) { this.speedSeconds = speedSeconds; }
}

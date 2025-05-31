package com.example.sep_drive_backend.dto;

public class DriverLocationDTO {
    private double driverLat;
    private double driverLon;

    public DriverLocationDTO() {}

    public DriverLocationDTO(double driverLat, double driverLon) {
        this.driverLat = driverLat;
        this.driverLon = driverLon;
    }

    public double getDriverLat() {
        return driverLat;
    }

    public void setDriverLat(double driverLat) {
        this.driverLat = driverLat;
    }

    public double getDriverLon() {
        return driverLon;
    }

    public void setDriverLon(double driverLon) {
        this.driverLon = driverLon;
    }
}

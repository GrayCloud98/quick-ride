package com.example.sep_drive_backend.dto;


public class PointDTO {
    private double lat;
    private double lng;

    public PointDTO() {}

    public PointDTO(double lat, double lng) {
        this.lat = lat;
        this.lng = lng;
    }

    public double getLat() { return lat; }
    public void setLat(double lat) { this.lat = lat; }

    public double getLng() { return lng; }
    public void setLng(double lng) { this.lng = lng; }
}

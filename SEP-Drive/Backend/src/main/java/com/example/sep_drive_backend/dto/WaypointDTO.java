package com.example.sep_drive_backend.dto;

import com.example.sep_drive_backend.models.Waypoint;

public class WaypointDTO {
    private String Name;
    private String address;
    private Double latitude;
    private Double longitude;
    private Integer sequenceOrder;

    public WaypointDTO() {}

    public WaypointDTO(Waypoint waypoint) {
        this.address = waypoint.getAddress();
        this.latitude = waypoint.getLatitude();
        this.longitude = waypoint.getLongitude();
        this.sequenceOrder = waypoint.getSequenceOrder();
        this.Name=waypoint.getName();
    }
    public String getName() { return this.Name; }
    public void setName(String name) { this.Name = name; }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Integer getSequenceOrder() {
        return sequenceOrder;
    }

    public void setSequenceOrder(Integer sequenceOrder) {
        this.sequenceOrder = sequenceOrder;
    }
}

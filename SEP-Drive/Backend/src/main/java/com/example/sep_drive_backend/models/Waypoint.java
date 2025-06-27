package com.example.sep_drive_backend.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
public class Waypoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String Name;
    private String address;
    private Double latitude;
    private Double longitude;

    private Integer sequenceOrder;

    @ManyToOne
    @JoinColumn(name = "ride_request_id")
    @JsonBackReference
    private RideRequest rideRequest;
    public Waypoint() {}
    public Waypoint(String Name, Long id, String address, Double latitude, Double longitude, RideRequest rideRequest) {
        this.id = id;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
        this.sequenceOrder = 0;
        this.rideRequest = rideRequest;
        this.Name = Name;
    }

    public String getName() {
        return Name;
    }
    public void setName(String name) { this.Name = name; }

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
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
    public RideRequest getRideRequest() {
        return rideRequest;
    }
    public void setRideRequest(RideRequest rideRequest) {
        this.rideRequest = rideRequest;
    }
}

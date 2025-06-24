package com.example.sep_drive_backend.models;

import com.example.sep_drive_backend.constants.RideStatus;
import com.example.sep_drive_backend.constants.VehicleClassEnum;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class RideRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ManyToOne
    @JoinColumn(name = "customer_username", referencedColumnName = "username", nullable = false)
    private Customer customer;

    @Column
    private String startAddress;

    private Double startLatitude;
    private Double startLongitude;
    @Column (nullable = true)
    private String startLocationName;
    @Column (nullable = true)
    private String destinationLocationName;

    @Column
    private String destinationAddress;

    private Double destinationLatitude;
    private Double destinationLongitude;
    @Column
    private Double distance;

    @Column
    private double duration;

    @Column
    private Double estimatedPrice;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private int customerRating;
    private int driverRating;

    @Column
    @Enumerated(EnumType.STRING)
    private RideStatus rideStatus;

    @Column
    @Enumerated(EnumType.STRING)
    private VehicleClassEnum vehicleClass;

    private LocalDateTime endedAt;

    public LocalDateTime getEndedAt() {
        return endedAt;
    }

    public void markEnded() {
        this.endedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onEnd() {
        this.endedAt = LocalDateTime.now();
    }

    public RideRequest() {
    }

    public RideRequest(Customer customer, String startAddress, Double startLatitude, Double startLongitude, String startLocationName, String destinationLocationName, String destinationAddress, Double destinationLatitude, Double destinationLongitude, Double distance, double duration, Double estimatedPrice, VehicleClassEnum vehicleClass) {
        this.customer = customer;
        this.startAddress = startAddress;
        this.startLatitude = startLatitude;
        this.startLongitude = startLongitude;
        this.startLocationName = startLocationName;
        this.destinationLocationName = destinationLocationName;
        this.destinationAddress = destinationAddress;
        this.destinationLatitude = destinationLatitude;
        this.destinationLongitude = destinationLongitude;
        this.distance = distance;
        this.duration = duration;
        this.estimatedPrice = estimatedPrice;
        this.vehicleClass = vehicleClass;
        this.rideStatus = RideStatus.CREATED;
    }

    public int getCustomerRating() {
        return customerRating;
    }

    public void setCustomerRating(int customerRating) {
        this.customerRating = customerRating;
    }

    public int getDriverRating() {
        return driverRating;
    }

    public void setDriverRating(int driverRating) {
        this.driverRating = driverRating;
    }

    public RideStatus getRideStatus() {
        return rideStatus;
    }

    public void setRideStatus(RideStatus rideStatus) {
        this.rideStatus = rideStatus;
    }

    public void setDuration(double duration) {
        this.duration = duration;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

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


    public Double getStartLatitude() {
        return startLatitude;
    }

    public void setStartLatitude(Double startLatitude) {
        this.startLatitude = startLatitude;
    }

    public Double getStartLongitude() {
        return startLongitude;
    }

    public void setStartLongitude(Double startLongitude) {
        this.startLongitude = startLongitude;
    }

    public Double getDestinationLatitude() {
        return destinationLatitude;
    }

    public void setDestinationLatitude(Double destinationLatitude) {
        this.destinationLatitude = destinationLatitude;
    }

    public Double getDestinationLongitude() {
        return destinationLongitude;
    }

    public void setDestinationLongitude(Double destinationLongitude) {
        this.destinationLongitude = destinationLongitude;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }



    public String getStartAddress() {
        return startAddress;
    }

    public void setStartAddress(String startAddress) {
        this.startAddress = startAddress;
    }


    public String getDestinationAddress() {
        return destinationAddress;
    }

    public void setDestinationAddress(String destinationAddress) {
        this.destinationAddress = destinationAddress;
    }


    public VehicleClassEnum getVehicleClass() {
        return vehicleClass;
    }

    public void setVehicleClass(VehicleClassEnum vehicleClass) {
        this.vehicleClass = vehicleClass;
    }

    public Double getDistance() {
        return distance;
    }
    public void setDistance(Double distance) {
        this.distance = distance;
    }
    public Double getDuration() {
        return duration;
    }
    public void setDuration(Double duration) {
        this.duration = duration;
    }
    public Double getEstimatedPrice() {
        return estimatedPrice;
    }
    public void setEstimatedPrice(Double estimatedPrice) {
        this.estimatedPrice = estimatedPrice;
    }
}
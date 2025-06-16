package com.example.sep_drive_backend.models;

import com.example.sep_drive_backend.constants.Ridestatus;
import com.example.sep_drive_backend.constants.VehicleClassEnum;
import jakarta.persistence.*;

import java.sql.Time;
import java.time.LocalDateTime;

@Entity
public class RideRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ManyToOne
    @JoinColumn(name = "customer_username", referencedColumnName = "username", nullable = false)
    private Customer customer; // This will be the reference to the Customer entity via 'username'

    @Column
    private String startAddress;

    private Double startLatitude;
    private Double startLongitude;
    @Column (nullable = true)
    private String startLocationName;
    @Column (nullable = true)
    private String DestinationLocationName;

    @Column
    private String destinationAddress;

    @Column
    @Enumerated(EnumType.STRING)
    private VehicleClassEnum vehicleClass;

    private Double destinationLatitude;
    private Double destinationLongitude;
    @Column
    private Double distance;
    @Enumerated(EnumType.STRING)
    private Ridestatus status;


    @OneToOne
    @JoinColumn(name = "ride_offer_id")
    private RideOffer rideOffer;
    @Column
    private Double currentLat;

    private Double simulationSpeed;
    @Column
    private Double currentLng;


    @Column
    private Double duration;

    @Column
    private Double estimatedPrice;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }


    public RideRequest() {}

    public RideRequest(Long id, String startAddress, String startLocationName, String destinationLocationName, String destinationAddress, Double startLatitude, Double startLongitude, Double destinationLatitude, Double destinationLongitude, VehicleClassEnum vehicleClass, Customer customer , Double distance, Double duration, Double estimatedPrice) {
        this.id = id;
        this.startAddress = startAddress;
        this.destinationAddress = destinationAddress;
        this.startLatitude = startLatitude;
        this.startLongitude = startLongitude;
        this.destinationLatitude = destinationLatitude;
        this.destinationLongitude = destinationLongitude;
        this.vehicleClass = vehicleClass;
        this.customer = customer;
        this.startLocationName = startLocationName;
        this.DestinationLocationName = destinationLocationName;
        this.distance = distance;
        this.duration = duration;
        this.estimatedPrice = estimatedPrice;
        this.status = Ridestatus.PLANNED;
    }


    public Ridestatus getStatus() {
        return status;
    }

    public void setStatus(Ridestatus status) {
        this.status = status;
    }

    public RideOffer getRideOffer() {
        return rideOffer;
    }

    public void setRideOffer(RideOffer rideOffer) {
        this.rideOffer = rideOffer;
    }

    public Double getCurrentLat() {
        return currentLat;
    }

    public void setCurrentLat(Double currentLat) {
        this.currentLat = currentLat;
    }

    public Double getSimulationSpeed() {
        return simulationSpeed;
    }

    public void setSimulationSpeed(Double simulationSpeed) {
        this.simulationSpeed = simulationSpeed;
    }

    public Double getCurrentLng() {
        return currentLng;
    }

    public void setCurrentLng(Double currentLng) {
        this.currentLng = currentLng;
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
        return DestinationLocationName;
    }

    public void setDestinationLocationName(String destinationLocationName) {
        DestinationLocationName = destinationLocationName;
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
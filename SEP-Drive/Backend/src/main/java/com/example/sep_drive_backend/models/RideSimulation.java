package com.example.sep_drive_backend.models;
import com.example.sep_drive_backend.constants.RideStatus;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Entity
public class RideSimulation {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private boolean hasChanged = false;
    private double duration = 30.0;
    private boolean paused = true;
    private boolean hasStarted = false;
    private int currentIndex = 0;
    private String startAddress;
    private String endAddress;

    public String getStartAddress() {
        return startAddress;
    }

    public void setStartAddress(String startAddress) {
        this.startAddress = startAddress;
    }

    public String getEndAddress() {
        return endAddress;
    }

    public void setEndAddress(String endAddress) {
        this.endAddress = endAddress;
    }
    private LocalDateTime endedAt;

    public LocalDateTime getEndedAt() {
        return endedAt;
    }

    public void markEnded() {
        this.endedAt = LocalDateTime.now();
    }

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "lat", column = @Column(name = "start_lat")),
            @AttributeOverride(name = "lng", column = @Column(name = "start_lng"))
    })
    private Point startPoint;


    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "lat", column = @Column(name = "end_lat")),
            @AttributeOverride(name = "lng", column = @Column(name = "end_lng"))
    })
    private Point endPoint;

    @ManyToOne
    @JoinColumn(name = "customer_username", referencedColumnName = "username", nullable = false)
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "driver_username", referencedColumnName = "username", nullable = false)
    private Driver driver;

    @OneToOne
    @JoinColumn(name = "ride_offer_id", referencedColumnName = "id", nullable = false)
    private RideOffer rideOffer;

    @Column
    @Enumerated(EnumType.STRING)
    private RideStatus rideStatus;

    private String startLocationName;
    private String destinationLocationName;


    public RideSimulation() {
    }

    public RideSimulation(Point startPoint, Point endPoint, Customer customer, Driver driver, RideOffer rideOffer, String startLocationName, String destinationLocationName) {
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        this.customer = customer;
        this.driver = driver;
        this.rideOffer = rideOffer;
        this.startLocationName = startLocationName;
        this.destinationLocationName = destinationLocationName;
        this.duration = 30.0;
        this.paused = true;
        this.rideStatus = RideStatus.CREATED;
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

    public RideOffer getRideOffer() {
        return rideOffer;
    }

    public void setRideOffer(RideOffer rideOffer) {
        this.rideOffer = rideOffer;
    }

    public void setHasStarted(boolean hasStarted) {
        this.hasStarted = hasStarted;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public Driver getDriver() {
        return driver;
    }

    public void setDriver(Driver driver) {
        this.driver = driver;
    }

    public RideStatus getRideStatus() {
        return rideStatus;
    }

    public void setRideStatus(RideStatus rideStatus) {
        this.rideStatus = rideStatus;
    }

    public boolean isHasStarted() {
        return hasStarted;
    }

    public void markStarted() {
        if (!this.hasStarted) {
            this.hasStarted = true;
        }
    }

    public boolean getHasChanged() {
        return hasChanged;
    }

    public boolean isHasChanged() {
        return hasChanged;
    }

    public void setHasChanged(boolean hasChanged) {
        this.hasChanged = hasChanged;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public double getDuration() {
        return duration;
    }

    public void setDuration(double duration) {
        this.duration = duration;
    }

    public boolean isPaused() {
        return paused;
    }

    public void setPaused(boolean paused) {
        this.paused = paused;
    }

    public Point getStartPoint() {
        return startPoint;
    }

    public void setStartPoint(Point startPoint) {
        this.startPoint = startPoint;
    }

    public Point getEndPoint() {
        return endPoint;
    }

    public void setEndPoint(Point endPoint) {
        this.endPoint = endPoint;
    }

    public int getCurrentIndex() {
        return currentIndex;
    }

    public void setCurrentIndex(int currentIndex) {
        this.currentIndex = currentIndex;
    }

}


package com.example.sep_drive_backend.models;

import com.example.sep_drive_backend.constants.TripsStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "trips")
public class Trips {
    public Trips() {
    }

    @Id
    private Long id;

    @Enumerated(EnumType.STRING)
    private TripsStatus status;

    private double progress;

    private double Speed;

    private LocalDateTime endTime;

    private double distanceKm;

    private double durationMin;

    private double priceEuro;

    private Integer customerRating = 0;
    private Integer driverRating = 0;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private User customer;

    @ManyToOne
    @JoinColumn(name = "driver_id")
    private User driver;


    private String customerFullName;
    private String customerUsername;

    private String driverFullName;



    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }




    public double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(double distanceKm) {
        this.distanceKm = distanceKm;
    }

    public double getDurationMin() {
        return durationMin;
    }

    public void setDurationMin(double durationMin) {
        this.durationMin = durationMin;
    }

    public double getPriceEuro() {
        return priceEuro;
    }

    public void setPriceEuro(double priceEuro) {
        this.priceEuro = priceEuro;
    }

    public Integer getCustomerRating() {
        return customerRating;
    }

    public void setCustomerRating(Integer customerRating) {
        this.customerRating = customerRating;
    }

    public Integer getDriverRating() {
        return driverRating;
    }

    public void setDriverRating(Integer driverRating) {
        this.driverRating = driverRating;
    }

    public User getCustomer() {
        return customer;
    }

    public void setCustomer(User customer) {
        this.customer = customer;
    }

    public User getDriver() {
        return  driver;
    }

    public void setDriver(User driver) {
        this.driver = driver;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public void setStatus(TripsStatus status) {
        this.status = status;
    }

    public void setProgress(double progress) {
        this.progress = progress;
    }

    public void setSpeed(int seconds) {
        this.Speed = seconds;
    }
    public String getCustomerFullName() {
        return customerFullName;
    }

    public void setCustomerFullName(String customerFullName) {
        this.customerFullName = customerFullName;
    }

    public String getCustomerUsername() {
        return customerUsername;
    }

    public void setCustomerUsername(String customerUsername) {
        this.customerUsername = customerUsername;
    }

    public String getDriverFullName() {
        return driverFullName;
    }

    public void setDriverFullName(String driverFullName) {
        this.driverFullName = driverFullName;
    }



}

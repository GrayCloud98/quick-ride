package com.example.sep_drive_backend.dto;

public class LeaderboardEntryDTO {
    private String username;
    private String fullName;
    private double totalDistanceDriven;
    private double averageRating;
    private long totalDriveTime;
    private int numberOfRides;
    private double moneyEarned;


    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public double getTotalDistanceDriven() {
        return totalDistanceDriven;
    }

    public void setTotalDistanceDriven(double totalDistanceDriven) {
        this.totalDistanceDriven = totalDistanceDriven;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(double averageRating) {
        this.averageRating = averageRating;
    }

    public long getTotalDriveTime() {
        return totalDriveTime;
    }

    public void setTotalDriveTime(long totalDriveTime) {
        this.totalDriveTime = totalDriveTime;
    }

    public int getNumberOfRides() {
        return numberOfRides;
    }

    public void setNumberOfRides(int numberOfRides) {
        this.numberOfRides = numberOfRides;
    }

    public double getMoneyEarned() {
        return moneyEarned;
    }

    public void setMoneyEarned(double moneyEarned) {
        this.moneyEarned = moneyEarned;
    }
}
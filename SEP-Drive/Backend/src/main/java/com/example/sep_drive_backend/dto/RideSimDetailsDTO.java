package com.example.sep_drive_backend.dto;

public class RideSimDetailsDTO {
    private Double distance;
    private Double estimatedPrice;
    private Double Duration;

    public Double getDistance() {
        return distance;
    }

    public RideSimDetailsDTO() {
    }

    public void setDistance(Double distance) {
        this.distance = distance;
    }

    public Double getEstimatedPrice() {
        return estimatedPrice;
    }

    public void setEstimatedPrice(Double estimatedPrice) {
        this.estimatedPrice = estimatedPrice;
    }

    public Double getDuration() {
        return Duration;
    }

    public void setDuration(Double duration) {
        Duration = duration;
    }
}

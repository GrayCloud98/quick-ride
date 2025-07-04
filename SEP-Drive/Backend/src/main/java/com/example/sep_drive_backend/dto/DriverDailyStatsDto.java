package com.example.sep_drive_backend.dto;

public class DriverDailyStatsDto {
    private Integer day;
    private Double totalDistance;
    private Double totalPrice;
    private Double averageRating;
    private Double totalTravelledTime;

    public DriverDailyStatsDto(Number day, Number totalDistance, Number totalPrice, Number averageRating, Number totalTravelledTime) {
        this.day = day != null ? day.intValue() : null;
        this.totalDistance = totalDistance != null ? totalDistance.doubleValue() : 0.0;
        this.totalPrice = totalPrice != null ? totalPrice.doubleValue() : 0.0;
        this.averageRating = averageRating != null ? averageRating.doubleValue() : 0.0;
        this.totalTravelledTime = totalTravelledTime != null ? totalTravelledTime.doubleValue() : 0.0;
    }

    public Integer getDay() {
        return day;
    }

    public void setDay(Integer day) {
        this.day = day;
    }

    public Double getTotalDistance() {
        return totalDistance;
    }

    public void setTotalDistance(Double totalDistance) {
        this.totalDistance = totalDistance;
    }

    public Double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(Double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public Double getTotalTravelledTime() {
        return totalTravelledTime;
    }

    public void setTotalTravelledTime(Double totalTravelledTime) {
        this.totalTravelledTime = totalTravelledTime;
    }
}

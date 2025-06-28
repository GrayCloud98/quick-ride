package com.example.sep_drive_backend.dto;

import java.util.List;

public class DriverStatsDto {
    private List<Integer> rating;
    private List<Double> totalTravelledDistance;
    private List<Double> totalTravelledTime;
    private List<Double> earnings;

    public List<Integer> getRating() {
        return rating;
    }

    public void setRating(List<Integer> rating) {
        this.rating = rating;
    }

    public List<Double> getTotalTravelledDistance() {
        return totalTravelledDistance;
    }

    public void setTotalTravelledDistance(List<Double> totalTravelledDistance) {
        this.totalTravelledDistance = totalTravelledDistance;
    }

    public List<Double> getTotalTravelledTime() {
        return totalTravelledTime;
    }

    public void setTotalTravelledTime(List<Double> totalTravelledTime) {
        this.totalTravelledTime = totalTravelledTime;
    }

    public List<Double> getEarnings() {
        return earnings;
    }

    public void setEarnings(List<Double> earnings) {
        this.earnings = earnings;
    }
}

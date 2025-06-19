package com.example.sep_drive_backend.dto;

import java.time.LocalDateTime;

public class RideHistoryDto {
    private int rideId;
    private LocalDateTime endTime;
    private Double distance;
    private Double duration;
    private float fees;
    private int customerRating;
    private int driverRating;
    private String driverName;
    private String driverUsername;
    private String customerName;
    private String customerUsername;

}

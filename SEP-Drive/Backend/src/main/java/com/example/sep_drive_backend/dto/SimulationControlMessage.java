package com.example.sep_drive_backend.dto;

import com.example.sep_drive_backend.models.Waypoint;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.CascadeType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;

import java.util.ArrayList;
import java.util.List;

public class SimulationControlMessage {
    private Long rideSimulationId;
    private int currentIndex;

    public Long getRideSimulationId() { return rideSimulationId; }
    public void setRideSimulationId(Long id) { this.rideSimulationId = id; }

    public int getCurrentIndex() { return currentIndex; }
    public void setCurrentIndex(int index) { this.currentIndex = index; }


}

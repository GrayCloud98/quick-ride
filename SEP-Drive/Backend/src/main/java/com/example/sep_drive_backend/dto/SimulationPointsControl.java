package com.example.sep_drive_backend.dto;

import com.example.sep_drive_backend.models.RideSimulation;
import com.example.sep_drive_backend.models.Waypoint;
import jakarta.persistence.Embeddable;

import java.util.ArrayList;
import java.util.List;

public class SimulationPointsControl extends SimulationControlMessage{

    private List<Waypoint> waypoints = new ArrayList<>();
    private RideSimulation.Point startPoint;
    private RideSimulation.Point endPoint;
    private String startLocationName;
    private String destinationLocationName;

    public String getDestinationLocationName() {
        return destinationLocationName;
    }

    public void setDestinationLocationName(String destinationLocationName) {
        this.destinationLocationName = destinationLocationName;
    }

    public String getStartLocationName() {
        return startLocationName;
    }

    public void setStartLocationName(String startLocationName) {
        this.startLocationName = startLocationName;
    }

    public List<Waypoint> getWaypoints() {
        return waypoints;
    }

    public void setWaypoints(List<Waypoint> waypoints) {
        this.waypoints = waypoints;
    }


    public RideSimulation.Point getStartPoint() {
        return startPoint;
    }

    public void setStartPoint(RideSimulation.Point startPoint) {
        this.startPoint = startPoint;
    }

    public RideSimulation.Point getEndPoint() {
        return endPoint;
    }

    public void setEndPoint(RideSimulation.Point endPoint) {
        this.endPoint = endPoint;
    }
}

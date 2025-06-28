package com.example.sep_drive_backend.dto;

import com.example.sep_drive_backend.models.RideSimulation;
import com.example.sep_drive_backend.models.Waypoint;
import jakarta.persistence.Embeddable;

import java.util.ArrayList;
import java.util.List;

public class SimulationPointsControl extends SimulationControlMessage{

    private List<WaypointDTO> waypoints;
    private RideSimulation.Point startPoint;
    private RideSimulation.Point endPoint;
    private String startLocationName;
    private String destinationLocationName;
    private String destinationAddress;

    public String getDestinationAddress() {
        return destinationAddress;
    }

    public void setDestinationAddress(String destinationAddress) {
        this.destinationAddress = destinationAddress;
    }

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

    public List<WaypointDTO> getWaypoints() {
        return waypoints;
    }

    public void setWaypoints(List<WaypointDTO> waypoints) {
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

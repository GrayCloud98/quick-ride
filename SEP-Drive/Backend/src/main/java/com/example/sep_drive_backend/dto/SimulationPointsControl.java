package com.example.sep_drive_backend.dto;

import com.example.sep_drive_backend.models.RideSimulation;
import com.example.sep_drive_backend.models.Waypoint;
import jakarta.persistence.Embeddable;

import java.util.ArrayList;
import java.util.List;

public class SimulationPointsControl extends SimulationControlMessage{

    private List<WaypointDTO> waypoints;
    private PointDTO endPoint;
    private String destinationLocationName;


    public String getDestinationLocationName() {
        return destinationLocationName;
    }

    public void setDestinationLocationName(String destinationLocationName) {
        this.destinationLocationName = destinationLocationName;
    }


    public List<WaypointDTO> getWaypoints() {
        return waypoints;
    }

    public void setWaypoints(List<WaypointDTO> waypoints) {
        this.waypoints = waypoints;
    }


    public PointDTO getEndPoint() {
        return endPoint;
    }

    public void setEndPoint(PointDTO endPoint) {
        this.endPoint = endPoint;
    }
}

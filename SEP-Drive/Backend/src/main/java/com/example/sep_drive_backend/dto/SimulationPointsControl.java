package com.example.sep_drive_backend.dto;

import com.example.sep_drive_backend.models.Waypoint;

import java.util.ArrayList;
import java.util.List;

public class SimulationPointsControl extends SimulationControlMessage{
    private List<Waypoint> waypoints = new ArrayList<>();

    public List<Waypoint> getWaypoints() {
        return waypoints;
    }

    public void setWaypoints(List<Waypoint> waypoints) {
        this.waypoints = waypoints;
    }
}

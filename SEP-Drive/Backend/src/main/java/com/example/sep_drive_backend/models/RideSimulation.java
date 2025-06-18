package com.example.sep_drive_backend.models;
import jakarta.persistence.*;

@Entity
public class RideSimulation {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private double duration;
    private boolean paused;
    private double currentIndex;
    private boolean hasStarted = false;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "lat", column = @Column(name = "start_lat")),
            @AttributeOverride(name = "lng", column = @Column(name = "start_lng"))
    })
    private Point startPoint;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "lat", column = @Column(name = "end_lat")),
            @AttributeOverride(name = "lng", column = @Column(name = "end_lng"))
    })
    private Point endPoint;

    public boolean isHasStarted() {
        return hasStarted;
    }

    public void markStarted() {
        if (!this.hasStarted) {
            this.hasStarted = true;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public double getDuration() {
        return duration;
    }

    public void setDuration(double duration) {
        this.duration = duration;
    }

    public boolean isPaused() {
        return paused;
    }

    public void setPaused(boolean paused) {
        this.paused = paused;
    }

    public double getCurrentIndex() {
        return currentIndex;
    }

    public void setCurrentIndex(double currentIndex) {
        this.currentIndex = currentIndex;
    }

    public Point getStartPoint() {
        return startPoint;
    }

    public void setStartPoint(Point startPoint) {
        this.startPoint = startPoint;
    }

    public Point getEndPoint() {
        return endPoint;
    }

    public void setEndPoint(Point endPoint) {
        this.endPoint = endPoint;
    }

    @Embeddable
    public static class Point {
        private double lat;
        private double lng;

        public Point() {}

        public Point(double lat, double lng) {
            this.lat = lat;
            this.lng = lng;
        }

        public double getLat() {
            return lat;
        }

        public void setLat(double lat) {
            this.lat = lat;
        }

        public double getLng() {
            return lng;
        }

        public void setLng(double lng) {
            this.lng = lng;
        }
    }
}


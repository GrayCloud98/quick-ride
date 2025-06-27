package com.example.sep_drive_backend.dto;

public class NotificationMessage {
    private String type;
    private String message;
    private String status;
    private String driverName;

    public NotificationMessage() {}
    public NotificationMessage(String type, String message) {
        this.type = type;
        this.message = message;
    }
    public NotificationMessage(String type, String message, String status, String driverName) {
        this.type = type;
        this.message = message;
        this.status = status;
        this.driverName = driverName;
    }


    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDriverName() {
        return driverName;
    }

    public void setDriverName(String driverName) {
        this.driverName = driverName;
    }


}


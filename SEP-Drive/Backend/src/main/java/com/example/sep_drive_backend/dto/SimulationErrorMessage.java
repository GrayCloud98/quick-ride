package com.example.sep_drive_backend.dto;

public class SimulationErrorMessage {
    private String type = "ERROR";
    private String message;
    private double customerBalance;
    private double price;

    public SimulationErrorMessage() {
    }

    public String getType() {
        return type;
    }

    public String getMessage() {
        return message;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public double getCustomerBalance() {
        return customerBalance;
    }

    public void setCustomerBalance(double customerBalance) {
        this.customerBalance = customerBalance;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }
}

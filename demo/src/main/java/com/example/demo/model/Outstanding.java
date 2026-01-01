package com.example.demo.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("outstanding")
public class Outstanding {
    @Id
    private String residentId;
    private double amount;

    public Outstanding() {}

    public Outstanding(String residentId, double amount) {
        this.residentId = residentId;
        this.amount = amount;
    }

    public String getResidentId() { return residentId; }
    public void setResidentId(String residentId) { this.residentId = residentId; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }
}
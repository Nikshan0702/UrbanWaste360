// src/main/java/com/example/demo/dto/UpdateSellRequestStatusDTO.java
package com.example.demo.dto;

public class UpdateSellRequestStatusDTO {

    private String status;   // "COLLECTED" | "REJECTED"
    private Double collectedKg; // <-- Boxed, not primitive

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getCollectedKg() { return collectedKg; }
    public void setCollectedKg(Double collectedKg) { this.collectedKg = collectedKg; }
}
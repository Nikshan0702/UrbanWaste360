package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public class ApproveAssignRequest {
    @NotBlank
    private String crewId;

    /** Final charge to add to outstanding on approval */
    @Positive
    private double price;

    private String notes;

    // getters/setters
    public String getCrewId() { return crewId; }
    public void setCrewId(String crewId) { this.crewId = crewId; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
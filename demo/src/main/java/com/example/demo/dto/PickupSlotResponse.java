// PickupSlotResponse.java
package com.example.demo.dto;

import java.util.List;

public class PickupSlotResponse {
    
    private String date;
    private List<String> availableTimes;
    private int availableSlots;
    
    // Constructors
    public PickupSlotResponse() {}
    
    public PickupSlotResponse(String date, List<String> availableTimes) {
        this.date = date;
        this.availableTimes = availableTimes;
        this.availableSlots = availableTimes != null ? availableTimes.size() : 0;
    }
    
    // Getters and Setters
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    
    public List<String> getAvailableTimes() { return availableTimes; }
    public void setAvailableTimes(List<String> availableTimes) { 
        this.availableTimes = availableTimes;
        this.availableSlots = availableTimes != null ? availableTimes.size() : 0;
    }
    
    public int getAvailableSlots() { return availableSlots; }
    public void setAvailableSlots(int availableSlots) { this.availableSlots = availableSlots; }
}
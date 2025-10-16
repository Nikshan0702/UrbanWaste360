// SpecialPickupRequest.java
package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class SpecialPickupRequest {
    
    @NotBlank(message = "User ID is required")
    private String userId;
    
    @NotBlank(message = "Waste type is required")
    private String wasteType;
    
    @NotBlank(message = "Pickup date is required")
    private String pickupDate;
    
    @NotBlank(message = "Pickup time is required")
    private String pickupTime;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    private String location;
    
    private String specialInstructions;
    
    @NotBlank(message = "Urgency level is required")
    private String urgency;
    
    private List<String> photoUrls;
    
    private double price;
    
    // Constructors
    public SpecialPickupRequest() {}
    
    public SpecialPickupRequest(String userId, String wasteType, String pickupDate, String pickupTime, String description) {
        this.userId = userId;
        this.wasteType = wasteType;
        this.pickupDate = pickupDate;
        this.pickupTime = pickupTime;
        this.description = description;
        this.urgency = "normal";
    }
    
    // Getters and Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getWasteType() { return wasteType; }
    public void setWasteType(String wasteType) { this.wasteType = wasteType; }
    
    public String getPickupDate() { return pickupDate; }
    public void setPickupDate(String pickupDate) { this.pickupDate = pickupDate; }
    
    public String getPickupTime() { return pickupTime; }
    public void setPickupTime(String pickupTime) { this.pickupTime = pickupTime; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    
    public String getSpecialInstructions() { return specialInstructions; }
    public void setSpecialInstructions(String specialInstructions) { this.specialInstructions = specialInstructions; }
    
    public String getUrgency() { return urgency; }
    public void setUrgency(String urgency) { this.urgency = urgency; }
    
    public List<String> getPhotoUrls() { return photoUrls; }
    public void setPhotoUrls(List<String> photoUrls) { this.photoUrls = photoUrls; }
    
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
}
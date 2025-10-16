// SpecialPickupResponse.java
package com.example.demo.dto;

import java.util.List;
import java.time.LocalDateTime;

public class SpecialPickupResponse {
    
    private String id;
    private String userId;
    private String wasteType;
    private String pickupDate;
    private String pickupTime;
    private String description;
    private String location;
    private String specialInstructions;
    private String urgency;
    private List<String> photoUrls;
    private double price;
    private String status;
    private String pickupId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String assignedCrewId;
    private String notes;
    
    // Constructors
    public SpecialPickupResponse() {}
    
    public SpecialPickupResponse(String id, String userId, String wasteType, String status) {
        this.id = id;
        this.userId = userId;
        this.wasteType = wasteType;
        this.status = status;
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
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
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getPickupId() { return pickupId; }
    public void setPickupId(String pickupId) { this.pickupId = pickupId; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public String getAssignedCrewId() { return assignedCrewId; }
    public void setAssignedCrewId(String assignedCrewId) { this.assignedCrewId = assignedCrewId; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
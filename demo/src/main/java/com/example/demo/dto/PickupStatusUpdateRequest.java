// PickupStatusUpdateRequest.java
package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;

public class PickupStatusUpdateRequest {
    
    @NotBlank(message = "Status is required")
    private String status;
    
    private String notes;
    private String assignedCrewId;
    
    // Constructors
    public PickupStatusUpdateRequest() {}
    
    public PickupStatusUpdateRequest(String status) {
        this.status = status;
    }
    
    // Getters and Setters
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public String getAssignedCrewId() { return assignedCrewId; }
    public void setAssignedCrewId(String assignedCrewId) { this.assignedCrewId = assignedCrewId; }
}
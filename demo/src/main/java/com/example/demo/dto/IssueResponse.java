// IssueResponse.java
package com.example.demo.dto;

import com.example.demo.entity.IssueCategory;
import com.example.demo.entity.IssueStatus;
import java.time.LocalDateTime;
import java.util.List;

public class IssueResponse {
    private String id;
    private String userId;
    private IssueCategory category;
    private String description;
    private String location;
    private boolean isAnonymous;
    private boolean useGPSLocation;
    private IssueStatus status;
    private List<String> photoUrls;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Default constructor
    public IssueResponse() {}
    
    // Parameterized constructor
    public IssueResponse(String id, String userId, IssueCategory category, String description, 
                        IssueStatus status, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.category = category;
        this.description = description;
        this.status = status;
        this.createdAt = createdAt;
    }
    
    // Getters and Setters (ALL SETTERS MUST BE PRESENT)
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public IssueCategory getCategory() { return category; }
    public void setCategory(IssueCategory category) { this.category = category; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    
    public boolean isAnonymous() { return isAnonymous; }
    public void setAnonymous(boolean anonymous) { isAnonymous = anonymous; }
    
    public boolean isUseGPSLocation() { return useGPSLocation; }
    public void setUseGPSLocation(boolean useGPSLocation) { this.useGPSLocation = useGPSLocation; }
    
    public IssueStatus getStatus() { return status; }
    public void setStatus(IssueStatus status) { this.status = status; }
    
    public List<String> getPhotoUrls() { return photoUrls; }
    public void setPhotoUrls(List<String> photoUrls) { this.photoUrls = photoUrls; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
// IssueRequest.java
package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class IssueRequest {
    
    @NotBlank(message = "User ID is required")
    private String userId;
    
    @NotBlank(message = "Category is required")
    private String category; // Always use String
    
    @NotBlank(message = "Description is required")
    private String description;
    
    private String location;
    
    private boolean isAnonymous = false;
    
    private boolean useGPSLocation = false;
    
    // Constructors
    public IssueRequest() {}
    
    public IssueRequest(String userId, String category, String description) {
        this.userId = userId;
        this.category = category;
        this.description = description;
    }
    
    // Getters and Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    
    public boolean isAnonymous() { return isAnonymous; }
    public void setAnonymous(boolean anonymous) { isAnonymous = anonymous; }
    
    public boolean isUseGPSLocation() { return useGPSLocation; }
    public void setUseGPSLocation(boolean useGPSLocation) { this.useGPSLocation = useGPSLocation; }
}
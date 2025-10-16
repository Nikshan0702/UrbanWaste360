// Issue.java
package com.example.demo.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "issues")
public class Issue {
    @Id
    private String id;
    
    private String userId;
    private IssueCategory category;
    private String description;
    private String location;
    private boolean isAnonymous = false;
    private boolean useGPSLocation = false;
    private IssueStatus status = IssueStatus.PENDING;
    private List<String> photoUrls = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructors
    public Issue() {
        this.createdAt = LocalDateTime.now();
    }
    
    public Issue(String userId, IssueCategory category, String description) {
        this();
        this.userId = userId;
        this.category = category;
        this.description = description;
    }
    
    // Getters and Setters
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
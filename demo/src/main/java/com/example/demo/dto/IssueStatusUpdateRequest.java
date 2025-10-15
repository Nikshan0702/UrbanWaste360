// IssueStatusUpdateRequest.java
package com.example.demo.dto;

import com.example.demo.entity.IssueStatus;
import jakarta.validation.constraints.NotNull;

public class IssueStatusUpdateRequest {
    
    @NotNull(message = "Status is required")
    private IssueStatus status;
    
    private String adminNotes;
    
    // Constructors
    public IssueStatusUpdateRequest() {}
    
    public IssueStatusUpdateRequest(IssueStatus status) {
        this.status = status;
    }
    
    public IssueStatusUpdateRequest(IssueStatus status, String adminNotes) {
        this.status = status;
        this.adminNotes = adminNotes;
    }
    
    // Getters and Setters (MUST HAVE GETTER FOR status)
    public IssueStatus getStatus() { 
        return status; 
    }
    
    public void setStatus(IssueStatus status) { 
        this.status = status; 
    }
    
    public String getAdminNotes() { 
        return adminNotes; 
    }
    
    public void setAdminNotes(String adminNotes) { 
        this.adminNotes = adminNotes; 
    }
}
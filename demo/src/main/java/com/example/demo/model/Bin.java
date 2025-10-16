package com.example.demo.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("bins")
public class Bin {
    @Id
    private String id;
    private String binId; 
    private String location;
    private String status;
    private String assignedCollectorId = "COL001";
    public Bin() {}
    
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBinId() { return binId; }
    public void setBinId(String binId) { this.binId = binId; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAssignedCollectorId() { return assignedCollectorId; }
    public void setAssignedCollectorId(String assignedCollectorId) { this.assignedCollectorId = assignedCollectorId; }
}

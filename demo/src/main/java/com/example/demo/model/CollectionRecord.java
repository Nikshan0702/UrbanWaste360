package com.example.demo.model;


import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.Date;

@Document("collectionRecords")
public class CollectionRecord {
    @Id
    private String id;
    private String binId;
    private String collectorId;
    private String status; // Collected / Missed / Reported-Damage
    private String wastetype;
    private String weight;
    private Date timestamp;
    private String remarks;

    public CollectionRecord() { this.timestamp = Date.from(Instant.now()); }

    // getters & setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBinId() { return binId; }
    public void setBinId(String binId) { this.binId = binId; }

    public String getCollectorId() { return collectorId; }
    public void setCollectorId(String collectorId) { this.collectorId = collectorId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getWastetype() { return wastetype; }
    public void setWastetype(String wastetype) { this.wastetype = wastetype; }

    public String getWeight() { return weight; }
    public void setWeight(String weight) { this.weight = weight; }

    public Date getTimestamp() { return timestamp; }
    public void setTimestamp(Date timestamp) { this.timestamp = timestamp; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}


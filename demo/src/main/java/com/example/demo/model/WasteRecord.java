package com.example.SpringbootProject.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "waste_records")
public class WasteRecord {
    @Id
    private String id;

    private String residentId;
    private String date;     // ISO date: "2025-10-12"
    private String type;     // Organic | Plastic | Paper | Glass | Metal | Other
    private double quantity; // e.g., 3.4
    private String unit;     // kg | L
    private String source;   // smart-bin | manual
    private String notes;

    public WasteRecord() {}


    // getters & setters
    public String getId()
    {
        return id;
    }
    public void setId(String id)
    {
        this.id = id;
    }

    public String getResidentId()
    {
        return residentId;
    }

    public void setResidentId(String residentId)
    {
        this.residentId = residentId;
    }

    public String getDate()
    {
        return date;
    }

    public void setDate(String date)
    {
        this.date = date;
    }

    public String getType()
    {
        return type;
    }

    public void setType(String type)
    {
        this.type = type;
    }

    public double getQuantity()
    {
        return quantity;
    }

    public void setQuantity(double quantity)
    {
        this.quantity = quantity;
    }

    public String getUnit()
    {
        return unit;
    }
    public void setUnit(String unit)
    {
        this.unit = unit;
    }

    public String getSource()
    {
        return source;
    }
    public void setSource(String source)
    {
        this.source = source;
    }

    public String getNotes()
    {
        return notes;
    }

    public void setNotes(String notes)
    {
        this.notes = notes;
    }
}

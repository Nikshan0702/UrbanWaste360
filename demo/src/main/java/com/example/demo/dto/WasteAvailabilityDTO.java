// src/main/java/com/example/demo/dto/WasteAvailabilityDTO.java
package com.example.demo.dto;
public class WasteAvailabilityDTO {
    private String type;
    private double availableKg;
    private int unitPriceLkr;
    public WasteAvailabilityDTO() {}
    public WasteAvailabilityDTO(String type, double availableKg, int unitPriceLkr) {
        this.type = type; this.availableKg = availableKg; this.unitPriceLkr = unitPriceLkr;
    }
    public String getType(){return type;} public void setType(String type){this.type=type;}
    public double getAvailableKg(){return availableKg;} public void setAvailableKg(double v){this.availableKg=v;}
    public int getUnitPriceLkr(){return unitPriceLkr;} public void setUnitPriceLkr(int v){this.unitPriceLkr=v;}
}
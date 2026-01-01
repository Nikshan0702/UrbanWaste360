// src/main/java/com/example/demo/dto/CreateSellRequestDTO.java
package com.example.demo.dto;
public class CreateSellRequestDTO {
    private String type;
    private double quantityKg;
    public String getType(){return type;} public void setType(String type){this.type=type;}
    public double getQuantityKg(){return quantityKg;} public void setQuantityKg(double q){this.quantityKg=q;}
}
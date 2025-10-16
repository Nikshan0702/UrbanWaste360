// src/main/java/com/example/demo/dto/UpdateSellRequestStatusDTO.java
package com.example.demo.dto;
public class UpdateSellRequestStatusDTO {
    private String status;      // COLLECTED | REJECTED
    private Double collectedKg; // optional; defaults to original qty
    public String getStatus(){return status;} public void setStatus(String s){this.status=s;}
    public Double getCollectedKg(){return collectedKg;} public void setCollectedKg(Double c){this.collectedKg=c;}
}
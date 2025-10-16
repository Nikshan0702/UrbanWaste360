// src/main/java/com/example/demo/dto/AddChargeDTO.java
package com.example.demo.dto;
public class AddChargeDTO {
    private String residentId;
    private double amount;
    private String reason;
    public String getResidentId(){return residentId;} public void setResidentId(String r){this.residentId=r;}
    public double getAmount(){return amount;} public void setAmount(double a){this.amount=a;}
    public String getReason(){return reason;} public void setReason(String r){this.reason=r;}
}
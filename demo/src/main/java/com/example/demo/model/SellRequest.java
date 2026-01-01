// src/main/java/com/example/demo/model/SellRequest.java
package com.example.demo.model;
import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "sell_requests")
public class SellRequest {
    @Id private String id;
    private String residentId;
    private String type;
    private double quantityKg;
    private String status; // PENDING | COLLECTED | REJECTED
    private int unitPriceLkr;
    private double creditedAmount; // computed on COLLECTED
    private Double collectedKg;    // actual collected
    private Instant createdAt;
    private Instant updatedAt;

    public String getId(){return id;} public void setId(String id){this.id=id;}
    public String getResidentId(){return residentId;} public void setResidentId(String r){this.residentId=r;}
    public String getType(){return type;} public void setType(String t){this.type=t;}
    public double getQuantityKg(){return quantityKg;} public void setQuantityKg(double q){this.quantityKg=q;}
    public String getStatus(){return status;} public void setStatus(String s){this.status=s;}
    public int getUnitPriceLkr(){return unitPriceLkr;} public void setUnitPriceLkr(int p){this.unitPriceLkr=p;}
    public double getCreditedAmount(){return creditedAmount;} public void setCreditedAmount(double a){this.creditedAmount=a;}
    public Double getCollectedKg(){return collectedKg;} public void setCollectedKg(Double c){this.collectedKg=c;}
    public Instant getCreatedAt(){return createdAt;} public void setCreatedAt(Instant i){this.createdAt=i;}
    public Instant getUpdatedAt(){return updatedAt;} public void setUpdatedAt(Instant i){this.updatedAt=i;}
}
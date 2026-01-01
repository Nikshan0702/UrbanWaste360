// src/main/java/com/example/demo/dto/SettlePaymentRequestDTO.java
package com.example.demo.dto;
public class SettlePaymentRequestDTO {
    private Double amount;        // was double
    private String method;        // "WALLET" or "CARD"
    private String cardToken;     // optional for WALLET
    public double getAmount(){return amount;} public void setAmount(double a){this.amount=a;}
    public String getMethod(){return method;} public void setMethod(String m){this.method=m;}
    public String getCardToken(){return cardToken;} public void setCardToken(String t){this.cardToken=t;}
}
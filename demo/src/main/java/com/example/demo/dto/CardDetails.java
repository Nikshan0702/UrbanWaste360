package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;

public class CardDetails {
    @NotBlank(message = "Card number is required")
    private String cardNumber;
    
    @NotBlank(message = "Expiry date is required")
    private String expiryDate;
    
    @NotBlank(message = "CVV is required")
    private String cvv;
    
    @NotBlank(message = "Card holder name is required")
    private String cardHolderName;

    public CardDetails() {}

    // Getters and Setters
    public String getCardNumber() { return cardNumber; }
    public void setCardNumber(String cardNumber) { this.cardNumber = cardNumber; }

    public String getExpiryDate() { return expiryDate; }
    public void setExpiryDate(String expiryDate) { this.expiryDate = expiryDate; }

    public String getCvv() { return cvv; }
    public void setCvv(String cvv) { this.cvv = cvv; }

    public String getCardHolderName() { return cardHolderName; }
    public void setCardHolderName(String cardHolderName) { this.cardHolderName = cardHolderName; }
}
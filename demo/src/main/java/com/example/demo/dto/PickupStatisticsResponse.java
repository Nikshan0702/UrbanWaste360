// PickupStatisticsResponse.java
package com.example.demo.dto;

public class PickupStatisticsResponse {
    
    private int totalPickups;
    private int scheduledPickups;
    private int inProgressPickups;
    private int completedPickups;
    private int cancelledPickups;
    private double totalRevenue;
    private int pendingPayments;
    
    // Constructors
    public PickupStatisticsResponse() {}
    
    public PickupStatisticsResponse(int totalPickups, int scheduledPickups, int completedPickups) {
        this.totalPickups = totalPickups;
        this.scheduledPickups = scheduledPickups;
        this.completedPickups = completedPickups;
    }
    
    // Getters and Setters
    public int getTotalPickups() { return totalPickups; }
    public void setTotalPickups(int totalPickups) { this.totalPickups = totalPickups; }
    
    public int getScheduledPickups() { return scheduledPickups; }
    public void setScheduledPickups(int scheduledPickups) { this.scheduledPickups = scheduledPickups; }
    
    public int getInProgressPickups() { return inProgressPickups; }
    public void setInProgressPickups(int inProgressPickups) { this.inProgressPickups = inProgressPickups; }
    
    public int getCompletedPickups() { return completedPickups; }
    public void setCompletedPickups(int completedPickups) { this.completedPickups = completedPickups; }
    
    public int getCancelledPickups() { return cancelledPickups; }
    public void setCancelledPickups(int cancelledPickups) { this.cancelledPickups = cancelledPickups; }
    
    public double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }
    
    public int getPendingPayments() { return pendingPayments; }
    public void setPendingPayments(int pendingPayments) { this.pendingPayments = pendingPayments; }
}
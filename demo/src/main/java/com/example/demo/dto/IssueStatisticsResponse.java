// IssueStatisticsResponse.java
package com.example.demo.dto;

public class IssueStatisticsResponse {
    private long totalIssues;
    private long pendingIssues;
    private long inProgressIssues;
    private long resolvedIssues;
    private long issuesThisMonth;
    
    // Default constructor
    public IssueStatisticsResponse() {}
    
    // Parameterized constructor
    public IssueStatisticsResponse(long totalIssues, long pendingIssues, long inProgressIssues, 
                                 long resolvedIssues, long issuesThisMonth) {
        this.totalIssues = totalIssues;
        this.pendingIssues = pendingIssues;
        this.inProgressIssues = inProgressIssues;
        this.resolvedIssues = resolvedIssues;
        this.issuesThisMonth = issuesThisMonth;
    }
    
    // Getters and Setters (ALL SETTERS MUST BE PRESENT)
    public long getTotalIssues() { return totalIssues; }
    public void setTotalIssues(long totalIssues) { this.totalIssues = totalIssues; }
    
    public long getPendingIssues() { return pendingIssues; }
    public void setPendingIssues(long pendingIssues) { this.pendingIssues = pendingIssues; }
    
    public long getInProgressIssues() { return inProgressIssues; }
    public void setInProgressIssues(long inProgressIssues) { this.inProgressIssues = inProgressIssues; }
    
    public long getResolvedIssues() { return resolvedIssues; }
    public void setResolvedIssues(long resolvedIssues) { this.resolvedIssues = resolvedIssues; }
    
    public long getIssuesThisMonth() { return issuesThisMonth; }
    public void setIssuesThisMonth(long issuesThisMonth) { this.issuesThisMonth = issuesThisMonth; }
}
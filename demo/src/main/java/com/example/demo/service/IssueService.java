// IssueService.java
package com.example.demo.service;

import com.example.demo.dto.IssueRequest;
import com.example.demo.dto.IssueResponse;
import com.example.demo.dto.IssueStatisticsResponse;
import com.example.demo.dto.IssueStatusUpdateRequest;
import com.example.demo.entity.IssueStatus;

import java.util.List;

public interface IssueService {
    IssueResponse reportIssue(IssueRequest request);
    List<IssueResponse> getUserIssues(String userId);
    List<IssueResponse> getAllIssues();
    IssueResponse getIssueById(String id);
    IssueResponse updateIssueStatus(String id, IssueStatusUpdateRequest request);
    IssueStatisticsResponse getIssueStatistics();
    List<IssueResponse> getIssuesByStatus(IssueStatus status);
}
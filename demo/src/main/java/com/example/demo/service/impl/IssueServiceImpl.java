package com.example.demo.service.impl;

import com.example.demo.dto.IssueRequest;
import com.example.demo.dto.IssueResponse;
import com.example.demo.dto.IssueStatisticsResponse;
import com.example.demo.dto.IssueStatusUpdateRequest;
import com.example.demo.entity.Issue;
import com.example.demo.entity.IssueCategory;
import com.example.demo.entity.IssueStatus;
import com.example.demo.repository.IssueRepository;
import com.example.demo.service.IssueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class IssueServiceImpl implements IssueService {

    private final IssueRepository issueRepository;

    @Autowired
    public IssueServiceImpl(IssueRepository issueRepository) {
        this.issueRepository = issueRepository;
    }

    @Override
    public IssueResponse reportIssue(IssueRequest request) {
        // Convert string category to enum
        IssueCategory category;
        try {
            category = IssueCategory.valueOf(request.getCategory().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid issue category: " + request.getCategory());
        }

        Issue issue = new Issue();
        issue.setUserId(request.getUserId());
        issue.setCategory(category);
        issue.setDescription(request.getDescription());
        issue.setLocation(request.getLocation());
        issue.setAnonymous(request.isAnonymous());
        issue.setUseGPSLocation(request.isUseGPSLocation());
        issue.setStatus(IssueStatus.PENDING);
        issue.setCreatedAt(LocalDateTime.now());
        
        Issue savedIssue = issueRepository.save(issue);
        return mapToResponse(savedIssue);
    }

    @Override
    public List<IssueResponse> getUserIssues(String userId) {
        List<Issue> issues = issueRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return issues.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<IssueResponse> getAllIssues() {
        List<Issue> issues = issueRepository.findAllByOrderByCreatedAtDesc();
        return issues.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public IssueResponse getIssueById(String id) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue not found with id: " + id));
        return mapToResponse(issue);
    }

    @Override
    public IssueResponse updateIssueStatus(String id, IssueStatusUpdateRequest request) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue not found with id: " + id));
        
        issue.setStatus(request.getStatus());
        issue.setUpdatedAt(LocalDateTime.now());
        
        Issue updatedIssue = issueRepository.save(issue);
        return mapToResponse(updatedIssue);
    }

    @Override
    public IssueStatisticsResponse getIssueStatistics() {
        IssueStatisticsResponse stats = new IssueStatisticsResponse();
        stats.setTotalIssues(issueRepository.count());
        stats.setPendingIssues(issueRepository.countByStatus(IssueStatus.PENDING));
        stats.setInProgressIssues(issueRepository.countByStatus(IssueStatus.IN_PROGRESS));
        stats.setResolvedIssues(issueRepository.countByStatus(IssueStatus.RESOLVED));
        stats.setIssuesThisMonth(issueRepository.countIssuesThisMonth());
        return stats;
    }

    @Override
    public List<IssueResponse> getIssuesByStatus(IssueStatus status) {
        List<Issue> issues = issueRepository.findByStatusOrderByCreatedAtDesc(status);
        return issues.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private IssueResponse mapToResponse(Issue issue) {
        IssueResponse response = new IssueResponse();
        response.setId(issue.getId());
        response.setUserId(issue.getUserId());
        response.setCategory(issue.getCategory());
        response.setDescription(issue.getDescription());
        response.setLocation(issue.getLocation());
        response.setAnonymous(issue.isAnonymous());
        response.setUseGPSLocation(issue.isUseGPSLocation());
        response.setStatus(issue.getStatus());
        response.setPhotoUrls(issue.getPhotoUrls());
        response.setCreatedAt(issue.getCreatedAt());
        response.setUpdatedAt(issue.getUpdatedAt());
        return response;
    }
}

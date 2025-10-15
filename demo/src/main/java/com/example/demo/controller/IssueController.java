// IssueController.java
package com.example.demo.controller;

import com.example.demo.dto.IssueRequest;
import com.example.demo.dto.IssueResponse;
import com.example.demo.dto.IssueStatisticsResponse;
import com.example.demo.dto.IssueStatusUpdateRequest;
import com.example.demo.entity.IssueStatus;
import com.example.demo.service.IssueService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
public class IssueController {

    private final IssueService issueService;

    @Autowired
    public IssueController(IssueService issueService) {
        this.issueService = issueService;
    }

    @PostMapping("/report")
    public ResponseEntity<IssueResponse> reportIssue(@Valid @RequestBody IssueRequest request) {
        IssueResponse response = issueService.reportIssue(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<IssueResponse>> getUserIssues(@PathVariable String userId) {
        List<IssueResponse> issues = issueService.getUserIssues(userId);
        return ResponseEntity.ok(issues);
    }

    @GetMapping("/all")
    public ResponseEntity<List<IssueResponse>> getAllIssues() {
        List<IssueResponse> issues = issueService.getAllIssues();
        return ResponseEntity.ok(issues);
    }

    @GetMapping("/{id}")
    public ResponseEntity<IssueResponse> getIssueById(@PathVariable String id) { // Changed to String
        IssueResponse issue = issueService.getIssueById(id);
        return ResponseEntity.ok(issue);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<IssueResponse> updateIssueStatus(
            @PathVariable String id, // Changed to String
            @Valid @RequestBody IssueStatusUpdateRequest request) {
        IssueResponse updatedIssue = issueService.updateIssueStatus(id, request);
        return ResponseEntity.ok(updatedIssue);
    }

    @GetMapping("/statistics")
    public ResponseEntity<IssueStatisticsResponse> getIssueStatistics() {
        IssueStatisticsResponse statistics = issueService.getIssueStatistics();
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<IssueResponse>> getIssuesByStatus(@PathVariable IssueStatus status) {
        List<IssueResponse> issues = issueService.getIssuesByStatus(status);
        return ResponseEntity.ok(issues);
    }
}
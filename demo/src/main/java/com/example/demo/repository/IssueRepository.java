// IssueRepository.java
package com.example.demo.repository;

import com.example.demo.entity.Issue;
import com.example.demo.entity.IssueStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface IssueRepository extends MongoRepository<Issue, String> {
    
    // Find all issues by user ID, ordered by creation date descending
    List<Issue> findByUserIdOrderByCreatedAtDesc(String userId);
    
    // Find all issues ordered by creation date descending
    List<Issue> findAllByOrderByCreatedAtDesc();
    
    // Find issues by status, ordered by creation date descending
    List<Issue> findByStatusOrderByCreatedAtDesc(IssueStatus status);
    
    // Count issues by status
    long countByStatus(IssueStatus status);
    
    // Count issues created this month
    @Query(value = "{ 'createdAt' : { $gte: ?0, $lt: ?1 } }", count = true)
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    // Helper method to count issues this month
    default long countIssuesThisMonth() {
        LocalDateTime start = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime end = start.plusMonths(1);
        return countByCreatedAtBetween(start, end);
    }
}
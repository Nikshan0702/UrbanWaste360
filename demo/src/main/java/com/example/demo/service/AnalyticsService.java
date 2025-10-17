package com.example.demo.service;

import java.util.List;
import java.util.Map;

/**
 * Service interface for analytics operations following Single Responsibility Principle
 */
public interface AnalyticsService {
    
    /**
     * Get system-wide analytics data
     * @return Map containing analytics metrics
     */
    Map<String, Object> getSystemAnalytics();
    
    /**
     * Get waste aggregation by type
     * @param residentId Optional filter by resident
     * @return List of waste type aggregations
     */
    List<Map<String, Object>> getWasteByType(String residentId);
    
    /**
     * Get waste aggregation by month
     * @param residentId Optional filter by resident
     * @return List of monthly waste aggregations
     */
    List<Map<String, Object>> getWasteByMonth(String residentId);
    
    /**
     * Get user performance metrics
     * @param userId User ID to get metrics for
     * @return Map containing user metrics
     */
    Map<String, Object> getUserMetrics(String userId);
}


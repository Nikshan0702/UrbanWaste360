package com.example.demo.service.impl;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.example.demo.model.WasteRecord;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.AnalyticsService;
import com.example.demo.service.WasteRecordService;

/**
 * Implementation of AnalyticsService following SOLID principles
 * - Single Responsibility: Only handles analytics calculations
 * - Open/Closed: Can be extended without modification
 * - Liskov Substitution: Properly implements AnalyticsService interface
 * - Interface Segregation: Focused interface with specific methods
 * - Dependency Inversion: Depends on abstractions, not concretions
 */
@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private final WasteRecordService wasteRecordService;
    private final UserRepository userRepository;

    public AnalyticsServiceImpl(WasteRecordService wasteRecordService, UserRepository userRepository) {
        this.wasteRecordService = wasteRecordService;
        this.userRepository = userRepository;
    }

    @Override
    public Map<String, Object> getSystemAnalytics() {
        var allRecords = wasteRecordService.list(null, null);
        double totalKg = allRecords.stream()
                .mapToDouble(this::safeQuantity)
                .sum();

        Map<String, Object> analytics = new LinkedHashMap<>();
        analytics.put("totalUsers", userRepository.count());
        analytics.put("totalRequests", allRecords.size());
        analytics.put("collectedKg", Math.round(totalKg));
        analytics.put("completionRate", calculateCompletionRate(allRecords));
        
        return analytics;
    }

    @Override
    public List<Map<String, Object>> getWasteByType(String residentId) {
        List<WasteRecord> records = wasteRecordService.list(residentId, null);
        
        Map<String, Double> typeAggregation = new HashMap<>();
        for (WasteRecord record : records) {
            String type = record.getType() != null ? record.getType() : "Other";
            double quantity = safeQuantity(record);
            typeAggregation.merge(type, quantity, Double::sum);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, Double> entry : typeAggregation.entrySet()) {
            Map<String, Object> item = new HashMap<>();
            item.put("name", entry.getKey());
            item.put("kg", Math.round(entry.getValue() * 100.0) / 100.0);
            result.add(item);
        }
        
        result.sort(Comparator.comparing(item -> String.valueOf(item.get("name"))));
        return result;
    }

    @Override
    public List<Map<String, Object>> getWasteByMonth(String residentId) {
        List<WasteRecord> records = wasteRecordService.list(residentId, null);
        
        Map<String, Double> monthAggregation = new HashMap<>();
        for (WasteRecord record : records) {
            String monthKey = extractMonthKey(record.getDate());
            double quantity = safeQuantity(record);
            monthAggregation.merge(monthKey, quantity, Double::sum);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, Double> entry : monthAggregation.entrySet()) {
            Map<String, Object> item = new HashMap<>();
            item.put("month", entry.getKey());
            item.put("kg", Math.round(entry.getValue() * 100.0) / 100.0);
            result.add(item);
        }
        
        result.sort(Comparator.comparing(item -> String.valueOf(item.get("month"))));
        return result;
    }

    @Override
    public Map<String, Object> getUserMetrics(String userId) {
        List<WasteRecord> userRecords = wasteRecordService.list(userId, null);
        
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalRecords", userRecords.size());
        metrics.put("totalKg", userRecords.stream().mapToDouble(this::safeQuantity).sum());
        metrics.put("averageKg", userRecords.isEmpty() ? 0.0 : 
            userRecords.stream().mapToDouble(this::safeQuantity).average().orElse(0.0));
        
        // Calculate waste type distribution for user
        Map<String, Double> typeDistribution = new HashMap<>();
        for (WasteRecord record : userRecords) {
            String type = record.getType() != null ? record.getType() : "Other";
            typeDistribution.merge(type, safeQuantity(record), Double::sum);
        }
        metrics.put("typeDistribution", typeDistribution);
        
        return metrics;
    }

    /**
     * Safely extract quantity from WasteRecord, handling null values
     */
    private double safeQuantity(WasteRecord record) {
        try {
            Double quantity = record.getQuantity();
            return quantity != null ? quantity : 0.0;
        } catch (Exception e) {
            return 0.0;
        }
    }

    /**
     * Extract month key from date string (YYYY-MM format)
     */
    private String extractMonthKey(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) {
            return "Unknown";
        }
        
        try {
            LocalDate date = LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE);
            return date.getYear() + "-" + String.format("%02d", date.getMonthValue());
        } catch (Exception e) {
            // Fallback: try to extract YYYY-MM from string
            if (dateStr.length() >= 7 && dateStr.charAt(4) == '-') {
                return dateStr.substring(0, 7);
            }
            return "Unknown";
        }
    }

    /**
     * Calculate completion rate based on waste records
     */
    private int calculateCompletionRate(List<WasteRecord> records) {
        if (records.isEmpty()) {
            return 0;
        }
        
        // This is a simplified calculation - in a real system, you'd have status tracking
        // For now, we'll assume all records are "completed" since they exist
        return 100;
    }
}


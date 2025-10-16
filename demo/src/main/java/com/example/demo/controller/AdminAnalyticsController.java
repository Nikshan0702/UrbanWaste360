// src/main/java/com/example/demo/controller/AdminAnalyticsController.java
package com.example.demo.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.SellRequestViewDTO;
import com.example.demo.ports.WasteSaleService;
import com.example.demo.service.WasteRecordService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class AdminAnalyticsController {

    private final WasteSaleService saleService;
    private final WasteRecordService wasteRecordService;

    @Value("${app.security.enabled:true}")
    private boolean securityEnabled;

    public AdminAnalyticsController(WasteSaleService saleService, WasteRecordService wasteRecordService) {
        this.saleService = saleService;
        this.wasteRecordService = wasteRecordService;
    }

    private boolean isAdmin() {
        if (!securityEnabled) return true;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }

    @GetMapping("/analytics")
    public ResponseEntity<?> overview() {
        if (!isAdmin()) return ResponseEntity.status(403).body("Access denied");

        // Basic counts from Sell Requests (if service provides listAll)
        List<SellRequestViewDTO> all = saleService.listAll(null);
        long pending = all.stream().filter(r -> "PENDING".equalsIgnoreCase(r.getStatus())).count();
        long collected = all.stream().filter(r -> "COLLECTED".equalsIgnoreCase(r.getStatus())).count();
        long rejected = all.stream().filter(r -> "REJECTED".equalsIgnoreCase(r.getStatus())).count();
        long total = all.size();

        double collectedKg = all.stream()
                .filter(r -> "COLLECTED".equalsIgnoreCase(r.getStatus()))
                .mapToDouble(r -> Optional.ofNullable(r.getCollectedKg()).orElse(Optional.ofNullable(r.getQuantityKg()).orElse(0.0)))
                .sum();

        int completionRate = total > 0 ? (int)Math.round((collected * 100.0) / total) : 0;

        Map<String,Object> out = new HashMap<>();
        out.put("totalRequests", total);
        out.put("collectedKg", Math.round(collectedKg));
        out.put("completionRate", completionRate);

        // Optional: total users if you have a quick way (leave to the UI if not)
        return ResponseEntity.ok(out);
    }
}
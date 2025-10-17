package com.example.demo.controller;

import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.model.WasteRecord;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.AnalyticsService;
import com.example.demo.service.WasteRecordService;

@RestController
@RequestMapping("/api/admin/records")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class AdminRecordsController {

    private final WasteRecordService service;
    private final UserRepository userRepository;
    private final AnalyticsService analyticsService;

    @Value("${app.security.enabled:true}")
    private boolean securityEnabled;

    public AdminRecordsController(WasteRecordService service, UserRepository userRepository, AnalyticsService analyticsService) {
        this.service = service;
        this.userRepository = userRepository;
        this.analyticsService = analyticsService;
    }

    private void ensureAdmin(Principal principal){
        if (!securityEnabled) return; // dev mode open
        if (principal == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        var u = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        if (!"ADMIN".equalsIgnoreCase(u.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin only");
        }
    }

    /** All waste records (optionally filter by residentId) */
    @GetMapping("/waste")
    public List<WasteRecord> list(Principal principal, @RequestParam(required = false) String residentId) {
        ensureAdmin(principal);
        return service.list(residentId, null);
    }

    /** Aggregate by type (all users or specific resident) */
    @GetMapping("/waste/aggregate/by-type")
    public List<Map<String,Object>> aggregateByType(Principal principal,
                                                    @RequestParam(required = false) String residentId) {
        ensureAdmin(principal);
        return analyticsService.getWasteByType(residentId);
    }

    /** Aggregate by month (YYYY-MM), tolerant of String dates like "2025-10-17" */
    @GetMapping("/waste/aggregate/by-month")
    public List<Map<String,Object>> aggregateByMonth(Principal principal,
                                                     @RequestParam(required = false) String residentId) {
        ensureAdmin(principal);
        return analyticsService.getWasteByMonth(residentId);
    }

    /** Per-resident list (explicit) */
    @GetMapping("/waste/by-resident")
    public List<WasteRecord> listByResident(Principal principal, @RequestParam String residentId) {
        ensureAdmin(principal);
        return service.list(residentId, null);
    }

    /** Simple system-wide analytics (can be expanded) */
    @GetMapping("/analytics")
    public Map<String,Object> analytics(Principal principal) {
        ensureAdmin(principal);
        return analyticsService.getSystemAnalytics();
    }

}
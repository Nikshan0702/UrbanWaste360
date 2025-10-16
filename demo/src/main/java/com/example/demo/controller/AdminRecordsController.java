package com.example.demo.controller;

import java.security.Principal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
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
import com.example.demo.service.WasteRecordService;

@RestController
@RequestMapping("/api/admin/records")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class AdminRecordsController {

    private final WasteRecordService service;
    private final UserRepository userRepository;

    @Value("${app.security.enabled:true}")
    private boolean securityEnabled;

    public AdminRecordsController(WasteRecordService service, UserRepository userRepository) {
        this.service = service;
        this.userRepository = userRepository;
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
        List<WasteRecord> records = service.list(residentId, null);

        Map<String, Double> sums = new HashMap<>();
        for (WasteRecord r : records) {
            String t = r.getType() == null ? "Other" : r.getType();
            double q = safeQuantity(r);
            sums.put(t, sums.getOrDefault(t, 0.0) + q);
        }

        List<Map<String,Object>> out = new ArrayList<>();
        for (var e : sums.entrySet()) {
            Map<String,Object> row = new HashMap<>();
            row.put("name", e.getKey());
            row.put("kg", Math.round(e.getValue() * 100.0) / 100.0);
            out.add(row);
        }
        out.sort(Comparator.comparing(o -> String.valueOf(o.get("name"))));
        return out;
    }

    /** Aggregate by month (YYYY-MM), tolerant of String dates like "2025-10-17" */
    @GetMapping("/waste/aggregate/by-month")
    public List<Map<String,Object>> aggregateByMonth(Principal principal,
                                                     @RequestParam(required = false) String residentId) {
        ensureAdmin(principal);
        List<WasteRecord> records = service.list(residentId, null);

        Map<String, Double> map = new HashMap<>();
        for (WasteRecord r : records) {
            String key = monthKeyFromDateString(r.getDate());
            double q = safeQuantity(r);
            map.put(key, map.getOrDefault(key, 0.0) + q);
        }

        List<Map<String,Object>> out = new ArrayList<>();
        for (var e : map.entrySet()) {
            Map<String,Object> row = new HashMap<>();
            row.put("month", e.getKey());
            row.put("kg", Math.round(e.getValue() * 100.0) / 100.0);
            out.add(row);
        }
        out.sort(Comparator.comparing(o -> String.valueOf(o.get("month"))));
        return out;
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
        var all = service.list(null, null);
        double totalKg = 0.0;
        for (var w : all) {
            totalKg += safeQuantity(w);
        }
        Map<String,Object> res = new LinkedHashMap<>();
        res.put("totalUsers", userRepository.count());
        res.put("totalRequests", all.size());         // or sell-requests count
        res.put("collectedKg", Math.round(totalKg));
        res.put("completionRate", 0);
        return res;
    }

    /* ---------- helpers ---------- */

    /** Works whether WasteRecord#getQuantity returns double or Double */
    private double safeQuantity(WasteRecord r) {
        try {
            // If it's a primitive getter, autoboxing returns non-null
            Double boxed = r.getQuantity();
            return boxed != null ? boxed : 0.0;
        } catch (Exception ignore) {
            // If there is some other shape, last resort:
            return 0.0;
        }
    }

    /** Convert "YYYY-MM-DD" (or any string) to "YYYY-MM"; otherwise "Unknown" */
    private String monthKeyFromDateString(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return "Unknown";
        try {
            LocalDate ld = LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE);
            return ld.getYear() + "-" + String.format("%02d", ld.getMonthValue());
        } catch (Exception ignore) {
            // Fallback: try first 7 chars yyyy-MM
            if (dateStr.length() >= 7 && dateStr.charAt(4) == '-') {
                return dateStr.substring(0, 7);
            }
            return "Unknown";
        }
    }
}
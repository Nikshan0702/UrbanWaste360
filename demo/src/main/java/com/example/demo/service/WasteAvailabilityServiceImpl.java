package com.example.demo.service;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.demo.dto.WasteAvailabilityDTO;
import com.example.demo.model.SellRequest;
import com.example.demo.model.WasteRecord;
import com.example.demo.ports.PricingService;
import com.example.demo.ports.WasteAvailabilityService;
import com.example.demo.repository.SellRequestRepository;

@Service
public class WasteAvailabilityServiceImpl implements WasteAvailabilityService {
    private final WasteRecordService recordService;
    private final SellRequestRepository sellRepo;
    private final PricingService pricing;

    public WasteAvailabilityServiceImpl(WasteRecordService rs, SellRequestRepository sr, PricingService pricing){
        this.recordService = rs; this.sellRepo = sr; this.pricing = pricing;
    }

    @Override
    public List<WasteAvailabilityDTO> availableForResident(String residentId) {
        // total recorded per type
        List<WasteRecord> records = recordService.byResident(residentId);
        Map<String, Double> total = new HashMap<>();
        for (var r : records) {
            if (!"kg".equalsIgnoreCase(r.getUnit())) continue; // keep simple
            total.merge(r.getType(), r.getQuantity(), Double::sum);
        }
        // subtract pending + collected from sell requests
        List<SellRequest> sells = sellRepo.findByResidentIdOrderByCreatedAtDesc(residentId);
        Map<String, Double> reserved = new HashMap<>();
        for (var s : sells) {
            if ("PENDING".equals(s.getStatus())) {
                reserved.merge(s.getType(), s.getQuantityKg(), Double::sum);
            } else if ("COLLECTED".equals(s.getStatus())) {
                double c = s.getCollectedKg() != null ? s.getCollectedKg() : s.getQuantityKg();
                reserved.merge(s.getType(), c, Double::sum);
            }
        }
        // availability = total - reserved
        Set<String> keys = new HashSet<>();
        keys.addAll(total.keySet());
        keys.addAll(reserved.keySet());
        return keys.stream()
            .map(k -> new WasteAvailabilityDTO(
                k,
                Math.max(0.0, total.getOrDefault(k,0.0) - reserved.getOrDefault(k,0.0)),
                Math.max(pricing.pricePerKg(k), 0)
            ))
            .sorted(Comparator.comparing(WasteAvailabilityDTO::getType))
            .collect(Collectors.toList());
    }
}
// src/main/java/com/example/demo/service/impl/SpecialPickupServiceImpl.java
package com.example.demo.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.dto.ApproveAssignRequest;
import com.example.demo.dto.PickupSlotResponse;
import com.example.demo.dto.PickupStatisticsResponse;
import com.example.demo.dto.PickupStatusUpdateRequest;
import com.example.demo.dto.SpecialPickupRequest;
import com.example.demo.dto.SpecialPickupResponse;
import com.example.demo.entity.SpecialPickup;
import com.example.demo.ports.PaymentService;
import com.example.demo.repository.SpecialPickupRepository;
import com.example.demo.service.SpecialPickupService;


@Service
public class SpecialPickupServiceImpl implements SpecialPickupService {

    private final SpecialPickupRepository pickupRepository;
    private final PaymentService paymentService;

    public SpecialPickupServiceImpl(SpecialPickupRepository pickupRepository, PaymentService paymentService) {
        this.pickupRepository = pickupRepository;
        this.paymentService = paymentService;
    }

    @Override
    public SpecialPickupResponse schedulePickup(SpecialPickupRequest request) {
        String pickupId = "PICKUP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        SpecialPickup pickup = new SpecialPickup();
        pickup.setUserId(request.getUserId());
        pickup.setWasteType(request.getWasteType());
        pickup.setPickupDate(request.getPickupDate());
        pickup.setPickupTime(request.getPickupTime());
        pickup.setDescription(request.getDescription());
        pickup.setLocation(request.getLocation());
        pickup.setSpecialInstructions(request.getSpecialInstructions());
        pickup.setUrgency(request.getUrgency());
        pickup.setPhotoUrls(request.getPhotoUrls());
        pickup.setPrice(request.getPrice());
        pickup.setStatus("SCHEDULED");
        pickup.setPickupId(pickupId);
        pickup.setCreatedAt(LocalDateTime.now());
        pickup.setUpdatedAt(LocalDateTime.now());

        return mapToResponse(pickupRepository.save(pickup));
    }

    @Override
    public List<PickupSlotResponse> getAvailableSlots() {
        List<PickupSlotResponse> slots = new ArrayList<>();
        LocalDate today = LocalDate.now();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (int i = 1; i <= 7; i++) {
            LocalDate date = today.plusDays(i);
            if (date.getDayOfWeek().getValue() < 6) {
                List<String> availableTimes = List.of("09:00", "11:00", "14:00", "16:00");
                List<String> bookedTimes = getBookedTimesForDate(date.format(fmt));
                List<String> finalTimes = new ArrayList<>(availableTimes);
                finalTimes.removeAll(bookedTimes);
                if (!finalTimes.isEmpty()) {
                    slots.add(new PickupSlotResponse(date.format(fmt), finalTimes));
                }
            }
        }
        return slots;
    }

    private List<String> getBookedTimesForDate(String date) {
        List<SpecialPickup> pickups = pickupRepository.findByPickupDateAndStatus(date, "SCHEDULED");
        List<String> booked = new ArrayList<>();
        for (SpecialPickup p : pickups) booked.add(p.getPickupTime());
        return booked;
    }

    @Override
    public List<SpecialPickupResponse> getUserPickups(String userId) {
        return pickupRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::mapToResponse).toList();
    }

    @Override
    public List<SpecialPickupResponse> getAllPickups() {
        return pickupRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::mapToResponse).toList();
    }

    @Override
    public SpecialPickupResponse getPickupById(String id) {
        return pickupRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pickup not found with id: " + id));
    }

    @Override
public SpecialPickupResponse updatePickupStatus(String id, PickupStatusUpdateRequest request) {
    SpecialPickup pickup = pickupRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pickup not found with id: " + id));

    String target = normalizeStatus(request.getStatus());
    String current = pickup.getStatus();

    System.out.println("🔄 Status update - From: " + current + " To: " + target);

    if (!isTransitionAllowed(current, target)) {
        throw new ResponseStatusException(HttpStatus.CONFLICT, 
            "Invalid status transition from " + current + " to " + target);
    }

    // Store old status for comparison
    String oldStatus = pickup.getStatus();
    
    pickup.setStatus(target);
    pickup.setNotes(request.getNotes());
    if (request.getAssignedCrewId() != null && !request.getAssignedCrewId().isBlank()) {
        pickup.setAssignedCrewId(request.getAssignedCrewId());
    }
    pickup.setUpdatedAt(LocalDateTime.now());

    SpecialPickup saved = pickupRepository.save(pickup);
    
    // Check if status changed to COMPLETED and add payment charge
    if ("COMPLETED".equals(target) && !"COMPLETED".equals(oldStatus)) {
        try {
            String reference = "PICKUP-" + saved.getPickupId();
            paymentService.addPayment(saved.getUserId(), saved.getPrice(), reference);
            System.out.println("💰 Payment charge added for completed pickup: " + reference + ", Amount: " + saved.getPrice());
        } catch (Exception e) {
            System.err.println("❌ Failed to add payment charge for completed pickup: " + e.getMessage());
            // Don't throw exception here to avoid breaking the status update
        }
    }
    
    System.out.println("✅ Status updated successfully to: " + saved.getStatus());
    
    return mapToResponse(saved);
}

    @Override
    public SpecialPickupResponse cancelPickup(String id) {
        SpecialPickup pickup = pickupRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pickup not found with id: " + id));
        pickup.setStatus("CANCELLED");
        pickup.setUpdatedAt(LocalDateTime.now());
        return mapToResponse(pickupRepository.save(pickup));
    }

    @Override
    public List<SpecialPickupResponse> getPickupsByStatus(String status) {
        return pickupRepository.findByStatusOrderByCreatedAtDesc(status)
                .stream().map(this::mapToResponse).toList();
    }

    @Override
    public PickupStatisticsResponse getPickupStatistics() {
        List<SpecialPickup> all = pickupRepository.findAll();

        int total = all.size();
        int scheduled = (int) all.stream().filter(p -> "SCHEDULED".equals(p.getStatus())).count();
        int approved  = (int) all.stream().filter(p -> "APPROVED".equals(p.getStatus())).count();
        int inProg    = (int) all.stream().filter(p -> "IN_PROGRESS".equals(p.getStatus())).count();
        int completed = (int) all.stream().filter(p -> "COMPLETED".equals(p.getStatus())).count();
        int cancelled = (int) all.stream().filter(p -> "CANCELLED".equals(p.getStatus())).count();

        double totalRevenue = all.stream()
                .filter(p -> "COMPLETED".equals(p.getStatus()))
                .mapToDouble(SpecialPickup::getPrice).sum();

        PickupStatisticsResponse s = new PickupStatisticsResponse();
        s.setTotalPickups(total);
        s.setScheduledPickups(scheduled);
        s.setInProgressPickups(inProg);
        s.setCompletedPickups(completed);
        s.setCancelledPickups(cancelled);
        s.setTotalRevenue(totalRevenue);
        s.setPendingPayments(approved); // approved => outstanding exists
        return s;
    }

    @Override
    public List<SpecialPickupResponse> getCrewAssignedPickups(String crewId) {
        List<SpecialPickup> a = pickupRepository.findByAssignedCrewIdAndStatusOrderByCreatedAtDesc(crewId, "SCHEDULED");
        List<SpecialPickup> b = pickupRepository.findByAssignedCrewIdAndStatusOrderByCreatedAtDesc(crewId, "APPROVED");
        List<SpecialPickup> c = pickupRepository.findByAssignedCrewIdAndStatusOrderByCreatedAtDesc(crewId, "IN_PROGRESS");
        List<SpecialPickup> d = pickupRepository.findByAssignedCrewIdAndStatusOrderByCreatedAtDesc(crewId, "ASSIGNED");

        List<SpecialPickup> all = new ArrayList<>();
        all.addAll(a); all.addAll(b); all.addAll(c);all.addAll(d);
        return all.stream().map(this::mapToResponse).toList();
    }

    @Override
    public SpecialPickupResponse assignToCrew(String pickupId, String crewId) {
        SpecialPickup pickup = pickupRepository.findById(pickupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pickup not found with id: " + pickupId));
        pickup.setAssignedCrewId(crewId);
        if ("SCHEDULED".equals(pickup.getStatus())) {
            pickup.setStatus("IN_PROGRESS");
        }
        pickup.setUpdatedAt(LocalDateTime.now());
        return mapToResponse(pickupRepository.save(pickup));
    }

    @Override
    @Transactional
    public SpecialPickupResponse approveAndAssign(String pickupId, ApproveAssignRequest req, String approverId) {
        SpecialPickup pickup = pickupRepository.findById(pickupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pickup not found"));

        if (!"SCHEDULED".equalsIgnoreCase(pickup.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Only SCHEDULED pickups can be approved");
        }
        if (req.getCrewId() == null || req.getCrewId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "crewId is required");
        }
        if (req.getPrice() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "price must be > 0");
        }

        pickup.setAssignedCrewId(req.getCrewId());
        pickup.setStatus("ASSIGNED");
        pickup.setNotes(req.getNotes());
        pickup.setPrice(req.getPrice());
        pickup.setUpdatedAt(LocalDateTime.now());
        pickupRepository.save(pickup);

        // Charge now so outstanding appears immediately for payment
        String residentId = pickup.getUserId();
        String reference = "SP-" + pickup.getId();
        paymentService.addCharge(residentId, req.getPrice(), reference);

        return mapToResponse(pickup);
    }

    /* helpers */

    private boolean isTransitionAllowed(String from, String to) {
        if (from == null || to == null) return false;
        if (from.equals(to)) return true;
        return switch (from) {
            case "SCHEDULED"   -> List.of("ASSIGNED","APPROVED", "CANCELLED", "IN_PROGRESS").contains(to);
            case "APPROVED"    -> List.of("IN_PROGRESS", "CANCELLED", "COMPLETED").contains(to);
            case "ASSIGNED"    -> List.of("IN_PROGRESS", "CANCELLED", "COMPLETED").contains(to);
            case "IN_PROGRESS" -> List.of("COMPLETED", "CANCELLED").contains(to);
            case "COMPLETED", "CANCELLED" -> false;
            default -> false;
        };
    }

    private String normalizeStatus(String requested) {
        if (requested == null) return "SCHEDULED";
        String s = requested.trim().toUpperCase();
        return switch (s) {
            case "SCHEDULED", "PENDING" -> "SCHEDULED";
            case "APPROVED" -> "APPROVED";
            case "ASSIGNED", "IN_PROGRESS" -> "IN_PROGRESS";
            case "COMPLETED" -> "COMPLETED";
            case "CANCELLED", "CANCELED", "REJECTED" -> "CANCELLED";
            default -> "SCHEDULED";
        };
    }

    private SpecialPickupResponse mapToResponse(SpecialPickup p) {
        SpecialPickupResponse r = new SpecialPickupResponse();
        r.setId(p.getId());
        r.setUserId(p.getUserId());
        r.setWasteType(p.getWasteType());
        r.setPickupDate(p.getPickupDate());
        r.setPickupTime(p.getPickupTime());
        r.setDescription(p.getDescription());
        r.setLocation(p.getLocation());
        r.setSpecialInstructions(p.getSpecialInstructions());
        r.setUrgency(p.getUrgency());
        r.setPhotoUrls(p.getPhotoUrls());
        r.setPrice(p.getPrice());
        r.setStatus(p.getStatus());
        r.setPickupId(p.getPickupId());
        r.setCreatedAt(p.getCreatedAt());
        r.setUpdatedAt(p.getUpdatedAt());
        r.setAssignedCrewId(p.getAssignedCrewId());
        r.setNotes(p.getNotes());
        return r;
    }
}
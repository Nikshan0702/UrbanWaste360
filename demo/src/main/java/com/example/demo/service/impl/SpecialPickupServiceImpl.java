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

    // Single-constructor beans don't need @Autowired
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
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        // Next 7 days, weekdays only
        for (int i = 1; i <= 7; i++) {
            LocalDate date = today.plusDays(i);
            if (date.getDayOfWeek().getValue() < 6) {
                List<String> availableTimes = List.of("09:00", "11:00", "14:00", "16:00");
                List<String> bookedTimes = getBookedTimesForDate(date.format(formatter));
                List<String> finalTimes = new ArrayList<>(availableTimes);
                finalTimes.removeAll(bookedTimes);

                if (!finalTimes.isEmpty()) {
                    slots.add(new PickupSlotResponse(date.format(formatter), finalTimes));
                }
            }
        }
        return slots;
    }

    private List<String> getBookedTimesForDate(String date) {
        List<SpecialPickup> pickups = pickupRepository.findByPickupDateAndStatus(date, "SCHEDULED");
        List<String> bookedTimes = new ArrayList<>();
        for (SpecialPickup pickup : pickups) {
            bookedTimes.add(pickup.getPickupTime());
        }
        return bookedTimes;
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
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Pickup not found with id: " + id));
    }

    /**
     * Update status (NO charge here; charge is added at approval).
     * Allowed transitions:
     *  SCHEDULED -> APPROVED | CANCELLED | IN_PROGRESS
     *  APPROVED  -> IN_PROGRESS | CANCELLED | COMPLETED
     *  IN_PROGRESS -> COMPLETED | CANCELLED
     */
    @Override
    public SpecialPickupResponse updatePickupStatus(String id, PickupStatusUpdateRequest request) {
        SpecialPickup pickup = pickupRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Pickup not found with id: " + id));

        String target = normalizeStatus(request.getStatus());
        String current = pickup.getStatus();

        if (!isTransitionAllowed(current, target)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Invalid transition: " + current + " -> " + target);
        }

        pickup.setStatus(target);
        pickup.setNotes(request.getNotes());
        if (request.getAssignedCrewId() != null && !request.getAssignedCrewId().isBlank()) {
            pickup.setAssignedCrewId(request.getAssignedCrewId());
        }
        pickup.setUpdatedAt(LocalDateTime.now());

        return mapToResponse(pickupRepository.save(pickup));
    }

    @Override
    public SpecialPickupResponse cancelPickup(String id) {
        SpecialPickup pickup = pickupRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Pickup not found with id: " + id));
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
        List<SpecialPickup> allPickups = pickupRepository.findAll();

        int totalPickups = allPickups.size();
        int scheduledPickups   = (int) allPickups.stream().filter(p -> "SCHEDULED".equals(p.getStatus())).count();
        int approvedPickups    = (int) allPickups.stream().filter(p -> "APPROVED".equals(p.getStatus())).count();
        int inProgressPickups  = (int) allPickups.stream().filter(p -> "IN_PROGRESS".equals(p.getStatus())).count();
        int completedPickups   = (int) allPickups.stream().filter(p -> "COMPLETED".equals(p.getStatus())).count();
        int cancelledPickups   = (int) allPickups.stream().filter(p -> "CANCELLED".equals(p.getStatus())).count();

        double totalRevenue = allPickups.stream()
                .filter(p -> "COMPLETED".equals(p.getStatus()))
                .mapToDouble(SpecialPickup::getPrice)
                .sum();

        int pendingPayments = approvedPickups; // approved implies an outstanding exists

        PickupStatisticsResponse st = new PickupStatisticsResponse();
        st.setTotalPickups(totalPickups);
        st.setScheduledPickups(scheduledPickups);
        st.setInProgressPickups(inProgressPickups);
        st.setCompletedPickups(completedPickups);
        st.setCancelledPickups(cancelledPickups);
        st.setTotalRevenue(totalRevenue);
        st.setPendingPayments(pendingPayments);
        return st;
    }

    @Override
    public List<SpecialPickupResponse> getCrewAssignedPickups(String crewId) {
        List<SpecialPickup> scheduled = pickupRepository
                .findByAssignedCrewIdAndStatusOrderByCreatedAtDesc(crewId, "SCHEDULED");
        List<SpecialPickup> approved  = pickupRepository
                .findByAssignedCrewIdAndStatusOrderByCreatedAtDesc(crewId, "APPROVED");
        List<SpecialPickup> inProgress = pickupRepository
                .findByAssignedCrewIdAndStatusOrderByCreatedAtDesc(crewId, "IN_PROGRESS");

        List<SpecialPickup> combined = new ArrayList<>();
        combined.addAll(scheduled);
        combined.addAll(approved);
        combined.addAll(inProgress);
        return combined.stream().map(this::mapToResponse).toList();
    }

    @Override
    public SpecialPickupResponse assignToCrew(String pickupId, String crewId) {
        SpecialPickup pickup = pickupRepository.findById(pickupId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Pickup not found with id: " + pickupId));

        pickup.setAssignedCrewId(crewId);
        if ("SCHEDULED".equals(pickup.getStatus())) {
            pickup.setStatus("IN_PROGRESS"); // legacy behavior for manual assign
        }
        pickup.setUpdatedAt(LocalDateTime.now());
        return mapToResponse(pickupRepository.save(pickup));
    }

    /** Atomic Approval + Assignment + Add Outstanding Charge */
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

        // Approve + assign
        pickup.setAssignedCrewId(req.getCrewId());
        pickup.setStatus("APPROVED");
        pickup.setNotes(req.getNotes());
        pickup.setPrice(req.getPrice());
        pickup.setUpdatedAt(LocalDateTime.now());
        pickupRepository.save(pickup);

        // Add outstanding charge for resident
        String residentId = pickup.getUserId();
        String reference = "SP-" + pickup.getId();

        // If your PaymentService exposes addOutstanding(...) instead, use that.
        paymentService.addCharge(residentId, req.getPrice(), reference);

        return mapToResponse(pickup);
    }

    /* ---------- helpers ---------- */

    private boolean isTransitionAllowed(String from, String to) {
        if (from == null || to == null) return false;
        if (from.equals(to)) return true;
        return switch (from) {
            case "SCHEDULED"   -> List.of("APPROVED", "CANCELLED", "IN_PROGRESS").contains(to);
            case "APPROVED"    -> List.of("IN_PROGRESS", "CANCELLED", "COMPLETED").contains(to);
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

    private SpecialPickupResponse mapToResponse(SpecialPickup pickup) {
        SpecialPickupResponse r = new SpecialPickupResponse();
        r.setId(pickup.getId());
        r.setUserId(pickup.getUserId());
        r.setWasteType(pickup.getWasteType());
        r.setPickupDate(pickup.getPickupDate());
        r.setPickupTime(pickup.getPickupTime());
        r.setDescription(pickup.getDescription());
        r.setLocation(pickup.getLocation());
        r.setSpecialInstructions(pickup.getSpecialInstructions());
        r.setUrgency(pickup.getUrgency());
        r.setPhotoUrls(pickup.getPhotoUrls());
        r.setPrice(pickup.getPrice());
        r.setStatus(pickup.getStatus());
        r.setPickupId(pickup.getPickupId());
        r.setCreatedAt(pickup.getCreatedAt());
        r.setUpdatedAt(pickup.getUpdatedAt());
        r.setAssignedCrewId(pickup.getAssignedCrewId());
        r.setNotes(pickup.getNotes());
        return r;
    }
}
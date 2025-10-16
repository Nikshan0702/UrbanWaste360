// SpecialPickupServiceImpl.java
package com.example.demo.service.impl;

import com.example.demo.dto.*;
import com.example.demo.entity.SpecialPickup;
import com.example.demo.repository.SpecialPickupRepository;
import com.example.demo.service.SpecialPickupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class SpecialPickupServiceImpl implements SpecialPickupService {

    private final SpecialPickupRepository pickupRepository;

    @Autowired
    public SpecialPickupServiceImpl(SpecialPickupRepository pickupRepository) {
        this.pickupRepository = pickupRepository;
    }

    @Override
    public SpecialPickupResponse schedulePickup(SpecialPickupRequest request) {
        // Generate unique pickup ID
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

        SpecialPickup savedPickup = pickupRepository.save(pickup);
        return mapToResponse(savedPickup);
    }

    @Override
    public List<PickupSlotResponse> getAvailableSlots() {
        List<PickupSlotResponse> slots = new ArrayList<>();
        LocalDate today = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        // Generate available slots for next 7 days (excluding weekends)
        for (int i = 1; i <= 7; i++) {
            LocalDate date = today.plusDays(i);
            
            // Skip weekends (Saturday = 6, Sunday = 7)
            if (date.getDayOfWeek().getValue() < 6) {
                List<String> availableTimes = List.of("09:00", "11:00", "14:00", "16:00");
                
                // Check for existing bookings and remove unavailable times
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
        List<SpecialPickup> pickups = pickupRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return pickups.stream().map(this::mapToResponse).toList();
    }

    @Override
    public List<SpecialPickupResponse> getAllPickups() {
        List<SpecialPickup> pickups = pickupRepository.findAllByOrderByCreatedAtDesc();
        return pickups.stream().map(this::mapToResponse).toList();
    }

    @Override
    public SpecialPickupResponse getPickupById(String id) {
        Optional<SpecialPickup> pickup = pickupRepository.findById(id);
        return pickup.map(this::mapToResponse)
                   .orElseThrow(() -> new RuntimeException("Pickup not found with id: " + id));
    }

    @Override
    public SpecialPickupResponse updatePickupStatus(String id, PickupStatusUpdateRequest request) {
        Optional<SpecialPickup> pickupOpt = pickupRepository.findById(id);
        if (pickupOpt.isPresent()) {
            SpecialPickup pickup = pickupOpt.get();
            pickup.setStatus(request.getStatus());
            pickup.setNotes(request.getNotes());
            pickup.setAssignedCrewId(request.getAssignedCrewId());
            pickup.setUpdatedAt(LocalDateTime.now());
            
            SpecialPickup updatedPickup = pickupRepository.save(pickup);
            return mapToResponse(updatedPickup);
        }
        throw new RuntimeException("Pickup not found with id: " + id);
    }

    @Override
    public SpecialPickupResponse cancelPickup(String id) {
        Optional<SpecialPickup> pickupOpt = pickupRepository.findById(id);
        if (pickupOpt.isPresent()) {
            SpecialPickup pickup = pickupOpt.get();
            pickup.setStatus("CANCELLED");
            pickup.setUpdatedAt(LocalDateTime.now());
            
            SpecialPickup cancelledPickup = pickupRepository.save(pickup);
            return mapToResponse(cancelledPickup);
        }
        throw new RuntimeException("Pickup not found with id: " + id);
    }

    @Override
    public List<SpecialPickupResponse> getPickupsByStatus(String status) {
        List<SpecialPickup> pickups = pickupRepository.findByStatusOrderByCreatedAtDesc(status);
        return pickups.stream().map(this::mapToResponse).toList();
    }

    @Override
    public PickupStatisticsResponse getPickupStatistics() {
        List<SpecialPickup> allPickups = pickupRepository.findAll();
        
        int totalPickups = allPickups.size();
        int scheduledPickups = (int) allPickups.stream().filter(p -> "SCHEDULED".equals(p.getStatus())).count();
        int inProgressPickups = (int) allPickups.stream().filter(p -> "IN_PROGRESS".equals(p.getStatus())).count();
        int completedPickups = (int) allPickups.stream().filter(p -> "COMPLETED".equals(p.getStatus())).count();
        int cancelledPickups = (int) allPickups.stream().filter(p -> "CANCELLED".equals(p.getStatus())).count();
        
        double totalRevenue = allPickups.stream()
                .filter(p -> "COMPLETED".equals(p.getStatus()))
                .mapToDouble(SpecialPickup::getPrice)
                .sum();
        
        int pendingPayments = (int) allPickups.stream()
                .filter(p -> "COMPLETED".equals(p.getStatus()))
                .filter(p -> p.getPrice() > 0)
                .count();

        PickupStatisticsResponse statistics = new PickupStatisticsResponse();
        statistics.setTotalPickups(totalPickups);
        statistics.setScheduledPickups(scheduledPickups);
        statistics.setInProgressPickups(inProgressPickups);
        statistics.setCompletedPickups(completedPickups);
        statistics.setCancelledPickups(cancelledPickups);
        statistics.setTotalRevenue(totalRevenue);
        statistics.setPendingPayments(pendingPayments);
        
        return statistics;
    }

    @Override
    public List<SpecialPickupResponse> getCrewAssignedPickups(String crewId) {
        List<SpecialPickup> pickups = pickupRepository.findByAssignedCrewIdAndStatusOrderByCreatedAtDesc(crewId, "SCHEDULED");
        return pickups.stream().map(this::mapToResponse).toList();
    }

    @Override
    public SpecialPickupResponse assignToCrew(String pickupId, String crewId) {
        Optional<SpecialPickup> pickupOpt = pickupRepository.findById(pickupId);
        if (pickupOpt.isPresent()) {
            SpecialPickup pickup = pickupOpt.get();
            pickup.setAssignedCrewId(crewId);
            pickup.setStatus("IN_PROGRESS");
            pickup.setUpdatedAt(LocalDateTime.now());
            
            SpecialPickup assignedPickup = pickupRepository.save(pickup);
            return mapToResponse(assignedPickup);
        }
        throw new RuntimeException("Pickup not found with id: " + pickupId);
    }

    private SpecialPickupResponse mapToResponse(SpecialPickup pickup) {
        SpecialPickupResponse response = new SpecialPickupResponse();
        response.setId(pickup.getId());
        response.setUserId(pickup.getUserId());
        response.setWasteType(pickup.getWasteType());
        response.setPickupDate(pickup.getPickupDate());
        response.setPickupTime(pickup.getPickupTime());
        response.setDescription(pickup.getDescription());
        response.setLocation(pickup.getLocation());
        response.setSpecialInstructions(pickup.getSpecialInstructions());
        response.setUrgency(pickup.getUrgency());
        response.setPhotoUrls(pickup.getPhotoUrls());
        response.setPrice(pickup.getPrice());
        response.setStatus(pickup.getStatus());
        response.setPickupId(pickup.getPickupId());
        response.setCreatedAt(pickup.getCreatedAt());
        response.setUpdatedAt(pickup.getUpdatedAt());
        response.setAssignedCrewId(pickup.getAssignedCrewId());
        response.setNotes(pickup.getNotes());
        return response;
    }
}
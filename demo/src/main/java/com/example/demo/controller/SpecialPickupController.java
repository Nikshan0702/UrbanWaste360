// SpecialPickupController.java
package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.service.SpecialPickupService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pickups")
public class SpecialPickupController {

    private final SpecialPickupService pickupService;

    @Autowired
    public SpecialPickupController(SpecialPickupService pickupService) {
        this.pickupService = pickupService;
    }

    @PostMapping("/schedule")
    public ResponseEntity<SpecialPickupResponse> schedulePickup(@Valid @RequestBody SpecialPickupRequest request) {
        SpecialPickupResponse response = pickupService.schedulePickup(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/available-slots")
    public ResponseEntity<List<PickupSlotResponse>> getAvailableSlots() {
        List<PickupSlotResponse> slots = pickupService.getAvailableSlots();
        return ResponseEntity.ok(slots);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SpecialPickupResponse>> getUserPickups(@PathVariable String userId) {
        List<SpecialPickupResponse> pickups = pickupService.getUserPickups(userId);
        return ResponseEntity.ok(pickups);
    }

    @GetMapping("/all")
    public ResponseEntity<List<SpecialPickupResponse>> getAllPickups() {
        List<SpecialPickupResponse> pickups = pickupService.getAllPickups();
        return ResponseEntity.ok(pickups);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SpecialPickupResponse> getPickupById(@PathVariable String id) {
        SpecialPickupResponse pickup = pickupService.getPickupById(id);
        return ResponseEntity.ok(pickup);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<SpecialPickupResponse> updatePickupStatus(
            @PathVariable String id,
            @Valid @RequestBody PickupStatusUpdateRequest request) {
        SpecialPickupResponse updatedPickup = pickupService.updatePickupStatus(id, request);
        return ResponseEntity.ok(updatedPickup);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<SpecialPickupResponse> cancelPickup(@PathVariable String id) {
        SpecialPickupResponse cancelledPickup = pickupService.cancelPickup(id);
        return ResponseEntity.ok(cancelledPickup);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<SpecialPickupResponse>> getPickupsByStatus(@PathVariable String status) {
        List<SpecialPickupResponse> pickups = pickupService.getPickupsByStatus(status);
        return ResponseEntity.ok(pickups);
    }

    @GetMapping("/statistics")
    public ResponseEntity<PickupStatisticsResponse> getPickupStatistics() {
        PickupStatisticsResponse statistics = pickupService.getPickupStatistics();
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/crew/{crewId}")
    public ResponseEntity<List<SpecialPickupResponse>> getCrewAssignedPickups(@PathVariable String crewId) {
        List<SpecialPickupResponse> pickups = pickupService.getCrewAssignedPickups(crewId);
        return ResponseEntity.ok(pickups);
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<SpecialPickupResponse> assignToCrew(
            @PathVariable String id,
            @RequestParam String crewId) {
        SpecialPickupResponse assignedPickup = pickupService.assignToCrew(id, crewId);
        return ResponseEntity.ok(assignedPickup);
    }
}
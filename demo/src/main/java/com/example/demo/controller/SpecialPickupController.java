// SpecialPickupController.java
package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.ApproveAssignRequest;
import com.example.demo.dto.PickupSlotResponse;
import com.example.demo.dto.PickupStatisticsResponse;
import com.example.demo.dto.PickupStatusUpdateRequest;
import com.example.demo.dto.SpecialPickupRequest;
import com.example.demo.dto.SpecialPickupResponse;
import com.example.demo.service.SpecialPickupService;

import jakarta.validation.Valid;

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


    @PutMapping("/{id}/approve-assign")
     public ResponseEntity<SpecialPickupResponse> approveAndAssign(
        @PathVariable String id,
        @Valid @RequestBody ApproveAssignRequest request,
        @RequestHeader(name = "X-User-Id", required = false) String approverId // or resolve from Principal/JWT
) {
    SpecialPickupResponse updated = pickupService.approveAndAssign(id, request, approverId);
    return ResponseEntity.ok(updated);
}

    @PutMapping("/{id}/assign")
    public ResponseEntity<SpecialPickupResponse> assignToCrew(
            @PathVariable String id,
            @RequestParam String crewId) {
        SpecialPickupResponse assignedPickup = pickupService.assignToCrew(id, crewId);
        return ResponseEntity.ok(assignedPickup);
    }
}
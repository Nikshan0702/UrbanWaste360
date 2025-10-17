// SpecialPickupService.java
package com.example.demo.service;

import com.example.demo.dto.*;

import java.util.List;

public interface SpecialPickupService {
    
    SpecialPickupResponse schedulePickup(SpecialPickupRequest request);
    List<PickupSlotResponse> getAvailableSlots();
    List<SpecialPickupResponse> getUserPickups(String userId);
    List<SpecialPickupResponse> getAllPickups();
    SpecialPickupResponse getPickupById(String id);
    SpecialPickupResponse updatePickupStatus(String id, PickupStatusUpdateRequest request);
    SpecialPickupResponse cancelPickup(String id);
    List<SpecialPickupResponse> getPickupsByStatus(String status);
    PickupStatisticsResponse getPickupStatistics();
    List<SpecialPickupResponse> getCrewAssignedPickups(String crewId);
    SpecialPickupResponse assignToCrew(String pickupId, String crewId);
    SpecialPickupResponse approveAndAssign(String pickupId, ApproveAssignRequest req, String approverId);
}
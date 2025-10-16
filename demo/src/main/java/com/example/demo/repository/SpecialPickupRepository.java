// SpecialPickupRepository.java
package com.example.demo.repository;

import com.example.demo.entity.SpecialPickup;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpecialPickupRepository extends MongoRepository<SpecialPickup, String> {
    
    List<SpecialPickup> findByUserIdOrderByCreatedAtDesc(String userId);
    
    List<SpecialPickup> findAllByOrderByCreatedAtDesc();
    
    List<SpecialPickup> findByStatusOrderByCreatedAtDesc(String status);
    
    List<SpecialPickup> findByPickupDateAndStatus(String pickupDate, String status);
    
    List<SpecialPickup> findByAssignedCrewIdAndStatusOrderByCreatedAtDesc(String assignedCrewId, String status);
    
    @Query("{ 'pickupDate': ?0, 'status': { $in: ['SCHEDULED', 'IN_PROGRESS'] } }")
    List<SpecialPickup> findActivePickupsByDate(String pickupDate);
}
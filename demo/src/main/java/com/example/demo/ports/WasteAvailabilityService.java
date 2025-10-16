// src/main/java/com/example/demo/ports/WasteAvailabilityService.java
package com.example.demo.ports;
import java.util.List;

import com.example.demo.dto.WasteAvailabilityDTO;
public interface WasteAvailabilityService {
    List<WasteAvailabilityDTO> availableForResident(String residentId);
}
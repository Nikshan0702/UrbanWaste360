// src/main/java/com/example/demo/ports/WasteSaleService.java
package com.example.demo.ports;
import java.util.List;

import com.example.demo.dto.CreateSellRequestDTO;
import com.example.demo.dto.SellRequestViewDTO;
public interface WasteSaleService {
    SellRequestViewDTO createSellRequest(String residentId, CreateSellRequestDTO dto);
    SellRequestViewDTO markCollected(String requestId, Double collectedKg);
    SellRequestViewDTO reject(String requestId);
    SellRequestViewDTO findById(String id);
    List<SellRequestViewDTO> listForResident(String residentId);
    List<SellRequestViewDTO> listAll(String status); // admin
}
package com.example.demo.controller;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.WalletResponse;
import com.example.demo.service.WasteSellingService;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;

@RestController
@RequestMapping("/api/waste")
public class WasteSellingController {

    private final WasteSellingService wasteSellingService;

    @Autowired
    public WasteSellingController(WasteSellingService wasteSellingService) {
        this.wasteSellingService = wasteSellingService;
    }

    @PostMapping("/sell/{userId}")
    public ResponseEntity<WalletResponse> sellWaste(
            @PathVariable String userId,
            @RequestParam @DecimalMin("0.01") BigDecimal amount,
            @RequestParam @NotBlank String wasteType) {
        
        WalletResponse response = wasteSellingService.sellWaste(userId, amount, wasteType);
        return ResponseEntity.ok(response);
    }
}

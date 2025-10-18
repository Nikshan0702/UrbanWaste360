// src/main/java/com/example/demo/controller/WasteSellingController.java
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
    public ResponseEntity<?> sellWaste(
            @PathVariable String userId,
            @RequestParam @DecimalMin("0.01") BigDecimal amount,
            @RequestParam @NotBlank String wasteType) {
        
        try {
            System.out.println("🔄 Processing waste sale - User: " + userId + 
                             ", Amount: " + amount + ", Type: " + wasteType);
            
            WalletResponse response = wasteSellingService.sellWaste(userId, amount, wasteType);
            
            System.out.println("✅ Waste sale completed - New balance: " + response.getBalance());
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            System.out.println("❌ Validation error: " + e.getMessage());
            return ResponseEntity.badRequest().body(
                new ErrorResponse("VALIDATION_ERROR", e.getMessage())
            );
        } catch (Exception e) {
            System.out.println("❌ Server error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(
                new ErrorResponse("SERVER_ERROR", "Failed to process waste sale: " + e.getMessage())
            );
        }
    }

    // Simple error response DTO
    public static class ErrorResponse {
        private String error;
        private String message;

        public ErrorResponse(String error, String message) {
            this.error = error;
            this.message = message;
        }

        // Getters and setters
        public String getError() { return error; }
        public void setError(String error) { this.error = error; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}
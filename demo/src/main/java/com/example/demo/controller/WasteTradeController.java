// src/main/java/com/example/demo/controller/WasteTradeController.java
package com.example.demo.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.dto.CreateSellRequestDTO;
import com.example.demo.dto.SellRequestViewDTO;
import com.example.demo.dto.WasteAvailabilityDTO;
import com.example.demo.ports.WasteAvailabilityService;
import com.example.demo.ports.WasteSaleService;
import com.example.demo.repository.UserRepository;

@RestController
@RequestMapping("/api/trade")
public class WasteTradeController {

    private final WasteAvailabilityService availabilityService;
    private final WasteSaleService saleService;
    private final UserRepository userRepository;

    @Value("${app.security.enabled:true}")
    private boolean securityEnabled;

    public WasteTradeController(
            WasteAvailabilityService avail,
            WasteSaleService sale,
            UserRepository users
    ) {
        this.availabilityService = avail;
        this.saleService = sale;
        this.userRepository = users;
    }

    private String resolveResidentId(Principal principal, String residentId) {
        if (securityEnabled) {
            if (principal == null)
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
            return userRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"))
                    .getId();
        } else {
            if (residentId == null || residentId.isBlank())
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "residentId is required when security is disabled");
            return residentId;
        }
    }

    @GetMapping("/available")
    public List<WasteAvailabilityDTO> available(
            Principal principal,
            @RequestParam(required = false) String residentId
    ) {
        return availabilityService.availableForResident(resolveResidentId(principal, residentId));
    }

    @PostMapping("/sell-requests")
    public SellRequestViewDTO create(
            Principal principal,
            @RequestParam(required = false) String residentId,
            @RequestBody CreateSellRequestDTO dto
    ) {
        return saleService.createSellRequest(resolveResidentId(principal, residentId), dto);
    }

    @GetMapping("/sell-requests")
    public List<SellRequestViewDTO> myRequests(
            Principal principal,
            @RequestParam(required = false) String residentId
    ) {
        return saleService.listForResident(resolveResidentId(principal, residentId));
    }
}
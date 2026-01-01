// src/main/java/com/example/demo/controller/PaymentController.java
package com.example.demo.controller;

import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.dto.SettlePaymentRequestDTO;
import com.example.demo.model.Payment;
import com.example.demo.ports.PaymentService;
import com.example.demo.repository.UserRepository;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class PaymentController {

    private final PaymentService paymentService;
    private final UserRepository userRepository;

    @Value("${app.security.enabled:true}")
    private boolean securityEnabled;

    public PaymentController(PaymentService paymentService, UserRepository userRepository){
        this.paymentService = paymentService;
        this.userRepository = userRepository;
    }

    private String resolveResidentId(Principal principal, String residentIdFromRequestOrPath) {
        if (securityEnabled) {
            if (principal == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
            return userRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,"User not found"))
                    .getId();
        } else {
            if (residentIdFromRequestOrPath == null || residentIdFromRequestOrPath.isBlank())
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "residentId is required when security is disabled");
            return residentIdFromRequestOrPath;
        }
    }

    @GetMapping("/wallet")
    public Map<String,Object> walletMe(Principal principal, @RequestParam(required = false) String residentId){
        String rid = resolveResidentId(principal, residentId);
        return Map.of("balance", paymentService.getWalletBalance(rid));
    }

    @GetMapping("/wallet/{id}")
    public Map<String,Object> walletByPath(Principal principal, @PathVariable("id") String id,
                                           @RequestParam(required = false) String residentId){
        String rid = resolveResidentId(principal, securityEnabled ? id : (residentId != null ? residentId : id));
        return Map.of("balance", paymentService.getWalletBalance(rid));
    }

    @GetMapping("/history/{id}")
    public List<Payment> history(Principal principal, @PathVariable("id") String id,
                                 @RequestParam(required = false) String residentId){
        String rid = resolveResidentId(principal, securityEnabled ? id : (residentId != null ? residentId : id));
        return paymentService.getHistory(rid);
    }

    @PostMapping("/settle")
    public Map<String,Object> settle(Principal principal,
                                     @RequestParam(required = false) String residentId,
                                     @RequestBody SettlePaymentRequestDTO dto){
        String rid = resolveResidentId(principal, residentId);

        if (dto.getAmount() <= 0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"amount must be > 0");
        if (!"WALLET".equalsIgnoreCase(dto.getMethod()) && !"CARD".equalsIgnoreCase(dto.getMethod()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"method must be WALLET or CARD");
        if ("CARD".equalsIgnoreCase(dto.getMethod())
                && (dto.getCardToken() == null || dto.getCardToken().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "cardToken required for CARD payments");
        }

        paymentService.settle(rid, dto.getAmount(), dto.getMethod().toUpperCase(), dto.getCardToken());
        return Map.of("ok", true, "remaining", paymentService.getOutstanding(rid));
    }

    @GetMapping("/outstanding")
    public Map<String,Object> outstanding(Principal principal, @RequestParam(required = false) String residentId){
        String rid = resolveResidentId(principal, residentId);
        return Map.of("outstanding", paymentService.getOutstanding(rid));
    }
}
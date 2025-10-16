// // src/main/java/com/example/demo/controller/AdminWasteController.java
// package com.example.demo.controller;

// import java.util.List;
// import java.util.Map;

// import org.springframework.http.HttpStatus;
// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.PathVariable;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.RequestBody;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RequestParam;
// import org.springframework.web.bind.annotation.RestController;
// import org.springframework.web.server.ResponseStatusException;

// import com.example.demo.dto.AddChargeDTO;
// import com.example.demo.dto.SellRequestViewDTO;
// import com.example.demo.dto.UpdateSellRequestStatusDTO;
// import com.example.demo.ports.PaymentService;
// import com.example.demo.ports.WasteSaleService;

// @RestController
// @RequestMapping("/api/admin")
// public class AdminWasteController {
//     private final WasteSaleService saleService;
//     private final PaymentService paymentService;

//     public AdminWasteController(WasteSaleService saleService, PaymentService paymentService){
//         this.saleService = saleService; this.paymentService = paymentService;
//     }

//     @GetMapping("/sell-requests")
//     public List<SellRequestViewDTO> list(@RequestParam(required=false) String status){
//         return saleService.listAll(status);
//     }

//     @PostMapping("/sell-requests/{id}/status")
//     public SellRequestViewDTO update(@PathVariable String id, @RequestBody UpdateSellRequestStatusDTO dto){
//         if (dto.getStatus()==null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"status required");
//         return switch (dto.getStatus()) {
//             case "COLLECTED" -> saleService.markCollected(id, dto.getCollectedKg());
//             case "REJECTED" -> saleService.reject(id);
//             default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid status");
//         };
//     }

//     @PostMapping("/charges")
//     public Map<String,Object> addCharge(@RequestBody AddChargeDTO dto){
//         if (dto.getResidentId()==null || dto.getResidentId().isBlank())
//             throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"residentId required");
//         if (dto.getAmount()<=0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"amount must be > 0");
//         paymentService.addCharge(dto.getResidentId(), dto.getAmount(), dto.getReason());
//         return Map.of("ok", true);
//     }
// }

// src/main/java/com/example/demo/controller/AdminWasteController.java
// src/main/java/com/example/demo/controller/AdminWasteController.java
package com.example.demo.controller;

import java.security.Principal;
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

import com.example.demo.dto.AddChargeDTO;
import com.example.demo.dto.SellRequestViewDTO;
import com.example.demo.dto.UpdateSellRequestStatusDTO;
import com.example.demo.ports.PaymentService;
import com.example.demo.ports.WasteSaleService;
import com.example.demo.repository.UserRepository;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class AdminWasteController {

    private final WasteSaleService saleService;
    private final PaymentService paymentService;
    private final UserRepository userRepository;

    @Value("${app.security.enabled:true}")
    private boolean securityEnabled;

    public AdminWasteController(
            WasteSaleService saleService,
            PaymentService paymentService,
            UserRepository userRepository
    ){
        this.saleService = saleService;
        this.paymentService = paymentService;
        this.userRepository = userRepository;
    }

    private void ensureAdmin(Principal principal){
        if (!securityEnabled) return; // dev mode open
        if (principal == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        var u = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        if (!"ADMIN".equalsIgnoreCase(u.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin only");
        }
    }

    /* ---------- SELL REQUESTS ---------- */

    @GetMapping("/sell-requests")
    public java.util.List<SellRequestViewDTO> list(@RequestParam(required=false) String status, Principal principal){
        ensureAdmin(principal);
        return saleService.listAll(status);
    }

    @PostMapping("/sell-requests/{id}/status")
    public SellRequestViewDTO update(@PathVariable String id, @RequestBody UpdateSellRequestStatusDTO dto, Principal principal){
        ensureAdmin(principal);
        if (dto.getStatus()==null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"status required");
        return switch (dto.getStatus()) {
            case "COLLECTED" -> saleService.markCollected(id, dto.getCollectedKg());
            case "REJECTED" -> saleService.reject(id);
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid status");
        };
    }

    /* ---------- CHARGES ---------- */

    @PostMapping("/charges")
    public Map<String,Object> addCharge(@RequestBody AddChargeDTO dto, Principal principal){
        ensureAdmin(principal);
        if (dto.getResidentId()==null || dto.getResidentId().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"residentId required");
        if (dto.getAmount()<=0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"amount must be > 0");
        paymentService.addCharge(dto.getResidentId(), dto.getAmount(), dto.getReason());
        return Map.of("ok", true);
    }

    /* ---------- OPTIONAL: schedules stubs (kept, unique paths) ---------- */

    @GetMapping("/schedules")
    public java.util.List<java.util.Map<String,Object>> listSchedules(
            Principal principal,
            @RequestParam(defaultValue = "upcoming") String range
    ){
        ensureAdmin(principal);
        return java.util.List.of(); // TODO replace with real service
    }

    @PostMapping("/schedules")
    public Map<String,Object> createSchedule(
            Principal principal,
            @RequestBody Map<String,Object> dto
    ){
        ensureAdmin(principal);
        return Map.of("ok", true); // TODO call your real scheduling service here
    }
}
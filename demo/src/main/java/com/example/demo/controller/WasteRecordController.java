package com.example.demo.controller;

import com.example.demo.model.WasteRecord;
import com.example.demo.model.User;
import com.example.demo.service.WasteRecordService;
import com.example.demo.repository.UserRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.beans.factory.annotation.Value;


import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
// @CrossOrigin(origins = {"http://localhost:5173","http://localhost:3000"}, allowCredentials = "true")
@RequestMapping("/api/waste-records")
public class WasteRecordController {

    private final WasteRecordService service;
    private final UserRepository userRepository;

    @Value("${app.security.enabled:true}")
    private boolean securityEnabled;

    public WasteRecordController(WasteRecordService service, UserRepository userRepository) {
        this.service = service;
        this.userRepository = userRepository;
    }

    // READ with basic filters: /records?residentId=user123&type=Plastic
    // @GetMapping("/records")
    // public List<WasteRecord> list(
    //         @RequestParam(required = false) String residentId,
    //         @RequestParam(required = false) String type
    // ) {
    //     return service.list(residentId, type);
    // }


    @GetMapping("/records")
    public List<WasteRecord> list(Principal principal,
            @RequestParam(required = false) String residentId, 
            @RequestParam(required = false) String type) {
         if (securityEnabled) {
            if (principal == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
            var user = userRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
            return service.list(user.getId(), type);
        } else {
            // no auth: use provided residentId (or return all)
            return service.list(residentId, type);
        }
    }

    // CREATE
    // @PostMapping("/records")
    // public WasteRecord create(@RequestBody WasteRecord r) {
    //     return service.create(r);
    // }

    // @PostMapping("/records")
    // public WasteRecord create(@RequestBody WasteRecord r, @AuthenticationPrincipal UserDetailsImpl userDetails) {
    //     r.setResidentId(userDetails.getId());
    //     return service.create(r);
    // }


    // CREATE: derive residentId from logged-in user
    @PostMapping("/records")
    public WasteRecord create(@RequestBody WasteRecord r, Principal principal,
                @RequestParam(required = false) String residentId) {
        if (securityEnabled) {
            if (principal == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
            var user = userRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
            r.setResidentId(user.getId());
        } else {
            // trust provided residentId in body or query param
            if (r.getResidentId() == null || r.getResidentId().isBlank()) {
                if (residentId == null || residentId.isBlank()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "residentId is required when security is disabled");
                }
                r.setResidentId(residentId);
            }
        }
        return service.create(r);
    }


    // UPDATE
    // @PutMapping("/records/{id}")
    // public WasteRecord update(@PathVariable String id, @RequestBody WasteRecord r) {
    //     return service.update(id, r);
    // }

    // // DELETE
    // @DeleteMapping("/records/{id}")
    // public Map<String, Object> delete(@PathVariable String id) {
    //     service.delete(id);
    //     return Map.of("ok", true);
    // }



   @PutMapping("/records/{id}")
    public WasteRecord update(@PathVariable String id, @RequestBody WasteRecord r, Principal principal) {
        var existing = service.findById(id);
        if (securityEnabled) {
            if (principal == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
            var user = userRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
            if (!existing.getResidentId().equals(user.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your record");
            }
            r.setResidentId(user.getId()); // preserve owner
        } else {
            // no auth: preserve current owner
            r.setResidentId(existing.getResidentId());
        }
        return service.update(id, r);
    }

    @DeleteMapping("/records/{id}")
    public Map<String, Object> delete(@PathVariable String id, Principal principal) {
        var existing = service.findById(id);
        if (securityEnabled) {
            if (principal == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
            var user = userRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
            if (!existing.getResidentId().equals(user.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your record");
            }
        }
        service.delete(id);
        return Map.of("ok", true);
    }





    private static final Map<String, Integer> FACTOR = Map.of(
            "Plastic", 10, "Paper", 6, "Metal", 12, "Glass", 8,
            "Organic", 0, "Other", 0
    );

    // @GetMapping("/credits")
    // public Map<String, Object> credits(@RequestParam String residentId) {
    //     List<WasteRecord> list = service.byResident(residentId);
    //     int points = list.stream()
    //             .mapToInt(r -> (int) Math.round(r.getQuantity() * FACTOR.getOrDefault(r.getType(), 0)))
    //             .sum();
    //     Map<String, Object> res = new HashMap<>();
    //     res.put("points", points);
    //     return res;
    // }


    @GetMapping("/credits")
    public Map<String, Object> credits(Principal principal,
            @RequestParam(required = false) String residentId) {
        String rid;
        if (securityEnabled) {
            if (principal == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
            var user = userRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
            rid = user.getId();
        } else {
            if (residentId == null || residentId.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "residentId is required when security is disabled");
            }
            rid = residentId;
        }

        List<WasteRecord> list = service.byResident(rid);
        Map<String, Integer> FACTOR = Map.of("Plastic",10,"Paper",6,"Metal",12,"Glass",8,"Organic",0,"Other",0);
        int points = list.stream()
                .mapToInt(x -> (int)Math.round(x.getQuantity() * FACTOR.getOrDefault(x.getType(), 0)))
                .sum();
        Map<String, Object> res = new HashMap<>();
        res.put("points", points);
        return res;
    }
}

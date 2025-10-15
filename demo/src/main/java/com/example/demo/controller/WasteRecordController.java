package com.example.SpringbootProject.Controller;

import com.example.SpringbootProject.Entity.WasteRecord;
import com.example.SpringbootProject.Service.WasteRecordService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("api/v1/waste")
public class WasteRecordController {

    private final WasteRecordService service;

    public WasteRecordController(WasteRecordService service) {
        this.service = service;
    }

    // READ with basic filters: /records?residentId=user123&type=Plastic
    @GetMapping("/records")
    public List<WasteRecord> list(
            @RequestParam(required = false) String residentId,
            @RequestParam(required = false) String type
    ) {
        return service.list(residentId, type);
    }

    // CREATE
    @PostMapping("/records")
    public WasteRecord create(@RequestBody WasteRecord r) {
        return service.create(r);
    }

    // UPDATE
    @PutMapping("/records/{id}")
    public WasteRecord update(@PathVariable String id, @RequestBody WasteRecord r) {
        return service.update(id, r);
    }

    // DELETE
    @DeleteMapping("/records/{id}")
    public Map<String, Object> delete(@PathVariable String id) {
        service.delete(id);
        return Map.of("ok", true);
    }

    // ====== CREDITS ENDPOINT (இது தான் நீங்கள் கேட்டது) ======
    private static final Map<String, Integer> FACTOR = Map.of(
            "Plastic", 10, "Paper", 6, "Metal", 12, "Glass", 8,
            "Organic", 0, "Other", 0
    );

    @GetMapping("/credits")
    public Map<String, Object> credits(@RequestParam String residentId) {
        List<WasteRecord> list = service.byResident(residentId);
        int points = list.stream()
                .mapToInt(r -> (int) Math.round(r.getQuantity() * FACTOR.getOrDefault(r.getType(), 0)))
                .sum();
        Map<String, Object> res = new HashMap<>();
        res.put("points", points);
        return res;
    }
}

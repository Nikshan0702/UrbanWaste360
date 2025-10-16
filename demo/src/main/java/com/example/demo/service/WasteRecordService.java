package com.example.demo.service;

import com.example.demo.model.WasteRecord;
import com.example.demo.repository.WasteRecordRepo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WasteRecordService {
    private final WasteRecordRepo repo;
    public WasteRecordService(WasteRecordRepo repo) { this.repo = repo; }

    // public List<WasteRecord> list(String residentId, String type) {
    //     if (residentId == null || residentId.isBlank()) return repo.findAll();
    //     if (type != null && !type.isBlank()) return repo.findByResidentIdAndType(residentId, type);
    //     return repo.findByResidentId(residentId);
    // }

    public List<WasteRecord> list(String residentId, String type) {
        if (type != null && !type.isBlank()) return repo.findByResidentIdAndType(residentId, type);
        return repo.findByResidentId(residentId);
    }

    public WasteRecord create(WasteRecord r) { return repo.save(r); }
    public WasteRecord update(String id, WasteRecord r) { r.setId(id); return repo.save(r); }
    public void delete(String id) { repo.deleteById(id); }
    public List<WasteRecord> byResident(String residentId) { return repo.findByResidentId(residentId); }

    public WasteRecord findById(String id) {
        return repo.findById(id).orElseThrow(() ->
            new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.NOT_FOUND, "Record not found: " + id
            )
        );
    }
}

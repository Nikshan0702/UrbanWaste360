package com.example.demo.service;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.dto.CreateSellRequestDTO;
import com.example.demo.dto.SellRequestViewDTO;
import com.example.demo.model.SellRequest;
import com.example.demo.ports.PricingService;
import com.example.demo.ports.WalletService;
import com.example.demo.ports.WasteSaleService;
import com.example.demo.repository.SellRequestRepository;

@Service
public class WasteSaleServiceImpl implements WasteSaleService {
    private final SellRequestRepository repo;
    private final PricingService pricing;
    private final WasteAvailabilityServiceImpl availability; // re-use calculation
    private final WalletService wallet;

    public WasteSaleServiceImpl(SellRequestRepository repo, PricingService pricing,
                                WasteAvailabilityServiceImpl availability, WalletService wallet) {
        this.repo = repo; this.pricing = pricing; this.availability = availability; this.wallet = wallet;
    }

    @Override
    public SellRequestViewDTO createSellRequest(String residentId, CreateSellRequestDTO dto) {
        var price = pricing.pricePerKg(dto.getType());
        if (price < 0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown waste type");
        // check availability
        var ava = availability.availableForResident(residentId).stream()
            .filter(x -> x.getType().equals(dto.getType()))
            .findFirst().orElse(null);
        double availableKg = (ava!=null)?ava.getAvailableKg():0.0;
        if (dto.getQuantityKg() <= 0 || dto.getQuantityKg() > availableKg)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient available kg");

        var now = Instant.now();
        var entity = new SellRequest();
        entity.setResidentId(residentId);
        entity.setType(dto.getType());
        entity.setQuantityKg(dto.getQuantityKg());
        entity.setUnitPriceLkr(price);
        entity.setStatus("PENDING");
        entity.setCreditedAmount(0);
        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);
        repo.save(entity);
        return toView(entity);
    }

    @Override
    public SellRequestViewDTO markCollected(String id, Double collectedKg) {
        var e = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));
        if (!"PENDING".equals(e.getStatus())) throw new ResponseStatusException(HttpStatus.CONFLICT, "Already processed");
        double c = (collectedKg == null || collectedKg <= 0) ? e.getQuantityKg() : collectedKg;
        e.setCollectedKg(c);
        e.setStatus("COLLECTED");
        double credit = c * e.getUnitPriceLkr();
        e.setCreditedAmount(credit);
        e.setUpdatedAt(Instant.now());
        repo.save(e);
        wallet.credit(e.getResidentId(), credit, "Waste collected: "+e.getType());
        return toView(e);
    }

    @Override
    public SellRequestViewDTO reject(String id) {
        var e = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));
        if (!"PENDING".equals(e.getStatus())) throw new ResponseStatusException(HttpStatus.CONFLICT, "Already processed");
        e.setStatus("REJECTED");
        e.setUpdatedAt(Instant.now());
        repo.save(e);
        return toView(e);
    }

    @Override
    public SellRequestViewDTO findById(String id) {
        return toView(repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found")));
    }

    @Override
    public List<SellRequestViewDTO> listForResident(String residentId) {
        return repo.findByResidentIdOrderByCreatedAtDesc(residentId)
            .stream().map(this::toView).collect(Collectors.toList());
    }

    @Override
    public List<SellRequestViewDTO> listAll(String status) {
        var list = (status==null||status.isBlank()) ? repo.findAll() : repo.findByStatusOrderByCreatedAtAsc(status);
        return list.stream().map(this::toView).collect(Collectors.toList());
    }

    private SellRequestViewDTO toView(SellRequest e){
        var v = new SellRequestViewDTO();
        v.setId(e.getId()); v.setResidentId(e.getResidentId()); v.setType(e.getType());
        v.setQuantityKg(e.getQuantityKg()); v.setStatus(e.getStatus());
        v.setUnitPriceLkr(e.getUnitPriceLkr()); v.setCreditedAmount(e.getCreditedAmount());
        v.setCollectedKg(e.getCollectedKg());
        return v;
    }
}
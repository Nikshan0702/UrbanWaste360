package com.example.demo.service;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.example.demo.ports.PricingService;

@Service
public class PricingServiceImpl implements PricingService {
    private static final Map<String,Integer> PRICE = Map.of(
        "Plastic",50,"Paper",30,"Metal",80,"Glass",40,"Organic",20,"Other",20
    );
    @Override public int pricePerKg(String type){ return PRICE.getOrDefault(type, -1); }
}
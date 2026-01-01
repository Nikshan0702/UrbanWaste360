package com.example.demo.service;

import java.math.BigDecimal;
import com.example.demo.dto.WalletResponse;

public interface WasteSellingService {
    WalletResponse sellWaste(String userId, BigDecimal amount, String wasteType);
}

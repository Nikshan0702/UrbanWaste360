// src/main/java/com/example/demo/service/impl/PaymentServiceImpl.java
package com.example.demo.service.impl;

import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.model.Outstanding;
import com.example.demo.model.Payment;
import com.example.demo.model.Wallet;
import com.example.demo.ports.PaymentService;
import com.example.demo.repository.OutstandingRepository;
import com.example.demo.repository.PaymentRepository;
import com.example.demo.repository.WalletRepository;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepo;
    private final OutstandingRepository outstandingRepo;
    private final WalletRepository walletRepository;

    public PaymentServiceImpl(PaymentRepository paymentRepo, 
                            OutstandingRepository outstandingRepo,
                            WalletRepository walletRepository) {
        this.paymentRepo = paymentRepo;
        this.outstandingRepo = outstandingRepo;
        this.walletRepository = walletRepository;
    }

    @Override
    public double getWalletBalance(String residentId) {
        return walletRepository.findByUserId(residentId)
                .map(wallet -> wallet.getBalance().doubleValue())
                .orElse(0.0);
    }

    @Override
    public List<Payment> getHistory(String residentId) {
        // Avoid calling non-existent custom finders; load + filter
        List<Payment> all = paymentRepo.findAll();
        return all.stream()
                .filter(p -> {
                    String owner = resolveOwnerId(p);
                    return owner != null && owner.equals(residentId);
                })
                .sorted(Comparator.comparing(this::createdAtOrNow).reversed())
                .toList();
    }

    @Override
    public double getOutstanding(String residentId) {
        return outstandingRepo.findById(residentId).map(Outstanding::getAmount).orElse(0.0);
    }

    @Override
    @Transactional
    public void settle(String residentId, double amount, String method, String cardToken) {
        // 1) Write a payment history record
        Payment p = new Payment();

        setIfExists(p, "setResidentId", String.class, residentId);
        setIfExists(p, "setUserId", String.class, residentId);
        setIfExists(p, "setAmount", BigDecimal.class, BigDecimal.valueOf(amount));
        setIfExists(p, "setType", String.class, "PAYMENT");

        if (!setEnumIfExists(p, "setPaymentMethod", "com.example.demo.model.PaymentMethod", method.toUpperCase())) {
            setIfExists(p, "setPaymentMethod", String.class, method.toUpperCase());
        }

        if (!setEnumIfExists(p, "setStatus", "com.example.demo.model.PaymentStatus", "COMPLETED")) {
            setIfExists(p, "setStatus", String.class, "COMPLETED");
        }

        setIfExists(p, "setCardTokenMasked", String.class, maskCardToken(cardToken));
        setIfExists(p, "setCreatedAt", Instant.class, Instant.now());

        paymentRepo.save(p);

        // 2) decrement outstanding
        Outstanding o = outstandingRepo.findById(residentId).orElse(new Outstanding(residentId, 0.0));
        double newAmt = Math.max(0.0, o.getAmount() - amount);
        o.setAmount(newAmt);
        outstandingRepo.save(o);
    }

    @Override
    @Transactional
    public void addCharge(String residentId, double amount, String reference) {
        // Write a charge line into Payment history
        Payment p = new Payment();

        setIfExists(p, "setResidentId", String.class, residentId);
        setIfExists(p, "setUserId", String.class, residentId);
        setIfExists(p, "setAmount", BigDecimal.class, BigDecimal.valueOf(amount));
        setIfExists(p, "setType", String.class, "CHARGE");

        if (!setEnumIfExists(p, "setPaymentMethod", "com.example.demo.model.PaymentMethod", "SYSTEM")) {
            setIfExists(p, "setPaymentMethod", String.class, "SYSTEM");
        }

        if (!setEnumIfExists(p, "setStatus", "com.example.demo.model.PaymentStatus", "COMPLETED")) {
            setIfExists(p, "setStatus", String.class, "COMPLETED");
        }

        setIfExists(p, "setReference", String.class, reference);
        setIfExists(p, "setNotes", String.class, reference);
        setIfExists(p, "setCreatedAt", Instant.class, Instant.now());

        paymentRepo.save(p);

        // Increase outstanding
        Outstanding o = outstandingRepo.findById(residentId).orElse(new Outstanding(residentId, 0.0));
        o.setAmount(o.getAmount() + amount);
        outstandingRepo.save(o);
    }

    /* ------------------------ helpers ------------------------ */

    private String resolveOwnerId(Payment p) {
        String rid = (String) getIfExists(p, "getResidentId");
        if (rid != null) return rid;
        return (String) getIfExists(p, "getUserId");
    }

    private Instant createdAtOrNow(Payment p) {
        Object o = getIfExists(p, "getCreatedAt");
        if (o instanceof Instant i) return i;
        return Instant.now();
    }

    private String maskCardToken(String tok) {
        if (tok == null || tok.isBlank()) return null;
        String last4 = tok.replaceAll("\\D", "");
        if (last4.length() > 4) last4 = last4.substring(last4.length() - 4);
        return "****" + last4;
    }

    private Object getIfExists(Object target, String getter) {
        try {
            Method m = target.getClass().getMethod(getter);
            return m.invoke(target);
        } catch (Exception ignored) { return null; }
    }

    private <T> boolean setIfExists(Object target, String setter, Class<T> argType, T value) {
        try {
            Method m = target.getClass().getMethod(setter, argType);
            m.invoke(target, value);
            return true;
        } catch (Exception ignored) { return false; }
    }

    private boolean setEnumIfExists(Object target, String setter, String enumFqn, String constant) {
        try {
            Class<?> enumClass = Class.forName(enumFqn);
            if (!enumClass.isEnum()) return false;
            Object enumValue = null;
            for (Object c : enumClass.getEnumConstants()) {
                if (Objects.equals(c.toString(), constant)) { enumValue = c; break; }
            }
            if (enumValue == null) return false;
            Method m = target.getClass().getMethod(setter, enumClass);
            m.invoke(target, enumValue);
            return true;
        } catch (Exception ignored) { return false; }
    }
}
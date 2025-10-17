package com.example.demo.service;

import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;

import com.example.demo.ports.PaymentService;       // ports.*
import com.example.demo.ports.WalletService;       // ports.*
import com.example.demo.service.impl.PaymentServiceImpl;

@SpringBootTest
class PaymentFlowTest {

    @Autowired
    PaymentService paymentService;

    @MockBean WalletService walletService;  // test double for ctor

    @TestConfiguration
    static class Beans {
        @Bean
        PaymentService paymentService(WalletService walletService) {
            return new PaymentServiceImpl(walletService); // matches your actual ctor
        }
    }

    @Test
    void testWasteSellingAndPaymentFlow() {
        assertNotNull(paymentService);
    }
}

package com.example.demo.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.FilterType;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import com.example.demo.ports.PaymentService;
import com.example.demo.service.WasteSellingService;
import com.example.demo.service.payment.WalletPaymentProcessor;
import com.example.demo.config.JwtUtil;
import com.example.demo.service.CustomUserDetailsService;
import com.example.demo.config.JwtAuthenticationFilter;
import com.example.demo.config.SecurityConfig;
import com.example.demo.repository.UserRepository;

@WebMvcTest(controllers = PaymentController.class,
        excludeAutoConfiguration = {
                org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
                org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration.class
        },
        excludeFilters = @org.springframework.context.annotation.ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = SecurityConfig.class)
)
@AutoConfigureMockMvc(addFilters = false)
@TestPropertySource(properties = {
        "app.security.enabled=false",
        "app.cors.allowed-origin-patterns=*",
        "app.cors.allow-credentials=true"
})
class PaymentControllerSecureTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean private PaymentService paymentService;
    @MockBean private WalletPaymentProcessor walletPaymentProcessor;
    @MockBean private WasteSellingService wasteSellingService;
    @MockBean private JwtUtil jwtUtil;
    @MockBean private CustomUserDetailsService customUserDetailsService;
    @MockBean private JwtAuthenticationFilter jwtAuthenticationFilter;
    @MockBean private UserRepository userRepository;

    @Test
    void wallet_secure_ok() throws Exception {
        mockMvc.perform(get("/api/payments/wallet").param("residentId", "ANY"))
                .andExpect(status().isOk());
    }

    @Test
    void history_secure_ok() throws Exception {
        mockMvc.perform(get("/api/payments/history/ANY"))
                .andExpect(status().isOk());
    }

    @Test
    void outstanding_ok() throws Exception {
        mockMvc.perform(get("/api/payments/outstanding").param("residentId", "ANY"))
                .andExpect(status().isOk());
    }

    @Test
    void settle_wallet_ok() throws Exception {
        mockMvc.perform(post("/api/payments/settle").param("residentId", "ANY")
                        .contentType("application/json")
                        .content("{\"method\":\"wallet\",\"amount\":50.0}"))
                .andExpect(status().isOk());
    }

    @Test
    void settle_card_missing_token() throws Exception {
        mockMvc.perform(post("/api/payments/settle").param("residentId", "ANY")
                        .contentType("application/json")
                        .content("{\"method\":\"card\"}"))
                .andExpect(status().isBadRequest());
    }
}

package com.example.demo.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.FilterType;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.demo.service.PaymentService;
import com.example.demo.service.WasteSellingService;
import com.example.demo.config.JwtUtil;
import com.example.demo.service.CustomUserDetailsService;
import com.example.demo.config.JwtAuthenticationFilter;
import com.example.demo.config.SecurityConfig;

@WebMvcTest(controllers = WasteSellingController.class,
        excludeAutoConfiguration = {
                org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
                org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration.class
        },
        excludeFilters = @org.springframework.context.annotation.ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = SecurityConfig.class)
)
@AutoConfigureMockMvc(addFilters = false)
class WasteSellingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean private WasteSellingService wasteSellingService;
    @MockBean private PaymentService paymentService;
    @MockBean private JwtUtil jwtUtil;
    @MockBean private CustomUserDetailsService customUserDetailsService;
    @MockBean private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void sell_ok() throws Exception {
        when(wasteSellingService.sellWaste(any(), any(BigDecimal.class), any()))
                .thenReturn(null);
        mockMvc.perform(post("/api/waste/sell/user123")
                        .param("wasteType", "plastic")
                        .param("amount", "5.0"))
                .andExpect(status().isOk());
    }

    @Test
    void sell_amount_too_small() throws Exception {
        mockMvc.perform(post("/api/waste/sell/user123")
                        .param("wasteType", "plastic")
                        .param("amount", "0.0"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void sell_missing_wasteType() throws Exception {
        mockMvc.perform(post("/api/waste/sell/user123")
                        .param("amount", "5.0"))
                .andExpect(status().isInternalServerError());
    }
}

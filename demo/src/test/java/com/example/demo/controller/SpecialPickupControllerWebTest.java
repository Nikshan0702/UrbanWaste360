package com.example.demo.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post; // for /schedule
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.config.JwtAuthenticationFilter;
import com.example.demo.config.JwtUtil;
import com.example.demo.config.SecurityConfig;
import com.example.demo.dto.ApproveAssignRequest;
import com.example.demo.dto.PickupSlotResponse;
import com.example.demo.dto.PickupStatisticsResponse;
import com.example.demo.dto.PickupStatusUpdateRequest;
import com.example.demo.dto.SpecialPickupRequest;
import com.example.demo.dto.SpecialPickupResponse;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.CustomUserDetailsService;
import com.example.demo.service.SpecialPickupService;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(
    controllers = SpecialPickupController.class,
    excludeAutoConfiguration = {
        org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
        org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration.class
    },
    excludeFilters = @org.springframework.context.annotation.ComponentScan.Filter(
        type = FilterType.ASSIGNABLE_TYPE, classes = SecurityConfig.class
    )
)
@AutoConfigureMockMvc(addFilters = false)
@TestPropertySource(properties = {
    "app.security.enabled=false",
    "app.cors.allowed-origin-patterns=*",
    "app.cors.allow-credentials=true"
})
class SpecialPickupControllerWebTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    // Controller collaborators to mock
    @MockBean private SpecialPickupService specialPickupService;

    // Security-related beans (mocked just like in your PaymentControllerSecureTest)
    @MockBean private JwtUtil jwtUtil;
    @MockBean private CustomUserDetailsService customUserDetailsService;
    @MockBean private JwtAuthenticationFilter jwtAuthenticationFilter;
    @MockBean private UserRepository userRepository;

    // Reusable fixtures
    private SpecialPickupResponse samplePickup;

    @BeforeEach
    void setUp() {
        samplePickup = new SpecialPickupResponse();
        samplePickup.setId("p1");
        samplePickup.setPickupId("PICKUP-1234ABCD");
        samplePickup.setUserId("U1");
        samplePickup.setWasteType("bulky");
        samplePickup.setPickupDate("2025-01-20");
        samplePickup.setPickupTime("11:00");
        samplePickup.setDescription("Old sofa");
        samplePickup.setLocation("123, Main St");
        samplePickup.setPrice(500);
        samplePickup.setStatus("SCHEDULED");
    }

    @Test
    @DisplayName("POST /api/pickups/schedule -> 200 OK")
    void schedule_ok() throws Exception {
        SpecialPickupRequest req = new SpecialPickupRequest();
        req.setUserId("U1");
        req.setWasteType("bulky");
        req.setPickupDate("2025-01-20");
        req.setPickupTime("11:00");
        req.setDescription("Old sofa");
        req.setLocation("123, Main St");
        req.setUrgency("normal");
        req.setPrice(600);

        given(specialPickupService.schedulePickup(any(SpecialPickupRequest.class))).willReturn(samplePickup);

        mockMvc.perform(
                post("/api/pickups/schedule")
                    .contentType("application/json")
                    .content(objectMapper.writeValueAsString(req))
            )
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/pickups/available-slots -> 200 OK")
    void availableSlots_ok() throws Exception {
        given(specialPickupService.getAvailableSlots())
            .willReturn(List.of(new PickupSlotResponse("2025-01-20", List.of("09:00", "11:00"))));

        mockMvc.perform(get("/api/pickups/available-slots"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/pickups/user/{userId} -> 200 OK")
    void userPickups_ok() throws Exception {
        given(specialPickupService.getUserPickups(eq("U1")))
            .willReturn(List.of(samplePickup));

        mockMvc.perform(get("/api/pickups/user/{userId}", "U1"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/pickups/all -> 200 OK")
    void allPickups_ok() throws Exception {
        given(specialPickupService.getAllPickups())
            .willReturn(List.of(samplePickup));

        mockMvc.perform(get("/api/pickups/all"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/pickups/{id} -> 200 OK")
    void getById_ok() throws Exception {
        given(specialPickupService.getPickupById(eq("p1"))).willReturn(samplePickup);

        mockMvc.perform(get("/api/pickups/{id}", "p1"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("PUT /api/pickups/{id}/status -> 200 OK")
    void updateStatus_ok() throws Exception {
        PickupStatusUpdateRequest req = new PickupStatusUpdateRequest();
        req.setStatus("IN_PROGRESS");
        req.setNotes("Crew started");

        SpecialPickupResponse updated = Mockito.spy(samplePickup);
        updated.setStatus("IN_PROGRESS");

        given(specialPickupService.updatePickupStatus(eq("p1"), any(PickupStatusUpdateRequest.class)))
            .willReturn(updated);

        mockMvc.perform(
                put("/api/pickups/{id}/status", "p1")
                    .contentType("application/json")
                    .content(objectMapper.writeValueAsString(req))
            )
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("PUT /api/pickups/{id}/status -> 409 CONFLICT on invalid transition")
    void updateStatus_conflict() throws Exception {
        PickupStatusUpdateRequest req = new PickupStatusUpdateRequest();
        req.setStatus("COMPLETED");
        req.setNotes("Force complete");

        doThrow(new ResponseStatusException(HttpStatus.CONFLICT, "Invalid transition"))
            .when(specialPickupService).updatePickupStatus(eq("p1"), any(PickupStatusUpdateRequest.class));

        mockMvc.perform(
                put("/api/pickups/{id}/status", "p1")
                    .contentType("application/json")
                    .content(objectMapper.writeValueAsString(req))
            )
            .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("PUT /api/pickups/{id}/cancel -> 200 OK")
    void cancel_ok() throws Exception {
        SpecialPickupResponse cancelled = Mockito.spy(samplePickup);
        cancelled.setStatus("CANCELLED");

        given(specialPickupService.cancelPickup(eq("p1"))).willReturn(cancelled);

        mockMvc.perform(put("/api/pickups/{id}/cancel", "p1"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/pickups/status/{status} -> 200 OK")
    void byStatus_ok() throws Exception {
        given(specialPickupService.getPickupsByStatus(eq("APPROVED")))
            .willReturn(List.of(samplePickup));

        mockMvc.perform(get("/api/pickups/status/{status}", "APPROVED"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/pickups/statistics -> 200 OK")
    void stats_ok() throws Exception {
        PickupStatisticsResponse stats = new PickupStatisticsResponse();
        stats.setTotalPickups(10);
        stats.setScheduledPickups(3);
        stats.setInProgressPickups(2);
        stats.setCompletedPickups(4);
        stats.setCancelledPickups(1);
        stats.setTotalRevenue(2500.0);
        stats.setPendingPayments(2);

        given(specialPickupService.getPickupStatistics()).willReturn(stats);

        mockMvc.perform(get("/api/pickups/statistics"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/pickups/crew/{crewId} -> 200 OK")
    void crewAssigned_ok() throws Exception {
        given(specialPickupService.getCrewAssignedPickups(eq("C1")))
            .willReturn(List.of(samplePickup));

        mockMvc.perform(get("/api/pickups/crew/{crewId}", "C1"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("PUT /api/pickups/{id}/approve-assign -> 200 OK (adds outstanding in service)")
    void approveAssign_ok() throws Exception {
        ApproveAssignRequest req = new ApproveAssignRequest();
        req.setCrewId("C1");
        req.setPrice(700.0);
        req.setNotes("Approved quickly");

        SpecialPickupResponse approved = Mockito.spy(samplePickup);
        approved.setStatus("APPROVED");
        approved.setAssignedCrewId("C1");
        approved.setPrice(700.0);

        given(specialPickupService.approveAndAssign(eq("p1"), any(ApproveAssignRequest.class), eq("ADMIN-42")))
            .willReturn(approved);

        mockMvc.perform(
                put("/api/pickups/{id}/approve-assign", "p1")
                    .header("X-User-Id", "ADMIN-42")
                    .contentType("application/json")
                    .content(objectMapper.writeValueAsString(req))
            )
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("PUT /api/pickups/{id}/assign?crewId=... -> 200 OK")
    void assign_ok() throws Exception {
        SpecialPickupResponse assigned = Mockito.spy(samplePickup);
        assigned.setAssignedCrewId("C9");
        assigned.setStatus("IN_PROGRESS"); // per service logic when SCHEDULED -> assign

        given(specialPickupService.assignToCrew(eq("p1"), eq("C9"))).willReturn(assigned);

        mockMvc.perform(
                put("/api/pickups/{id}/assign", "p1")
                    .param("crewId", "C9")
            )
            .andExpect(status().isOk());
    }
}
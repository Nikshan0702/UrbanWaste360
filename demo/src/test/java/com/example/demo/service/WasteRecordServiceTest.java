package com.example.demo.service;

import com.example.demo.model.WasteRecord;
import com.example.demo.repository.WasteRecordRepo;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class WasteRecordServiceTest {

    @Mock
    private WasteRecordRepo wasteRecordRepo;

    @InjectMocks
    private WasteRecordService wasteRecordService;

    private WasteRecord testRecord;
    private WasteRecord testRecord2;
    private final String RECORD_ID = "record123";
    private final String RESIDENT_ID = "resident123";
    private final String TYPE_PLASTIC = "Plastic";
    private final String TYPE_PAPER = "Paper";

    @BeforeEach
    void setUp() {
        testRecord = new WasteRecord();
        testRecord.setId(RECORD_ID);
        testRecord.setResidentId(RESIDENT_ID);
        testRecord.setType(TYPE_PLASTIC);
        testRecord.setQuantity(2.5);
        testRecord.setUnit("kg");
        testRecord.setDate("2025-10-12");
        testRecord.setSource("manual");
        testRecord.setNotes("Test notes");

        testRecord2 = new WasteRecord();
        testRecord2.setId("record456");
        testRecord2.setResidentId(RESIDENT_ID);
        testRecord2.setType(TYPE_PAPER);
        testRecord2.setQuantity(1.5);
        testRecord2.setUnit("kg");
        testRecord2.setDate("2025-10-13");
        testRecord2.setSource("smart-bin");
    }

    @Test
    public void testList_WithResidentIdAndType() {
        // Given
        List<WasteRecord> expectedRecords = Arrays.asList(testRecord);
        when(wasteRecordRepo.findByResidentIdAndType(RESIDENT_ID, TYPE_PLASTIC))
            .thenReturn(expectedRecords);

        // When
        List<WasteRecord> result = wasteRecordService.list(RESIDENT_ID, TYPE_PLASTIC);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testRecord, result.get(0));
        verify(wasteRecordRepo).findByResidentIdAndType(RESIDENT_ID, TYPE_PLASTIC);
        verify(wasteRecordRepo, never()).findByResidentId(anyString());
    }

    @Test
    public void testList_WithResidentIdOnly() {
        // Given
        List<WasteRecord> expectedRecords = Arrays.asList(testRecord, testRecord2);
        when(wasteRecordRepo.findByResidentId(RESIDENT_ID))
            .thenReturn(expectedRecords);

        // When
        List<WasteRecord> result = wasteRecordService.list(RESIDENT_ID, null);

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(expectedRecords, result);
        verify(wasteRecordRepo).findByResidentId(RESIDENT_ID);
        verify(wasteRecordRepo, never()).findByResidentIdAndType(anyString(), anyString());
    }

    @Test
    public void testList_WithResidentIdAndEmptyType() {
        // Given
        List<WasteRecord> expectedRecords = Arrays.asList(testRecord, testRecord2);
        when(wasteRecordRepo.findByResidentId(RESIDENT_ID))
            .thenReturn(expectedRecords);

        // When
        List<WasteRecord> result = wasteRecordService.list(RESIDENT_ID, "");

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(wasteRecordRepo).findByResidentId(RESIDENT_ID);
        verify(wasteRecordRepo, never()).findByResidentIdAndType(anyString(), anyString());
    }

    @Test
    public void testCreate_Success() {
        // Given
        WasteRecord newRecord = new WasteRecord();
        newRecord.setType(TYPE_PLASTIC);
        newRecord.setQuantity(3.0);
        
        when(wasteRecordRepo.save(newRecord)).thenReturn(testRecord);

        // When
        WasteRecord result = wasteRecordService.create(newRecord);

        // Then
        assertNotNull(result);
        assertEquals(RECORD_ID, result.getId());
        assertEquals(RESIDENT_ID, result.getResidentId());
        verify(wasteRecordRepo).save(newRecord);
    }

    @Test
    public void testUpdate_Success() {
        // Given
        WasteRecord updatedRecord = new WasteRecord();
        updatedRecord.setType(TYPE_PLASTIC);
        updatedRecord.setQuantity(5.0);
        updatedRecord.setNotes("Updated notes");
        
        when(wasteRecordRepo.save(any(WasteRecord.class))).thenAnswer(invocation -> {
            WasteRecord saved = invocation.getArgument(0);
            saved.setId(RECORD_ID);
            return saved;
        });

        // When
        WasteRecord result = wasteRecordService.update(RECORD_ID, updatedRecord);

        // Then
        assertNotNull(result);
        assertEquals(RECORD_ID, result.getId());
        assertEquals(5.0, result.getQuantity());
        assertEquals("Updated notes", result.getNotes());
        verify(wasteRecordRepo).save(updatedRecord);
    }

    @Test
    public void testDelete_Success() {
        // Given
        doNothing().when(wasteRecordRepo).deleteById(RECORD_ID);

        // When
        wasteRecordService.delete(RECORD_ID);

        // Then
        verify(wasteRecordRepo).deleteById(RECORD_ID);
    }

    @Test
    public void testFindById_Success() {
        // Given
        when(wasteRecordRepo.findById(RECORD_ID)).thenReturn(Optional.of(testRecord));

        // When
        WasteRecord result = wasteRecordService.findById(RECORD_ID);

        // Then
        assertNotNull(result);
        assertEquals(RECORD_ID, result.getId());
        assertEquals(RESIDENT_ID, result.getResidentId());
        verify(wasteRecordRepo).findById(RECORD_ID);
    }

    @Test
    public void testFindById_NotFound() {
        // Given
        String nonExistentId = "non-existent-id";
        when(wasteRecordRepo.findById(nonExistentId)).thenReturn(Optional.empty());

        // When & Then
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, 
            () -> wasteRecordService.findById(nonExistentId));
        
        assertEquals("Record not found: " + nonExistentId, exception.getReason());
        verify(wasteRecordRepo).findById(nonExistentId);
    }

    @Test
    public void testByResident_Success() {
        // Given
        List<WasteRecord> expectedRecords = Arrays.asList(testRecord, testRecord2);
        when(wasteRecordRepo.findByResidentId(RESIDENT_ID)).thenReturn(expectedRecords);

        // When
        List<WasteRecord> result = wasteRecordService.byResident(RESIDENT_ID);

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(expectedRecords, result);
        verify(wasteRecordRepo).findByResidentId(RESIDENT_ID);
    }

    @Test
    public void testByResident_EmptyResult() {
        // Given
        String unknownResidentId = "unknown-resident";
        when(wasteRecordRepo.findByResidentId(unknownResidentId)).thenReturn(Arrays.asList());

        // When
        List<WasteRecord> result = wasteRecordService.byResident(unknownResidentId);

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(wasteRecordRepo).findByResidentId(unknownResidentId);
    }

    @Test
    public void testList_WithTypeOnly() {
        // Given
        List<WasteRecord> expectedRecords = Arrays.asList(testRecord);
        when(wasteRecordRepo.findByResidentIdAndType(RESIDENT_ID, TYPE_PLASTIC))
            .thenReturn(expectedRecords);

        // When
        List<WasteRecord> result = wasteRecordService.list(RESIDENT_ID, TYPE_PLASTIC);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(TYPE_PLASTIC, result.get(0).getType());
        verify(wasteRecordRepo).findByResidentIdAndType(RESIDENT_ID, TYPE_PLASTIC);
    }

    @Test
    public void testUpdate_PreservesId() {
        // Given
        WasteRecord updatedRecord = new WasteRecord();
        updatedRecord.setType("Metal");
        updatedRecord.setQuantity(10.0);
        
        when(wasteRecordRepo.save(updatedRecord)).thenAnswer(invocation -> {
            WasteRecord saved = invocation.getArgument(0);
            saved.setId(RECORD_ID); // Simulate MongoDB behavior
            return saved;
        });

        // When
        WasteRecord result = wasteRecordService.update(RECORD_ID, updatedRecord);

        // Then
        assertEquals(RECORD_ID, result.getId());
        assertEquals("Metal", result.getType());
        assertEquals(10.0, result.getQuantity());
    }
}
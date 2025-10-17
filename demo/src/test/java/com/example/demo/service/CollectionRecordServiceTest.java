package com.example.demo.service;

import com.example.demo.model.CollectionRecord;
import com.example.demo.repository.CollectionRecordRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CollectionRecordServiceTest {

    @Mock
    private CollectionRecordRepository collectionRecordRepository;

    @InjectMocks
    private CollectionRecordService collectionRecordService;

    @Test
    public void testGetAllRecords() {
        // Given
        CollectionRecord record1 = new CollectionRecord();
        record1.setId("1");
        CollectionRecord record2 = new CollectionRecord();
        record2.setId("2");

        when(collectionRecordRepository.findAll()).thenReturn(Arrays.asList(record1, record2));

        // When
        List<CollectionRecord> result = collectionRecordService.getAllRecords();

        // Then
        assertEquals(2, result.size());
        verify(collectionRecordRepository, times(1)).findAll();
    }

    @Test
    public void testGetRecordsByBinId() {
        // Given
        CollectionRecord record1 = new CollectionRecord();
        record1.setBinId("BIN001");
        CollectionRecord record2 = new CollectionRecord();
        record2.setBinId("BIN001");

        when(collectionRecordRepository.findByBinId("BIN001"))
            .thenReturn(Arrays.asList(record1, record2));

        // When
        List<CollectionRecord> result = collectionRecordService.getRecordsByBinId("BIN001");

        // Then
        assertEquals(2, result.size());
        assertEquals("BIN001", result.get(0).getBinId());
    }

    @Test
    public void testDeleteRecord_Success() {
        // Given
        when(collectionRecordRepository.existsById("1")).thenReturn(true);

        // When
        boolean result = collectionRecordService.deleteRecordById("1");

        // Then
        assertTrue(result);
        verify(collectionRecordRepository, times(1)).deleteById("1");
    }

    @Test
    public void testDeleteRecord_NotFound() {
        // Given
        when(collectionRecordRepository.existsById("1")).thenReturn(false);

        // When
        boolean result = collectionRecordService.deleteRecordById("1");

        // Then
        assertFalse(result);
        verify(collectionRecordRepository, never()).deleteById("1");
    }
}
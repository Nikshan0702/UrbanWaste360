package com.example.demo.service;

import com.example.demo.model.Bin;
import com.example.demo.model.CollectionRecord;
import com.example.demo.repository.BinRepository;
import com.example.demo.repository.CollectionRecordRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CollectionServiceTest {

    @Mock
    private BinRepository binRepository;

    @Mock
    private CollectionRecordRepository recordRepository;

    @InjectMocks
    private CollectionService collectionService;

    @Test
    public void testGetBinsForCollector() {
        // Given
        Bin bin1 = new Bin();
        bin1.setBinId("BIN001");
        bin1.setAssignedCollectorId("COL001");
        
        Bin bin2 = new Bin();
        bin2.setBinId("BIN002");
        bin2.setAssignedCollectorId("COL001");

        when(binRepository.findByAssignedCollectorId("COL001"))
            .thenReturn(Arrays.asList(bin1, bin2));

        // When
        List<Bin> result = collectionService.getBinsForCollector("COL001");

        // Then
        assertEquals(2, result.size());
        assertEquals("COL001", result.get(0).getAssignedCollectorId());
    }

    @Test
    public void testGetBinById_Success() {
        // Given
        Bin bin = new Bin();
        bin.setBinId("BIN001");
        
        when(binRepository.findByBinId("BIN001")).thenReturn(bin);

        // When
        Bin result = collectionService.getBinById("BIN001");

        // Then
        assertNotNull(result);
        assertEquals("BIN001", result.getBinId());
    }

    @Test
    public void testGetBinById_NotFound() {
        // Given
        when(binRepository.findByBinId("BIN001")).thenReturn(null);

        // When & Then
        assertThrows(NoSuchElementException.class, () -> {
            collectionService.getBinById("BIN001");
        });
    }

    @Test
    public void testRecordCollection_Success() {
        // Given
        Bin bin = new Bin();
        bin.setBinId("BIN001");
        bin.setStatus("Empty");
        
        when(binRepository.findByBinId("BIN001")).thenReturn(bin);
        when(recordRepository.save(any(CollectionRecord.class))).thenReturn(new CollectionRecord());

        // When
        Map<String, Object> result = collectionService.recordCollection(
            "BIN001", "COL001", "Collected", "All good", "Plastic", "10.5"
        );

        // Then
        assertNotNull(result);
        assertEquals("Collection recorded successfully", result.get("message"));
        verify(recordRepository, times(1)).save(any(CollectionRecord.class));
    }

    @Test
    public void testRecordCollection_UpdatesBinStatus() {
        // Given
        Bin bin = new Bin();
        bin.setBinId("BIN001");
        bin.setStatus("Empty");
        
        when(binRepository.findByBinId("BIN001")).thenReturn(bin);
        when(recordRepository.save(any(CollectionRecord.class))).thenReturn(new CollectionRecord());
        when(binRepository.save(any(Bin.class))).thenReturn(bin);

        // When
        collectionService.recordCollection("BIN001", "COL001", "Collected", "", "Plastic", "10.5");

        // Then
        assertEquals("Collected", bin.getStatus());
        verify(binRepository, times(1)).save(bin);
    }

    @Test
    public void testSyncCollections_Success() {
        // Given
        Map<String, String> item1 = new HashMap<>();
        item1.put("binId", "BIN001");
        item1.put("collectorId", "COL001");
        item1.put("status", "Collected");
        
        Map<String, String> item2 = new HashMap<>();
        item2.put("binId", "BIN002");
        item2.put("collectorId", "COL001");
        item2.put("status", "Missed");

        List<Map<String, String>> batch = Arrays.asList(item1, item2);

        Bin bin1 = new Bin();
        bin1.setBinId("BIN001");
        Bin bin2 = new Bin();
        bin2.setBinId("BIN002");

        when(binRepository.findByBinId("BIN001")).thenReturn(bin1);
        when(binRepository.findByBinId("BIN002")).thenReturn(bin2);
        when(recordRepository.save(any(CollectionRecord.class))).thenReturn(new CollectionRecord());

        // When
        List<Map<String, Object>> result = collectionService.syncCollections(batch);

        // Then
        assertEquals(2, result.size());
        assertEquals("ok", result.get(0).get("status"));
        assertEquals("ok", result.get(1).get("status"));
    }
}
package com.example.demo.service;

import com.example.demo.model.Bin;
import com.example.demo.repository.BinRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BinServiceTest {

    @Mock
    private BinRepository binRepository;

    @InjectMocks
    private BinService binService;

    @Test
    public void testCreateBin_Success() {
        // Given
        Bin bin = new Bin();
        bin.setBinId("BIN001");
        bin.setLocation("Chennai");
        
        when(binRepository.save(any(Bin.class))).thenReturn(bin);

        // When
        Bin result = binService.createBin(bin);

        // Then
        assertNotNull(result);
        assertEquals("BIN001", result.getBinId());
        assertEquals("Chennai", result.getLocation());
        verify(binRepository, times(1)).save(bin);
    }

    @Test
    public void testGetAllBins() {
        // Given
        Bin bin1 = new Bin();
        bin1.setBinId("BIN001");
        Bin bin2 = new Bin();
        bin2.setBinId("BIN002");
        
        when(binRepository.findAll()).thenReturn(Arrays.asList(bin1, bin2));

        // When
        List<Bin> result = binService.getAllBins();

        // Then
        assertEquals(2, result.size());
        assertEquals("BIN001", result.get(0).getBinId());
        verify(binRepository, times(1)).findAll();
    }

    @Test
    public void testGetBinById_Found() {
        // Given
        Bin bin = new Bin();
        bin.setId("1");
        bin.setBinId("BIN001");
        
        when(binRepository.findById("1")).thenReturn(Optional.of(bin));

        // When
        Optional<Bin> result = binService.getBinById("1");

        // Then
        assertTrue(result.isPresent());
        assertEquals("BIN001", result.get().getBinId());
    }

    @Test
    public void testGetBinById_NotFound() {
        // Given
        when(binRepository.findById("1")).thenReturn(Optional.empty());

        // When
        Optional<Bin> result = binService.getBinById("1");

        // Then
        assertFalse(result.isPresent());
    }

    @Test
    public void testUpdateBin_Success() {
        // Given
        Bin existingBin = new Bin();
        existingBin.setId("1");
        existingBin.setBinId("OLD001");
        existingBin.setLocation("Old Location");

        Bin updatedDetails = new Bin();
        updatedDetails.setBinId("NEW001");
        updatedDetails.setLocation("New Location");
        updatedDetails.setStatus("Full");

        when(binRepository.findById("1")).thenReturn(Optional.of(existingBin));
        when(binRepository.save(any(Bin.class))).thenReturn(existingBin);

        // When
        Bin result = binService.updateBin("1", updatedDetails);

        // Then
        assertNotNull(result);
        assertEquals("NEW001", existingBin.getBinId());
        assertEquals("New Location", existingBin.getLocation());
        assertEquals("Full", existingBin.getStatus());
    }

    @Test
    public void testDeleteBin_Success() {
        // Given
        when(binRepository.existsById("1")).thenReturn(true);

        // When
        boolean result = binService.deleteBin("1");

        // Then
        assertTrue(result);
        verify(binRepository, times(1)).deleteById("1");
    }

    @Test
    public void testDeleteBin_NotFound() {
        // Given
        when(binRepository.existsById("1")).thenReturn(false);

        // When
        boolean result = binService.deleteBin("1");

        // Then
        assertFalse(result);
        verify(binRepository, never()).deleteById("1");
    }
}
package com.ocp.pdr.controller;

import com.ocp.pdr.service.ExcelExportService;
import com.ocp.pdr.service.ExcelImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;

@RestController
@RequestMapping({"/api/excel", "/api/import-export"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ImportExportController {

    private final ExcelImportService excelImportService;
    private final ExcelExportService excelExportService;

    @PostMapping("/import")
    public ResponseEntity<String> importExcel(@RequestParam("file") MultipartFile file) {
        try {
            String message = excelImportService.importExcelData(file);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de l'import: " + e.getMessage());
        }
    }

    @GetMapping("/export")
    public ResponseEntity<InputStreamResource> exportExcel() {
        ByteArrayInputStream in = excelExportService.exportResultats();
        
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=resultats_approvisionnement.xlsx");
        
        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }
}


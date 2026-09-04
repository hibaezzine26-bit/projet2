package com.ocp.pdr.controller;

import java.io.ByteArrayInputStream;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ocp.pdr.dto.response.ImportResult;
import com.ocp.pdr.service.ExcelExportService;
import com.ocp.pdr.service.ExcelImportService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping({"/api/excel", "/api/import-export"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class ImportExportController {

    private final ExcelImportService excelImportService;
    private final ExcelExportService excelExportService;

    /**
     * Importe les données depuis un fichier Excel
     */
    @PostMapping("/import")
    public ResponseEntity<Map<String, Object>> importExcel(@RequestParam("file") MultipartFile file) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            if (file.isEmpty()) {
                log.warn("Tentative d'import avec fichier vide");
                response.put("success", false);
                response.put("message", "Le fichier est vide");
                response.put("timestamp", System.currentTimeMillis());
                return ResponseEntity.badRequest().body(response);
            }
            
            log.info("Import de fichier en cours: {}", file.getOriginalFilename());
            long startTime = System.currentTimeMillis();
            
            ImportResult importResult = excelImportService.importExcelData(file);
            
            long duration = System.currentTimeMillis() - startTime;
            log.info("Import terminé avec succès en {}ms", duration);
            
            response.put("success", importResult.success());
            response.put("message", importResult.message());
            response.put("lignesImportees", importResult.lignesImportees());
            response.put("erreurs", importResult.erreurs());
            response.put("detailsErreurs", importResult.detailsErreurs());
            response.put("fileName", file.getOriginalFilename());
            response.put("duration", duration);
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur lors de l'import du fichier: {}", file.getOriginalFilename(), e);
            response.put("success", false);
            response.put("message", "Erreur lors de l'import: " + e.getMessage());
            response.put("fileName", file.getOriginalFilename());
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Exporte les résultats d'approvisionnement en Excel
     */
    @GetMapping("/export")
    public ResponseEntity<InputStreamResource> exportExcel() {
        try {
            log.info("Export des résultats d'approvisionnement");
            
            ByteArrayInputStream in = excelExportService.exportResultats();
            
            HttpHeaders headers = new HttpHeaders();
            String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
            headers.add("Content-Disposition", "attachment; filename=resultats_approvisionnement_" + timestamp + ".xlsx");
            
            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(new InputStreamResource(in));
        } catch (Exception e) {
            log.error("Erreur lors de l'export des résultats", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Exporte les règles Min & Max en Excel
     */
    @GetMapping({"/export-min-max", "/export/min-max"})
    public ResponseEntity<InputStreamResource> exportMinMax() {
        try {
            log.info("Export de la règle Min & Max");
            ByteArrayInputStream in = excelExportService.exportMinMax();

            HttpHeaders headers = new HttpHeaders();
            String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
            headers.add("Content-Disposition", "attachment; filename=regle_min_max_" + timestamp + ".xlsx");

            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(new InputStreamResource(in));
        } catch (Exception e) {
            log.error("Erreur lors de l'export de la règle Min & Max", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping({"/export-planifie", "/export/planifie"})
    public ResponseEntity<InputStreamResource> exportPlanifie() {
        try {
            log.info("Export de la règle Mode Planifié");
            ByteArrayInputStream in = excelExportService.exportPlanifie();

            HttpHeaders headers = new HttpHeaders();
            String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
            headers.add("Content-Disposition", "attachment; filename=regle_mode_planifie_" + timestamp + ".xlsx");

            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(new InputStreamResource(in));
        } catch (Exception e) {
            log.error("Erreur lors de l'export de la règle Mode Planifié", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping({"/export-sur-demande", "/export/sur-demande"})
    public ResponseEntity<InputStreamResource> exportSurDemande() {
        try {
            log.info("Export de la règle Sur Demande");
            ByteArrayInputStream in = excelExportService.exportSurDemande();

            HttpHeaders headers = new HttpHeaders();
            String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
            headers.add("Content-Disposition", "attachment; filename=regle_sur_demande_" + timestamp + ".xlsx");

            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(new InputStreamResource(in));
        } catch (Exception e) {
            log.error("Erreur lors de l'export de la règle Sur Demande", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping({"/export-anomalies", "/export/anomalies"})
    public ResponseEntity<InputStreamResource> exportAnomalies() {
        try {
            log.info("Export des anomalies de consommation");
            
            ByteArrayInputStream in = excelExportService.exportAnomalies();
            
            HttpHeaders headers = new HttpHeaders();
            String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
            headers.add("Content-Disposition", "attachment; filename=anomalies_" + timestamp + ".xlsx");
            
            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(new InputStreamResource(in));
        } catch (Exception e) {
            log.error("Erreur lors de l'export des anomalies", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}


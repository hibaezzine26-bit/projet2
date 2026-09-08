package com.ocp.pdr.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ocp.pdr.dto.response.AnalysisSummaryResponse;
import com.ocp.pdr.dto.response.ApiSuccessResponse;
import com.ocp.pdr.model.AnomalieConsommation;
import com.ocp.pdr.model.ResultatApprovisionnement;
import com.ocp.pdr.service.AnalyseConsommationService;
import com.ocp.pdr.service.MoteurApprovisionnementService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/analyse")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class AnalyseController {

    private final MoteurApprovisionnementService moteurApprovisionnementService;
    private final AnalyseConsommationService analyseConsommationService;

    @PostMapping("/executer")
    public ResponseEntity<ApiSuccessResponse> executerAnalyse() {
        try {
            log.info("Requête d'exécution d'analyse globale reçue");
            List<ResultatApprovisionnement> resultats = moteurApprovisionnementService.executerAnalyseGlobale();

            ApiSuccessResponse response = ApiSuccessResponse.builder()
                    .success(true)
                    .message("Analyse exécutée avec succès")
                    .resultCount(resultats.size())
                    .timestamp(System.currentTimeMillis())
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur lors de l'exécution de l'analyse", e);
            ApiSuccessResponse error = ApiSuccessResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .timestamp(System.currentTimeMillis())
                    .build();
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @GetMapping("/resultats")
    public ResponseEntity<List<ResultatApprovisionnement>> getResultats() {
        return ResponseEntity.ok(moteurApprovisionnementService.obtenirTousLesResultats());
    }

    @GetMapping("/anomalies")
    public ResponseEntity<List<AnomalieConsommation>> getAnomalies() {
        return ResponseEntity.ok(analyseConsommationService.obtenirToutesAnomalies());
    }

    @GetMapping("/etat")
    public ResponseEntity<Map<String, Object>> getEtatAnalyse() {
        Map<String, Object> etat = new HashMap<>();
        etat.put("analyseLancee", moteurApprovisionnementService.isAnalyseLancee());
        return ResponseEntity.ok(etat);
    }

    @GetMapping("/summary")
    public ResponseEntity<AnalysisSummaryResponse> getSummary() {
        Map<String, Object> summary = moteurApprovisionnementService.obtenirSummaryAnalyseDto();

        AnalysisSummaryResponse response = AnalysisSummaryResponse.builder()
                .totalArticles(((Number) summary.getOrDefault("totalArticles", 0)).longValue())
                .minMaxCount(((Number) summary.getOrDefault("minMaxCount", 0)).longValue())
                .planifieCount(((Number) summary.getOrDefault("planifieCount", 0)).longValue())
                .surDemandeCount(((Number) summary.getOrDefault("surDemandeCount", 0)).longValue())
                .anomaliesCount(((Number) summary.getOrDefault("anomaliesCount", 0)).longValue())
                .articlesEnStock(((Number) summary.getOrDefault("articlesEnStock", 0)).longValue())
                .minMaxRate(((Number) summary.getOrDefault("minMaxRate", 0)).doubleValue())
                .planifieRate(((Number) summary.getOrDefault("planifieRate", 0)).doubleValue())
                .surDemandeRate(((Number) summary.getOrDefault("surDemandeRate", 0)).doubleValue())
                .stockRate(((Number) summary.getOrDefault("stockRate", 0)).doubleValue())
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/statistiques")
    public ResponseEntity<Map<String, Object>> getStatistiques() {
        return ResponseEntity.ok(moteurApprovisionnementService.obtenirStatistiques());
    }
}

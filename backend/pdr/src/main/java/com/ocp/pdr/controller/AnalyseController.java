package com.ocp.pdr.controller;

import com.ocp.pdr.model.AnomalieConsommation;
import com.ocp.pdr.model.ResultatApprovisionnement;
import com.ocp.pdr.repository.AnomalieConsommationRepository;
import com.ocp.pdr.repository.ArticlePDRRepository;
import com.ocp.pdr.repository.ResultatApprovisionnementRepository;
import com.ocp.pdr.service.MoteurApprovisionnementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analyse")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class AnalyseController {

    private final MoteurApprovisionnementService moteurApprovisionnementService;
    private final ResultatApprovisionnementRepository resultatRepository;
    private final AnomalieConsommationRepository anomalieRepository;
    private final ArticlePDRRepository articlePDRRepository;

    /**
     * Exécute l'analyse globale d'approvisionnement pour tous les articles
     * @return Liste des résultats d'approvisionnement générés
     */
    @PostMapping("/executer")
    public ResponseEntity<Map<String, Object>> executerAnalyse() {
        try {
            log.info("Requête d'exécution d'analyse globale reçue");
            List<ResultatApprovisionnement> resultats = moteurApprovisionnementService.executerAnalyseGlobale();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Analyse exécutée avec succès");
            response.put("resultCount", resultats.size());
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur lors de l'exécution de l'analyse", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            error.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * Récupère tous les résultats d'approvisionnement
     */
    @GetMapping("/resultats")
    public ResponseEntity<List<ResultatApprovisionnement>> getResultats() {
        return ResponseEntity.ok(resultatRepository.findAllWithArticle());
    }

    /**
     * Récupère toutes les anomalies détectées
     */
    @GetMapping("/anomalies")
    public ResponseEntity<List<AnomalieConsommation>> getAnomalies() {
        return ResponseEntity.ok(anomalieRepository.findAll());
    }

    /**
     * Récupère un résumé de l'analyse avec statistiques
     */
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        try {
            Map<String, Object> summary = moteurApprovisionnementService.obtenirSummaryAnalyse();
            summary.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            log.error("Erreur lors de la génération du summary", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            error.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * Récupère les statistiques consolidées
     */
    @GetMapping("/statistiques")
    public ResponseEntity<Map<String, Object>> getStatistiques() {
        try {
            Map<String, Object> stats = new HashMap<>();
            
            long totalArticles = articlePDRRepository.count();
            long totalResultats = resultatRepository.count();
            long totalAnomalies = anomalieRepository.count();
            
            stats.put("totalArticles", totalArticles);
            stats.put("articlesAnalyses", totalResultats);
            stats.put("anomaliesDetectees", totalAnomalies);
            stats.put("tauxAnalyse", totalArticles > 0 ? (double) totalResultats / totalArticles * 100 : 0);
            stats.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Erreur lors de la génération des statistiques", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            error.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.internalServerError().body(error);
        }
    }
}

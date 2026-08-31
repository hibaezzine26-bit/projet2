package com.ocp.pdr.controller;

import com.ocp.pdr.model.AnomalieConsommation;
import com.ocp.pdr.model.ResultatApprovisionnement;
import com.ocp.pdr.repository.AnomalieConsommationRepository;
import com.ocp.pdr.repository.ArticlePDRRepository;
import com.ocp.pdr.repository.ResultatApprovisionnementRepository;
import com.ocp.pdr.service.MoteurApprovisionnementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analyse")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AnalyseController {

    private final MoteurApprovisionnementService moteurApprovisionnementService;
    private final ResultatApprovisionnementRepository resultatRepository;
    private final AnomalieConsommationRepository anomalieRepository;
    private final ArticlePDRRepository articlePDRRepository;

    @PostMapping("/executer")
    public ResponseEntity<String> executerAnalyse() {
        moteurApprovisionnementService.executerAnalyseGlobale();
        return ResponseEntity.ok("Analyse exécutée avec succès");
    }

    @GetMapping("/resultats")
    public ResponseEntity<List<ResultatApprovisionnement>> getResultats() {
        return ResponseEntity.ok(resultatRepository.findAll());
    }

    @GetMapping("/anomalies")
    public ResponseEntity<List<AnomalieConsommation>> getAnomalies() {
        return ResponseEntity.ok(anomalieRepository.findAll());
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        Map<String, Object> summary = new HashMap<>();
        List<ResultatApprovisionnement> resultats = resultatRepository.findAll();
        List<AnomalieConsommation> anomalies = anomalieRepository.findAll();

        summary.put("totalArticles", articlePDRRepository.count());
        summary.put("minMaxCount", resultats.stream().filter(r -> r.getMode() != null && r.getMode().name().equals("MIN_MAX")).count());
        summary.put("planifieCount", resultats.stream().filter(r -> r.getMode() != null && r.getMode().name().equals("PLANIFIE")).count());
        summary.put("surDemandeCount", resultats.stream().filter(r -> r.getMode() != null && r.getMode().name().equals("SUR_DEMANDE")).count());
        summary.put("anomaliesCount", anomalies.size());
        summary.put("articlesCritiques", articlePDRRepository.findAll().stream()
                .filter(article -> article.getGroupeHomogene() != null && article.getGroupeHomogene().name().equals("CRITIQUE")).count());
        return ResponseEntity.ok(summary);
    }
}

package com.ocp.pdr.service;

import com.ocp.pdr.model.ArticlePDR;
import com.ocp.pdr.model.ResultatApprovisionnement;
import com.ocp.pdr.model.enums.ModeApprovisionnement;
import com.ocp.pdr.repository.AnomalieConsommationRepository;
import com.ocp.pdr.repository.ArticlePDRRepository;
import com.ocp.pdr.repository.ResultatApprovisionnementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MoteurApprovisionnementService {

    private final RegleMinMaxService regleMinMaxService;
    private final ReglePlanifieService reglePlanifieService;
    private final RegleSurDemandeService regleSurDemandeService;
    private final AnalyseConsommationService analyseConsommationService;
    
    private final ArticlePDRRepository articlePDRRepository;
    private final ResultatApprovisionnementRepository resultatApprovisionnementRepository;
    private final AnomalieConsommationRepository anomalieConsommationRepository;

    @Transactional
    public ResultatApprovisionnement analyser(ArticlePDR article) {
        ResultatApprovisionnement resultat = new ResultatApprovisionnement();
        resultat.setArticle(article);
        resultat.setDateAnalyse(LocalDate.now());

        // 1. Min & Max
        if (regleMinMaxService.verifier(article)) {
            resultat.setMode(ModeApprovisionnement.MIN_MAX);
            resultat.setPriorite(1);
            resultat.setQuantiteALancer(regleMinMaxService.calculerQuantite(article));
            resultat.setJustification("Article ciblé avec Stock < Seuil Minimum");
        } 
        // 2. Mode Planifié
        else if (reglePlanifieService.verifier(article)) {
            resultat.setMode(ModeApprovisionnement.PLANIFIE);
            resultat.setPriorite(2);
            resultat.setQuantiteALancer(reglePlanifieService.calculerQuantite(article));
            resultat.setJustification("Article requis pour OT du backlog et non retenu par Min&Max");
        } 
        // 3. Sur Demande
        else if (regleSurDemandeService.verifier(article)) {
            resultat.setMode(ModeApprovisionnement.SUR_DEMANDE);
            resultat.setPriorite(3);
            resultat.setQuantiteALancer(regleSurDemandeService.calculerQuantite(article));
            resultat.setJustification("Rupture de stock non couverte par Min&Max ni Planifié");
        } else {
            // Aucun besoin d'approvisionnement détecté
            return null;
        }

        // Sauvegarder le résultat
        if (resultat.getQuantiteALancer() != null && resultat.getQuantiteALancer() > 0) {
            return resultatApprovisionnementRepository.save(resultat);
        }
        
        return null;
    }

    @Transactional
    public List<ResultatApprovisionnement> executerAnalyseGlobale() {
        resultatApprovisionnementRepository.deleteAll();
        anomalieConsommationRepository.deleteAll();
        
        List<ArticlePDR> allArticles = articlePDRRepository.findAll();
        List<ResultatApprovisionnement> resultats = new ArrayList<>();

        for (ArticlePDR article : allArticles) {
            // 1. Analyse d'approvisionnement
            ResultatApprovisionnement resultat = analyser(article);
            if (resultat != null) {
                resultats.add(resultat);
            }

            // 2. Analyse des consommations inhabituelles
            analyseConsommationService.detecterEtSauvegarderAnomalie(article);
        }

        return resultats;
    }
}

package com.ocp.pdr.service;

import com.ocp.pdr.model.ArticlePDR;
import com.ocp.pdr.model.Stock;
import com.ocp.pdr.model.enums.GroupeHomogene;
import org.springframework.stereotype.Service;

@Service
public class RegleSurDemandeService {

    public boolean verifier(ArticlePDR article) {
        if (article == null || article.getStocks() == null) {
            return false;
        }

        GroupeHomogene groupe = article.getGroupeHomogene();
        boolean isGroupePrioritaire = (groupe == GroupeHomogene.CURATIF
                || groupe == GroupeHomogene.CRITIQUE
                || groupe == GroupeHomogene.CONDITIONNEL);

        boolean presentDansBacklog = article.getBacklogOTs() != null && article.getBacklogOTs().stream()
                .anyMatch(ot -> ot.getQuantiteNonLancee() != null && ot.getQuantiteNonLancee() > 0);

        double stockTotal = article.getStocks().stream()
                .mapToDouble(stock -> stock.getQuantiteStock() != null ? stock.getQuantiteStock() : 0.0)
                .sum();

        boolean stockInsuffisant = article.getSeuilMin() != null && stockTotal < article.getSeuilMin();

        return !isGroupePrioritaire
                && !presentDansBacklog
                && stockInsuffisant;
    }

    public Double calculerQuantite(ArticlePDR article) {
        // Typically Sur Demande relies on a specific requested quantity (Besoin)
        // Defaulting to 1.0 or should fetch from BesoinEnCours if applicable
        if (article != null && article.getBesoinsEnCours() != null) {
            return article.getBesoinsEnCours().stream()
                    .filter(b -> b.getQuantiteBesoin() != null)
                    .mapToDouble(b -> b.getQuantiteBesoin())
                    .sum();
        }
        return 0.0;
    }
}

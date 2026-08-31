package com.ocp.pdr.service;

import com.ocp.pdr.model.ArticlePDR;
import com.ocp.pdr.model.BacklogOT;
import com.ocp.pdr.model.enums.GroupeHomogene;
import org.springframework.stereotype.Service;

@Service
public class ReglePlanifieService {

    public boolean verifier(ArticlePDR article) {
        if (article == null || article.getBacklogOTs() == null || article.getStocks() == null) {
            return false;
        }

        GroupeHomogene groupe = article.getGroupeHomogene();
        boolean isGroupePrioritaire = (groupe == GroupeHomogene.CURATIF
                || groupe == GroupeHomogene.CRITIQUE
                || groupe == GroupeHomogene.CONDITIONNEL);

        if (isGroupePrioritaire) {
            return false;
        }

        double stockTotal = article.getStocks().stream()
                .mapToDouble(stock -> stock.getQuantiteStock() != null ? stock.getQuantiteStock() : 0.0)
                .sum();

        boolean stockEnDessousDuMin = article.getSeuilMin() != null && stockTotal < article.getSeuilMin();

        return stockEnDessousDuMin && article.getBacklogOTs().stream()
                .anyMatch(ot -> ot.getQuantiteNonLancee() != null && ot.getQuantiteNonLancee() > 0);
    }

    public Double calculerQuantite(ArticlePDR article) {
        if (article == null || article.getBacklogOTs() == null) {
            return 0.0;
        }
        
        // Sum up the required quantities from the backlog
        return article.getBacklogOTs().stream()
                .filter(ot -> ot.getQuantiteNonLancee() != null)
                .mapToDouble(BacklogOT::getQuantiteNonLancee)
                .sum();
    }
}

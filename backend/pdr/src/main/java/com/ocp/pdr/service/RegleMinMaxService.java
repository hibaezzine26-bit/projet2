package com.ocp.pdr.service;
import com.ocp.pdr.model.ArticlePDR;
import com.ocp.pdr.model.Stock;
import com.ocp.pdr.model.enums.GroupeHomogene;
import org.springframework.stereotype.Service;
@Service
public class RegleMinMaxService {

    public boolean verifier(ArticlePDR article) {
        if (article == null || article.getStocks() == null) {
            return false;
        }

        GroupeHomogene groupe = article.getGroupeHomogene();
        boolean isGroupePrioritaire = (groupe == GroupeHomogene.CURATIF
                || groupe == GroupeHomogene.CRITIQUE
                || groupe == GroupeHomogene.CONDITIONNEL);

        if (!isGroupePrioritaire) {
            return false;
        }

        double stockTotal = article.getStocks().stream()
                .mapToDouble(Stock::getQuantiteStock)
                .sum();

        return article.getSeuilMin() != null && stockTotal < article.getSeuilMin();
    }

    public Double calculerQuantite(ArticlePDR article) {
        if (article == null || article.getSeuilMax() == null) {
            return 0.0;
        }
        
        double stockTotal = article.getStocks() != null ? 
            article.getStocks().stream().mapToDouble(Stock::getQuantiteStock).sum() : 0.0;
            
        double quantiteALancer = article.getSeuilMax() - stockTotal;
        return quantiteALancer > 0 ? quantiteALancer : 0.0;
    }
}

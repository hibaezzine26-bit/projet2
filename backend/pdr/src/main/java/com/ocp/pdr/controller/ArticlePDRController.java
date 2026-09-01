package com.ocp.pdr.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ocp.pdr.model.ArticlePDR;
import com.ocp.pdr.model.enums.GroupeHomogene;
import com.ocp.pdr.repository.ArticlePDRRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class ArticlePDRController {

    private final ArticlePDRRepository articlePDRRepository;

    /**
     * Récupère tous les articles avec pagination
     */
    @GetMapping
    public ResponseEntity<Page<ArticlePDR>> getAllArticles(Pageable pageable) {
        log.info("Récupération des articles avec pagination: page={}, size={}", pageable.getPageNumber(), pageable.getPageSize());
        return ResponseEntity.ok(articlePDRRepository.findAll(pageable));
    }

    /**
     * Recherche d'articles par terme
     */
    @GetMapping("/search")
    public ResponseEntity<Page<ArticlePDR>> searchArticles(@RequestParam String term, Pageable pageable) {
        log.info("Recherche d'articles: term={}", term);
        return ResponseEntity.ok(articlePDRRepository.search(term, pageable));
    }

    /**
     * Récupère les articles par groupe homogène
     */
    @GetMapping("/groupe/{groupe}")
    public ResponseEntity<Page<ArticlePDR>> getArticlesByGroupe(
            @PathVariable GroupeHomogene groupe,
            Pageable pageable) {
        log.info("Récupération des articles du groupe: {}", groupe);
        return ResponseEntity.ok(articlePDRRepository.findByGroupeHomogene(groupe, pageable));
    }

    /**
     * Récupère un article spécifique
     */
    @GetMapping("/{id}")
    public ResponseEntity<ArticlePDR> getArticleById(@PathVariable Long id) {
        log.info("Récupération de l'article: id={}", id);
        return articlePDRRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Récupère un article par son code SAP
     */
    @GetMapping("/code/{codeSAP}")
    public ResponseEntity<ArticlePDR> getArticleByCodeSAP(@PathVariable String codeSAP) {
        log.info("Récupération de l'article par code SAP: {}", codeSAP);
        return articlePDRRepository.findByCodeSAP(codeSAP)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Crée ou met à jour un article
     */
    @PostMapping
    public ResponseEntity<ArticlePDR> createArticle(@RequestBody ArticlePDR article) {
        try {
            log.info("Création d'un nouvel article: {}", article.getCodeSAP());
            
            if (article.getId() == null) {
                article.setDateCreation(LocalDateTime.now());
            }
            article.setDateModification(LocalDateTime.now());
            
            ArticlePDR saved = articlePDRRepository.save(article);
            log.info("Article créé avec succès: id={}", saved.getId());
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            log.error("Erreur lors de la création de l'article", e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Met à jour un article existant
     */
    @PutMapping("/{id}")
    public ResponseEntity<ArticlePDR> updateArticle(@PathVariable Long id, @RequestBody ArticlePDR article) {
        try {
            log.info("Mise à jour de l'article: id={}", id);
            return articlePDRRepository.findById(id)
                    .map(existing -> {
                        article.setId(id);
                        article.setDateCreation(existing.getDateCreation());
                        article.setDateModification(LocalDateTime.now());
                        ArticlePDR updated = articlePDRRepository.save(article);
                        log.info("Article mis à jour avec succès: id={}", id);
                        return ResponseEntity.ok(updated);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Erreur lors de la mise à jour de l'article", e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Supprime un article
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteArticle(@PathVariable Long id) {
        try {
            log.info("Suppression de l'article: id={}", id);
            if (articlePDRRepository.existsById(id)) {
                articlePDRRepository.deleteById(id);
                log.info("Article supprimé avec succès: id={}", id);
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erreur lors de la suppression de l'article", e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Récupère un résumé des articles
     */
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        try {
            Map<String, Object> summary = new HashMap<>();
            List<ArticlePDR> allArticles = articlePDRRepository.findAllWithStocks();
            
            summary.put("totalArticles", allArticles.size());
            summary.put("articlesAvecSeuil", allArticles.stream()
                    .filter(article -> article.getSeuilMin() != null && article.getSeuilMax() != null)
                    .count());
            summary.put("articlesSansStock", allArticles.stream()
                    .filter(article -> article.getStocks() != null && 
                            article.getStocks().stream()
                                    .mapToDouble(stock -> {
                                        Double quantite = stock.getQuantiteStock();
                                        return quantite == null ? 0.0 : quantite;
                                    })
                                    .sum() == 0)
                    .count());
            summary.put("articlesCritiques", allArticles.stream()
                    .filter(a -> a.getGroupeHomogene() == GroupeHomogene.CRITIQUE)
                    .count());
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
}

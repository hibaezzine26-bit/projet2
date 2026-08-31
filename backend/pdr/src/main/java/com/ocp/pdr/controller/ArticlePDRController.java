package com.ocp.pdr.controller;

import com.ocp.pdr.model.ArticlePDR;
import com.ocp.pdr.repository.ArticlePDRRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ArticlePDRController {

    private final ArticlePDRRepository articlePDRRepository;

    @GetMapping
    public ResponseEntity<List<ArticlePDR>> getAllArticles() {
        return ResponseEntity.ok(articlePDRRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ArticlePDR> getArticleById(@PathVariable Long id) {
        return articlePDRRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalArticles", articlePDRRepository.count());
        summary.put("articlesAvecSeuil", articlePDRRepository.findAll().stream()
                .filter(article -> article.getSeuilMin() != null && article.getSeuilMax() != null)
                .count());
        summary.put("articlesSansStock", articlePDRRepository.findAll().stream()
                .filter(article -> article.getStocks() != null && article.getStocks().stream().mapToDouble(s -> s.getQuantiteStock() == null ? 0 : s.getQuantiteStock()).sum() == 0)
                .count());
        return ResponseEntity.ok(summary);
    }
}

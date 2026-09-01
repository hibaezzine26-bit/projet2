package com.ocp.pdr.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "besoin_en_cours")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BesoinEnCours {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "quantite_besoin")
    private Double quantiteBesoin;

    @Column(name = "date_besoin")
    private LocalDate dateBesoin;

    @Column(name = "statut")
    private String statut;

    @Column(name = "source_fichier")
    private String sourceFichier;

    @Column(name = "date_import")
    private LocalDateTime dateImport;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id", nullable = false)
    private ArticlePDR article;
}

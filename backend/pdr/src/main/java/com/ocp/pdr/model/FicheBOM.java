package com.ocp.pdr.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "bom")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FicheBOM {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reference", columnDefinition = "LONGTEXT")
    private String reference;

    @Column(name = "quantite_par_equipement")
    private Double quantiteParEquipement;

    @Column(name = "date_import")
    private LocalDate dateImport;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id", nullable = false)
    private ArticlePDR article;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "secteur_id", nullable = false)
    private Secteur secteur;
}

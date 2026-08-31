package com.ocp.pdr.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "bom")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BOM {

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

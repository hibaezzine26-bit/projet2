package com.ocp.pdr.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "anomalie_consommation")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnomalieConsommation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "consommation_mensuelle")
    private Double consommationMensuelle;

    @Column(name = "quantite_installee")
    private Double quantiteInstallee;

    @Column(name = "taux_consommation")
    private Double tauxConsommation;

    @Column(name = "seuil")
    private Double seuil;

    @Column(name = "date_detection")
    private LocalDate dateDetection;

    @Column(name = "statut")
    private String statut;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id", nullable = false)
    private ArticlePDR article;
}

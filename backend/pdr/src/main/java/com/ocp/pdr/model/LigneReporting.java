package com.ocp.pdr.model;

import com.ocp.pdr.model.enums.ModeApprovisionnement;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ligne_reporting")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LigneReporting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code_sap")
    private String codeSAP;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "stock")
    private Double stock;

    @Column(name = "quantite_a_lancer")
    private Double quantiteALancer;

    @Enumerated(EnumType.STRING)
    @Column(name = "mode")
    private ModeApprovisionnement mode;

    @Column(name = "priorite")
    private Integer priorite;

    @Column(name = "observation", columnDefinition = "TEXT")
    private String observation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporting_id", nullable = false)
    private Reporting reporting;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id")
    private ArticlePDR article;
}

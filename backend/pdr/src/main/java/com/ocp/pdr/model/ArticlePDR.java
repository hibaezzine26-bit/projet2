package com.ocp.pdr.model;

import com.ocp.pdr.model.enums.GroupeHomogene;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Table(name = "article_pdr")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArticlePDR {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code_sap", unique = true, nullable = false)
    private String codeSAP;

    @Column(name = "code_oracle")
    private String codeOracle;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "reference", columnDefinition = "TEXT")
    private String reference;

    @Column(name = "udm")
    private String udm;

    @Column(name = "quantite_installee")
    private Double quantiteInstallee;

    @Column(name = "categorie", columnDefinition = "TEXT")
    private String categorie;

    @Enumerated(EnumType.STRING)
    @Column(name = "groupe_homogene")
    private GroupeHomogene groupeHomogene;

    @Column(name = "seuil_min")
    private Double seuilMin;

    @Column(name = "seuil_max")
    private Double seuilMax;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "article", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Stock> stocks;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "article", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ResultatApprovisionnement> resultatsApprovisionnement;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "article", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BOM> boms;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "article", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BesoinEnCours> besoinsEnCours;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "article", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BacklogOT> backlogOTs;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "article", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Consommation> consommations;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "article", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AnomalieConsommation> anomaliesConsommation;
}

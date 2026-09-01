package com.ocp.pdr.model;

import java.time.LocalDateTime;
import java.util.List;

import com.ocp.pdr.model.enums.GroupeHomogene;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @Column(name = "date_modification")
    private LocalDateTime dateModification;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "article", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Stock> stocks;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "article", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ResultatApprovisionnement> resultatsApprovisionnement;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "article", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FicheBOM> boms;

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

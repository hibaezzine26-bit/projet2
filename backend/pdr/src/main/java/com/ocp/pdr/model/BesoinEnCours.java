package com.ocp.pdr.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id", nullable = false)
    private ArticlePDR article;
}

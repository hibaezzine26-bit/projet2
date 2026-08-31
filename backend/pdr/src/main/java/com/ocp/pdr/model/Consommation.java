package com.ocp.pdr.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "consommation")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Consommation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "quantite_consommee")
    private Double quantiteConsommee;

    @Column(name = "date_consommation")
    private LocalDate dateConsommation;

    @Column(name = "numero_ot")
    private String numeroOT;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id", nullable = false)
    private ArticlePDR article;
}

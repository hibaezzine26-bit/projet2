package com.ocp.pdr.model;

import com.ocp.pdr.model.enums.ModeApprovisionnement;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "resultat_approvisionnement")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResultatApprovisionnement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "mode")
    private ModeApprovisionnement mode;

    @Column(name = "quantite_a_lancer")
    private Double quantiteALancer;

    @Column(name = "priorite")
    private Integer priorite;

    @Column(name = "justification", columnDefinition = "TEXT")
    private String justification;

    @Column(name = "date_analyse")
    private LocalDate dateAnalyse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id", nullable = false)
    private ArticlePDR article;
}

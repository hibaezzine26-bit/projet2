package com.ocp.pdr.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "backlog_ot")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BacklogOT {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_ot")
    private String numeroOT;

    @Column(name = "quantite_non_lancee")
    private Double quantiteNonLancee;

    @Column(name = "date_import")
    private LocalDate dateImport;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id", nullable = false)
    private ArticlePDR article;
}

package com.ocp.pdr.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "historique_traitement")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HistoriqueTraitement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "operation")
    private String operation;

    @Column(name = "date_operation")
    private LocalDateTime dateOperation;

    @Column(name = "statut")
    private String statut;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "import_id")
    private ImportDonnees importDonnees;
}

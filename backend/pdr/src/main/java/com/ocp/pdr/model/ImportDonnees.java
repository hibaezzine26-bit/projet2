package com.ocp.pdr.model;

import com.ocp.pdr.model.enums.TypeFichier;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "import_donnees")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImportDonnees {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nom_fichier")
    private String nomFichier;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_fichier")
    private TypeFichier typeFichier;

    @Column(name = "date_import")
    private LocalDateTime dateImport;

    @Column(name = "nombre_lignes")
    private Integer nombreLignes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "administrateur_id")
    private Administrateur administrateur;

    @OneToMany(mappedBy = "importDonnees", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HistoriqueTraitement> historiqueTraitements;
}

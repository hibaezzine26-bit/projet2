package com.ocp.pdr.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Table(name = "administrateur")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Administrateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nom")
    private String nom;

    @Column(name = "prenom")
    private String prenom;

    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Column(name = "mot_de_passe")
    private String motDePasse;

    @Column(name = "actif")
    private Boolean actif;

    @OneToMany(mappedBy = "administrateur", cascade = CascadeType.ALL)
    private List<ImportDonnees> imports;
}

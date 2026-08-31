package com.ocp.pdr.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "reporting")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reporting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date_generation")
    private LocalDateTime dateGeneration;

    @Column(name = "periode")
    private String periode;

    @OneToMany(mappedBy = "reporting", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LigneReporting> lignes;
}

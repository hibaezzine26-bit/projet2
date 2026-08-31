package com.ocp.pdr.model;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class SecteurBOMTest {

    @Test
    void shouldCreateBomLinkedToSecteur() {
        Secteur secteur = new Secteur();
        secteur.setNom("Ammoniac");

        BOM bom = new BOM();
        bom.setSecteur(secteur);

        assertEquals("Ammoniac", bom.getSecteur().getNom());
    }
}

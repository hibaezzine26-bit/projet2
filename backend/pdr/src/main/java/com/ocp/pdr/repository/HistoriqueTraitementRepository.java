package com.ocp.pdr.repository;

import com.ocp.pdr.model.HistoriqueTraitement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HistoriqueTraitementRepository extends JpaRepository<HistoriqueTraitement, Long> {
}

package com.ocp.pdr.repository;

import com.ocp.pdr.model.Consommation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConsommationRepository extends JpaRepository<Consommation, Long> {
}

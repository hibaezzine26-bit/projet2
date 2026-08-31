package com.ocp.pdr.repository;

import com.ocp.pdr.model.AnomalieConsommation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnomalieConsommationRepository extends JpaRepository<AnomalieConsommation, Long> {
}

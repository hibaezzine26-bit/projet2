package com.ocp.pdr.repository;

import com.ocp.pdr.model.LigneReporting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LigneReportingRepository extends JpaRepository<LigneReporting, Long> {
    
}

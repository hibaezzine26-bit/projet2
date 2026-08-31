package com.ocp.pdr.repository;

import com.ocp.pdr.model.BOM;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BOMRepository extends JpaRepository<BOM, Long> {
}

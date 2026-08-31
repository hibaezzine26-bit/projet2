package com.ocp.pdr.repository;

import com.ocp.pdr.model.ResultatApprovisionnement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ResultatApprovisionnementRepository extends JpaRepository<ResultatApprovisionnement, Long> {
}

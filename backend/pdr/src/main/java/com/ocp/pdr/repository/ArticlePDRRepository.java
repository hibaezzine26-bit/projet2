package com.ocp.pdr.repository;

import com.ocp.pdr.model.ArticlePDR;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ArticlePDRRepository extends JpaRepository<ArticlePDR, Long> {
    Optional<ArticlePDR> findByCodeSAP(String codeSAP);
    boolean existsByCodeSAP(String codeSAP);
}


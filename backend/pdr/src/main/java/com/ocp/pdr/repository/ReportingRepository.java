package com.ocp.pdr.repository;

import com.ocp.pdr.model.Reporting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportingRepository extends JpaRepository<Reporting, Long> {
}

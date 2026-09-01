package com.ocp.pdr.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisSummaryResponse {

    private long totalArticles;
    private long minMaxCount;
    private long planifieCount;
    private long surDemandeCount;
    private long anomaliesCount;
    private long articlesEnStock;
    private double minMaxRate;
    private double planifieRate;
    private double surDemandeRate;
    private double stockRate;
}

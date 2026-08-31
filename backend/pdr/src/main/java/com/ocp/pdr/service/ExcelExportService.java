package com.ocp.pdr.service;

import com.ocp.pdr.model.AnomalieConsommation;
import com.ocp.pdr.model.ResultatApprovisionnement;
import com.ocp.pdr.model.enums.ModeApprovisionnement;
import com.ocp.pdr.repository.AnomalieConsommationRepository;
import com.ocp.pdr.repository.ResultatApprovisionnementRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExcelExportService {

    private final ResultatApprovisionnementRepository resultatRepository;
    private final AnomalieConsommationRepository anomalieRepository;

    public ByteArrayInputStream exportResultats() {
        List<ResultatApprovisionnement> allResultats = resultatRepository.findAll();
        List<AnomalieConsommation> allAnomalies = anomalieRepository.findAll();

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            // Style d'en-tête
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // 1. Feuille Consolidée (Tous)
            createResultSheet(workbook, "Reporting Consolidé", allResultats, headerStyle);

            // 2. Feuille Min & Max
            List<ResultatApprovisionnement> minMax = allResultats.stream()
                    .filter(r -> r.getMode() == ModeApprovisionnement.MIN_MAX)
                    .collect(Collectors.toList());
            createResultSheet(workbook, "1. Min & Max", minMax, headerStyle);

            // 3. Feuille Planifié
            List<ResultatApprovisionnement> planifies = allResultats.stream()
                    .filter(r -> r.getMode() == ModeApprovisionnement.PLANIFIE)
                    .collect(Collectors.toList());
            createResultSheet(workbook, "2. Mode Planifié", planifies, headerStyle);

            // 4. Feuille Sur Demande
            List<ResultatApprovisionnement> surDemande = allResultats.stream()
                    .filter(r -> r.getMode() == ModeApprovisionnement.SUR_DEMANDE)
                    .collect(Collectors.toList());
            createResultSheet(workbook, "3. Sur Demande", surDemande, headerStyle);

            // 5. Feuille Consommations Inhabituelles
            createAnomalySheet(workbook, "4. Anomalies Conso", allAnomalies, headerStyle);

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());

        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de l'export Excel: " + e.getMessage());
        }
    }

    private void createResultSheet(Workbook workbook, String sheetName, List<ResultatApprovisionnement> list, CellStyle headerStyle) {
        Sheet sheet = workbook.createSheet(sheetName);
        Row headerRow = sheet.createRow(0);
        String[] columns = {"Code SAP", "Code Oracle", "Désignation", "Mode", "Priorité", "Qté à Lancer", "Seuil Min", "Seuil Max", "Justification", "Date Analyse"};

        for (int col = 0; col < columns.length; col++) {
            Cell cell = headerRow.createCell(col);
            cell.setCellValue(columns[col]);
            cell.setCellStyle(headerStyle);
        }

        int rowIdx = 1;
        for (ResultatApprovisionnement res : list) {
            Row row = sheet.createRow(rowIdx++);
            var art = res.getArticle();

            row.createCell(0).setCellValue(art != null ? art.getCodeSAP() : "");
            row.createCell(1).setCellValue(art != null && art.getCodeOracle() != null ? art.getCodeOracle() : "");
            row.createCell(2).setCellValue(art != null && art.getDescription() != null ? art.getDescription() : "");
            row.createCell(3).setCellValue(res.getMode() != null ? res.getMode().name() : "");
            row.createCell(4).setCellValue(res.getPriorite() != null ? res.getPriorite() : 0);
            row.createCell(5).setCellValue(res.getQuantiteALancer() != null ? res.getQuantiteALancer() : 0.0);
            row.createCell(6).setCellValue(art != null && art.getSeuilMin() != null ? art.getSeuilMin() : 0.0);
            row.createCell(7).setCellValue(art != null && art.getSeuilMax() != null ? art.getSeuilMax() : 0.0);
            row.createCell(8).setCellValue(res.getJustification() != null ? res.getJustification() : "");
            row.createCell(9).setCellValue(res.getDateAnalyse() != null ? res.getDateAnalyse().toString() : "");
        }

        for (int col = 0; col < columns.length; col++) {
            sheet.autoSizeColumn(col);
        }
    }

    private void createAnomalySheet(Workbook workbook, String sheetName, List<AnomalieConsommation> list, CellStyle headerStyle) {
        Sheet sheet = workbook.createSheet(sheetName);
        Row headerRow = sheet.createRow(0);
        String[] columns = {"Code SAP", "Désignation", "Qté Installée", "Conso Mensuelle", "Taux Conso (%)", "Seuil Dépassé", "Statut", "Date Détection"};

        for (int col = 0; col < columns.length; col++) {
            Cell cell = headerRow.createCell(col);
            cell.setCellValue(columns[col]);
            cell.setCellStyle(headerStyle);
        }

        int rowIdx = 1;
        for (AnomalieConsommation anom : list) {
            Row row = sheet.createRow(rowIdx++);
            var art = anom.getArticle();

            row.createCell(0).setCellValue(art != null ? art.getCodeSAP() : "");
            row.createCell(1).setCellValue(art != null && art.getDescription() != null ? art.getDescription() : "");
            row.createCell(2).setCellValue(anom.getQuantiteInstallee() != null ? anom.getQuantiteInstallee() : 0.0);
            row.createCell(3).setCellValue(anom.getConsommationMensuelle() != null ? anom.getConsommationMensuelle() : 0.0);
            row.createCell(4).setCellValue(anom.getTauxConsommation() != null ? (anom.getTauxConsommation() * 100) + "%" : "0%");
            row.createCell(5).setCellValue("> 200%");
            row.createCell(6).setCellValue(anom.getStatut() != null ? anom.getStatut() : "DETECTEE");
            row.createCell(7).setCellValue(anom.getDateDetection() != null ? anom.getDateDetection().toString() : "");
        }

        for (int col = 0; col < columns.length; col++) {
            sheet.autoSizeColumn(col);
        }
    }
}


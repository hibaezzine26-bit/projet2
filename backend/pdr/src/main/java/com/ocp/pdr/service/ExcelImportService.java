package com.ocp.pdr.service;

import com.ocp.pdr.model.*;
import com.ocp.pdr.model.enums.GroupeHomogene;
import com.ocp.pdr.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExcelImportService {

    private final ArticlePDRRepository articlePDRRepository;
    private final StockRepository stockRepository;
    private final BacklogOTRepository backlogOTRepository;
    private final FicheBOMRepository bomRepository;
    private final ConsommationRepository consommationRepository;
    private final SecteurRepository secteurRepository;

    @Transactional
    public String importExcelData(MultipartFile file) throws Exception {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Le fichier fourni est vide ou invalide.");
        }

        int stockCount = 0;
        int backlogCount = 0;
        int bomCount = 0;
        int consoCount = 0;
        int articleCount = 0;

        try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
            for (int s = 0; s < workbook.getNumberOfSheets(); s++) {
                Sheet sheet = workbook.getSheetAt(s);
                if (sheet.getPhysicalNumberOfRows() < 1) continue;

                Map<String, Integer> colMap = getHeaderMap(sheet);
                if (colMap.isEmpty()) continue;

                // 1. Détection BOM / Articles complets (si Q INSTALLEE ou GROUPE HOMOGENE ou SEUIL MIN présents)
                if (containsAnyKey(colMap, "q installee", "quantite installee", "groupe homogene", "seuil min", "seuil max")) {
                    int count = importBOMMasterSheet(sheet, colMap);
                    articleCount += count;
                    bomCount += count;
                }
                // 2. Détection Stock (si Q STOCK présent ou nom de feuille = stock)
                else if (containsAnyKey(colMap, "q stock", "quantite stock", "stock") || sheet.getSheetName().toLowerCase().contains("stock")) {
                    stockCount += importStockSheet(sheet, colMap);
                }
                // 3. Détection Backlog (si Q NON LANCEE ou OT présent sans DATE de conso)
                else if (containsAnyKey(colMap, "q non lancee", "quantite non lancee", "non lancee") || sheet.getSheetName().toLowerCase().contains("backlog")) {
                    backlogCount += importBacklogSheet(sheet, colMap);
                }
                // 4. Détection Consommation (si Q CONSOMMEE ou N OT avec DATE de conso)
                else if (containsAnyKey(colMap, "q consommee", "quantite consommee", "consommee", "consommation") || sheet.getSheetName().toLowerCase().contains("conso")) {
                    consoCount += importConsommationSheet(sheet, colMap);
                }
                // 5. Fallback d'auto-détection basé sur les colonnes
                else {
                    if (containsAnyKey(colMap, "code sap", "code_sap")) {
                        if (containsAnyKey(colMap, "stock")) {
                            stockCount += importStockSheet(sheet, colMap);
                        } else if (containsAnyKey(colMap, "lancee")) {
                            backlogCount += importBacklogSheet(sheet, colMap);
                        } else {
                            stockCount += importStockSheet(sheet, colMap);
                        }
                    }
                }
            }
        }

        List<String> details = new ArrayList<>();
        if (articleCount > 0) details.add(articleCount + " fiches articles/BOM");
        if (stockCount > 0) details.add(stockCount + " lignes de stock");
        if (backlogCount > 0) details.add(backlogCount + " ordres backlog OT");
        if (consoCount > 0) details.add(consoCount + " lignes de consommation");

        if (details.isEmpty()) {
            return "Fichier traité, mais aucune structure de données reconnue (Vérifiez les en-têtes: CODE SAP, Q STOCK, Q NON LANCEE, Q CONSOMMEE, etc.).";
        }

        return "Importation réussie : " + String.join(", ", details) + ".";
    }

    private Map<String, Integer> getHeaderMap(Sheet sheet) {
        Map<String, Integer> headerMap = new HashMap<>();
        Row headerRow = sheet.getRow(0);
        if (headerRow == null) return headerMap;

        for (int i = 0; i < headerRow.getLastCellNum(); i++) {
            Cell cell = headerRow.getCell(i);
            if (cell != null) {
                String val = extractStringValue(cell).trim().toLowerCase()
                        .replace("_", " ")
                        .replace(".", " ")
                        .replaceAll("\\s+", " ");
                if (!val.isEmpty()) {
                    headerMap.put(val, i);
                }
            }
        }
        return headerMap;
    }

    private boolean containsAnyKey(Map<String, Integer> map, String... keys) {
        for (String k : keys) {
            for (String mapKey : map.keySet()) {
                if (mapKey.contains(k)) return true;
            }
        }
        return false;
    }

    private Integer getColumnIndex(Map<String, Integer> map, String... possibleNames) {
        for (String name : possibleNames) {
            String norm = name.toLowerCase().trim();
            for (Map.Entry<String, Integer> entry : map.entrySet()) {
                if (entry.getKey().equals(norm) || entry.getKey().contains(norm)) {
                    return entry.getValue();
                }
            }
        }
        return null;
    }

    private ArticlePDR getOrCreateArticle(String codeSAP, String codeOracle, String description, String udm) {
        if (codeSAP == null || codeSAP.trim().isEmpty()) {
            return null;
        }
        String cleanCode = codeSAP.trim();
        return articlePDRRepository.findByCodeSAP(cleanCode)
                .map(art -> {
                    boolean modified = false;
                    if (codeOracle != null && !codeOracle.isEmpty() && art.getCodeOracle() == null) {
                        art.setCodeOracle(codeOracle);
                        modified = true;
                    }
                    if (description != null && !description.isEmpty() && (art.getDescription() == null || art.getDescription().startsWith("Article "))) {
                        art.setDescription(description);
                        modified = true;
                    }
                    if (udm != null && !udm.isEmpty() && art.getUdm() == null) {
                        art.setUdm(udm);
                        modified = true;
                    }
                    return modified ? articlePDRRepository.save(art) : art;
                })
                .orElseGet(() -> {
                    ArticlePDR newArticle = new ArticlePDR();
                    newArticle.setCodeSAP(cleanCode);
                    newArticle.setCodeOracle(codeOracle);
                    newArticle.setDescription(description != null && !description.isEmpty() ? description : "Article " + cleanCode);
                    newArticle.setUdm(udm);
                    return articlePDRRepository.save(newArticle);
                });
    }

    private Secteur getOrCreateSecteur(String secteurLabel) {
        if (secteurLabel == null || secteurLabel.trim().isEmpty()) {
            return secteurRepository.findByNom("General")
                    .orElseGet(() -> secteurRepository.save(new Secteur(null, "General", "GEN", "Secteur par défaut", null)));
        }

        String normalized = secteurLabel.trim();
        return secteurRepository.findByNom(normalized)
                .orElseGet(() -> secteurRepository.save(new Secteur(null, normalized, normalized.substring(0, Math.min(3, normalized.length())).toUpperCase(), "Secteur importé", null)));
    }

    private GroupeHomogene parseGroupeHomogene(String value) {
        if (value == null || value.trim().isEmpty()) return null;
        String val = value.trim().toUpperCase();
        if (val.contains("CRITIQUE")) return GroupeHomogene.CRITIQUE;
        if (val.contains("CONDITION")) return GroupeHomogene.CONDITIONNEL;
        if (val.contains("CURATIF")) return GroupeHomogene.CURATIF;
        return null;
    }

    // 1. Importation BOM & Fiches Articles complètes
    private int importBOMMasterSheet(Sheet sheet, Map<String, Integer> colMap) {
        int count = 0;
        Integer colCodeSAP = getColumnIndex(colMap, "code sap", "codesap", "sap");
        Integer colCodeOracle = getColumnIndex(colMap, "code oracle", "oracle");
        Integer colDesc = getColumnIndex(colMap, "description", "designation");
        Integer colRef = getColumnIndex(colMap, "reference", "ref");
        Integer colUdm = getColumnIndex(colMap, "udm", "unite");
        Integer colQInstallee = getColumnIndex(colMap, "q installee", "quantite installee", "installee");
        Integer colCategorie = getColumnIndex(colMap, "categorie", "cat");
        Integer colGroupe = getColumnIndex(colMap, "groupe homogene", "groupe", "homogene");
        Integer colSeuilMin = getColumnIndex(colMap, "seuil min", "min");
        Integer colSeuilMax = getColumnIndex(colMap, "seuil max", "max");
        Integer colSecteur = getColumnIndex(colMap, "secteur", "zone", "site");

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            String codeSAP = colCodeSAP != null ? extractStringValue(row.getCell(colCodeSAP)) : "";
            if (codeSAP.isEmpty()) continue;

            String codeOracle = colCodeOracle != null ? extractStringValue(row.getCell(colCodeOracle)) : "";
            String description = colDesc != null ? extractStringValue(row.getCell(colDesc)) : "";
            String reference = colRef != null ? extractStringValue(row.getCell(colRef)) : "";
            String udm = colUdm != null ? extractStringValue(row.getCell(colUdm)) : "";
            Double qInstallee = colQInstallee != null ? extractNumericValue(row.getCell(colQInstallee)) : null;
            String categorie = colCategorie != null ? extractStringValue(row.getCell(colCategorie)) : "";
            String groupeStr = colGroupe != null ? extractStringValue(row.getCell(colGroupe)) : "";
            Double seuilMin = colSeuilMin != null ? extractNumericValue(row.getCell(colSeuilMin)) : null;
            Double seuilMax = colSeuilMax != null ? extractNumericValue(row.getCell(colSeuilMax)) : null;
            String secteurLabel = colSecteur != null ? extractStringValue(row.getCell(colSecteur)) : "General";

            ArticlePDR article = articlePDRRepository.findByCodeSAP(codeSAP).orElse(new ArticlePDR());
            article.setCodeSAP(codeSAP);
            if (!codeOracle.isEmpty()) article.setCodeOracle(codeOracle);
            if (!description.isEmpty()) article.setDescription(description);
            if (!reference.isEmpty()) article.setReference(reference);
            if (!udm.isEmpty()) article.setUdm(udm);
            if (qInstallee != null) article.setQuantiteInstallee(qInstallee);
            if (!categorie.isEmpty()) article.setCategorie(categorie);
            if (!groupeStr.isEmpty()) {
                GroupeHomogene parsed = parseGroupeHomogene(groupeStr);
                article.setGroupeHomogene(parsed);
            }
            if (seuilMin != null && seuilMin > 0) article.setSeuilMin(seuilMin);
            if (seuilMax != null && seuilMax > 0) article.setSeuilMax(seuilMax);

            ArticlePDR savedArticle = articlePDRRepository.save(article);

            Secteur secteur = getOrCreateSecteur(secteurLabel);
            FicheBOM bom = new FicheBOM();
            bom.setArticle(savedArticle);
            bom.setSecteur(secteur);
            bom.setReference(reference);
            bom.setQuantiteParEquipement(qInstallee);
            bom.setDateImport(LocalDate.now());
            bomRepository.save(bom);

            count++;
        }
        return count;
    }

    // 2. Importation Stock
    private int importStockSheet(Sheet sheet, Map<String, Integer> colMap) {
        int count = 0;
        Integer colCodeSAP = getColumnIndex(colMap, "code sap", "sap");
        Integer colCodeOracle = getColumnIndex(colMap, "code oracle", "oracle");
        Integer colDesc = getColumnIndex(colMap, "description", "designation");
        Integer colUdm = getColumnIndex(colMap, "udm");
        Integer colQStock = getColumnIndex(colMap, "q stock", "quantite stock", "stock", "quantite");

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            String codeSAP = colCodeSAP != null ? extractStringValue(row.getCell(colCodeSAP)) : extractStringValue(row.getCell(0));
            if (codeSAP.isEmpty()) continue;

            String codeOracle = colCodeOracle != null ? extractStringValue(row.getCell(colCodeOracle)) : "";
            String description = colDesc != null ? extractStringValue(row.getCell(colDesc)) : "";
            String udm = colUdm != null ? extractStringValue(row.getCell(colUdm)) : "";
            double quantite = colQStock != null ? extractNumericValue(row.getCell(colQStock)) : extractNumericValue(row.getCell(row.getLastCellNum() - 1));

            ArticlePDR article = getOrCreateArticle(codeSAP, codeOracle, description, udm);
            if (article != null) {
                Stock stock = new Stock();
                stock.setArticle(article);
                stock.setQuantiteStock(quantite);
                stock.setDateStock(LocalDate.now());
                stockRepository.save(stock);
                count++;
            }
        }
        return count;
    }

    // 3. Importation Backlog
    private int importBacklogSheet(Sheet sheet, Map<String, Integer> colMap) {
        int count = 0;
        Integer colCodeSAP = getColumnIndex(colMap, "code sap", "sap");
        Integer colDesc = getColumnIndex(colMap, "description", "designation");
        Integer colUdm = getColumnIndex(colMap, "udm");
        Integer colQNonLancee = getColumnIndex(colMap, "q non lancee", "non lancee", "quantite");
        Integer colOT = getColumnIndex(colMap, "ot", "numero ot", "ordre");

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            String codeSAP = colCodeSAP != null ? extractStringValue(row.getCell(colCodeSAP)) : extractStringValue(row.getCell(0));
            if (codeSAP.isEmpty()) continue;

            String description = colDesc != null ? extractStringValue(row.getCell(colDesc)) : "";
            String udm = colUdm != null ? extractStringValue(row.getCell(colUdm)) : "";
            double quantite = colQNonLancee != null ? extractNumericValue(row.getCell(colQNonLancee)) : 0.0;
            String numeroOT = colOT != null ? extractStringValue(row.getCell(colOT)) : "OT-" + System.currentTimeMillis();

            ArticlePDR article = getOrCreateArticle(codeSAP, null, description, udm);
            if (article != null) {
                BacklogOT backlog = new BacklogOT();
                backlog.setArticle(article);
                backlog.setNumeroOT(numeroOT);
                backlog.setQuantiteNonLancee(quantite);
                backlog.setDateImport(LocalDate.now());
                backlogOTRepository.save(backlog);
                count++;
            }
        }
        return count;
    }

    // 4. Importation Consommation
    private int importConsommationSheet(Sheet sheet, Map<String, Integer> colMap) {
        int count = 0;
        Integer colCodeSAP = getColumnIndex(colMap, "code sap", "sap");
        Integer colDesc = getColumnIndex(colMap, "description", "designation");
        Integer colQConso = getColumnIndex(colMap, "q consommee", "consommee", "quantite");
        Integer colUdm = getColumnIndex(colMap, "udm");
        Integer colOT = getColumnIndex(colMap, "n ot", "ot", "numero ot");
        Integer colDate = getColumnIndex(colMap, "date", "date consommation");

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            String codeSAP = colCodeSAP != null ? extractStringValue(row.getCell(colCodeSAP)) : extractStringValue(row.getCell(0));
            if (codeSAP.isEmpty()) continue;

            String description = colDesc != null ? extractStringValue(row.getCell(colDesc)) : "";
            String udm = colUdm != null ? extractStringValue(row.getCell(colUdm)) : "";
            double quantiteBrute = colQConso != null ? extractNumericValue(row.getCell(colQConso)) : 0.0;
            double quantite = Math.abs(quantiteBrute); // Convertit les sorties négatives (ex: -1.000) en quantités consommées positives

            String numeroOT = colOT != null ? extractStringValue(row.getCell(colOT)) : "OT-" + System.currentTimeMillis();
            LocalDate dateConso = colDate != null ? extractDateValue(row.getCell(colDate)) : LocalDate.now();

            ArticlePDR article = getOrCreateArticle(codeSAP, null, description, udm);
            if (article != null) {
                Consommation conso = new Consommation();
                conso.setArticle(article);
                conso.setQuantiteConsommee(quantite);
                conso.setNumeroOT(numeroOT);
                conso.setDateConsommation(dateConso);
                consommationRepository.save(conso);
                count++;
            }
        }
        return count;
    }

    private String extractStringValue(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getLocalDateTimeCellValue().toLocalDate().toString();
                }
                double num = cell.getNumericCellValue();
                if (num == Math.floor(num)) {
                    return String.valueOf((long) num);
                }
                return String.valueOf(num);
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                try {
                    return cell.getStringCellValue().trim();
                } catch (Exception e) {
                    try {
                        return String.valueOf((long) cell.getNumericCellValue());
                    } catch (Exception ex) {
                        return "";
                    }
                }
            default:
                return "";
        }
    }

    private double extractNumericValue(Cell cell) {
        if (cell == null) return 0.0;
        switch (cell.getCellType()) {
            case NUMERIC:
                return cell.getNumericCellValue();
            case STRING:
                try {
                    String str = cell.getStringCellValue().trim()
                            .replace(" ", "")
                            .replace(",", ".");
                    return Double.parseDouble(str);
                } catch (NumberFormatException e) {
                    return 0.0;
                }
            case FORMULA:
                try {
                    return cell.getNumericCellValue();
                } catch (Exception e) {
                    return 0.0;
                }
            default:
                return 0.0;
        }
    }

    private LocalDate extractDateValue(Cell cell) {
        if (cell == null) return LocalDate.now();
        if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
            return cell.getLocalDateTimeCellValue().toLocalDate();
        }
        if (cell.getCellType() == CellType.STRING) {
            String val = cell.getStringCellValue().trim();
            try {
                if (val.contains(".")) {
                    return LocalDate.parse(val, DateTimeFormatter.ofPattern("dd.MM.yyyy"));
                } else if (val.contains("/")) {
                    return LocalDate.parse(val, DateTimeFormatter.ofPattern("dd/MM/yyyy"));
                } else if (val.contains("-")) {
                    return LocalDate.parse(val, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
                }
            } catch (Exception ignored) {
            }
        }
        return LocalDate.now();
    }
}



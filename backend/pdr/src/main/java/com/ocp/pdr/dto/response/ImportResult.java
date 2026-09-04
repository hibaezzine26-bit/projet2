package com.ocp.pdr.dto.response;

import java.util.ArrayList;
import java.util.List;

public record ImportResult(
        boolean success,
        String message,
        int lignesImportees,
        int erreurs,
        List<String> detailsErreurs) {

    public ImportResult {
        detailsErreurs = detailsErreurs == null ? List.of() : List.copyOf(detailsErreurs);
    }

    public static ImportResult from(ImportResultBuilder builder) {
        boolean success = builder.errors.isEmpty() && builder.importedLines > 0;
        String message = success
                ? "Importation réussie : " + String.join(", ", builder.details)
                : builder.importedLines > 0
                    ? "Importation partielle : " + String.join(", ", builder.details)
                    : "Importation échouée : aucune ligne valide importée.";
        return new ImportResult(success, message, builder.importedLines, builder.errors.size(), builder.errors);
    }

    public static final class ImportResultBuilder {
        private final List<String> details = new ArrayList<>();
        private final List<String> errors = new ArrayList<>();
        private int importedLines;

        public void addDetail(int count, String label) {
            if (count > 0) {
                details.add(count + " " + label);
                importedLines += count;
            }
        }

        public void addError(String error) {
            errors.add(error);
        }

        public List<String> getErrors() {
            return errors;
        }
    }
}

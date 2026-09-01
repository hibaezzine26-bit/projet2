# Architecture du projet PDR

## 1. Objectif du projet

Le projet PDR est une application de gestion et d’analyse d’approvisionnement. Son rôle est de traiter des fichiers d’import, calculer les niveaux de stock, identifier les anomalies et proposer des recommandations d’approvisionnement selon des règles métiers.

## 2. Architecture générale

L’application suit une architecture classique en couches :

- Couche web : contrôleurs REST qui exposent les endpoints de l’API.
- Couche service : moteur de décision, règles d’approvisionnement, imports Excel et exports.
- Couche persistance : repositories Spring Data JPA pour l’accès aux données.
- Couche modèle : entités JPA représentant les objets métiers.
- Couche DTO : objets de transfert de données utilisés pour sécuriser les réponses API.

## 3. Structure fonctionnelle

### Backend

Le backend Spring Boot est situé dans le dossier `backend/pdr`.

- `controller` : endpoints API (analyse, articles, authentification, import/export).
- `service` : logique métier et traitements avancés.
- `repository` : accès aux données relationnelles.
- `model` : entités liées aux articles, secteurs, stocks, consommations et résultats.
- `dto` : réponses standardisées pour les API.
- `exception` : gestion centralisée des erreurs.
- `config` : configuration Spring et OpenAPI.

### Frontend

Le frontend React/Vite est dans le dossier `frontend`.

- `pages` : écrans Dashboard, Reporting, Login, Import.
- `components` : interface réutilisable.
- `context` : gestion d’authentification.
- `services/api.js` : point d’entrée vers le backend.

## 4. Composants métier clés

### Analyse d’approvisionnement

La logique centrale est assurée par le service `MoteurApprovisionnementService`.
Il exécute les règles d’approvisionnement et produit des résultats structurés pour la synthèse de la dashboard et du reporting.

### Règles métier

Les services de règles sont séparés :

- `RegleMinMaxService` : gestion des seuils min / max.
- `ReglePlanifieService` : approvisionnement planifié.
- `RegleSurDemandeService` : approvisionnement sur demande.

Cette séparation permet de garder le code lisible et de faire évoluer facilement une règle sans réécrire l’ensemble du moteur.

### Import Excel

Le service `ExcelImportService` charge les données à partir de fichiers Excel, détecte les types de feuille et alimente les tables du système.

### Export Excel

Le service `ExcelExportService` permet l’export des données exploitées dans l’application pour les rapports et exports métier.

## 5. Pourquoi cette architecture convient à un projet de stage

- elle est simple à comprendre ;
- elle suit le modèle Spring classique ;
- elle garde la logique métier séparée de la couche API ;
- elle est facilement extensible pour ajouter de nouvelles règles ou nouveaux écrans.

C’est une architecture propre, robuste et adaptée à un projet de fin d’étude, car elle montre une bonne compréhension des bonnes pratiques de développement.

## 6. Points de vigilance

- garder les services métiers concentrés sur la logique ;
- éviter de mélanger les responsabilités dans les contrôleurs ;
- maintenir les DTO pour sécuriser les échanges entre frontend et backend ;
- préserver la compatibilité fonctionnelle lors des évolutions.

## 7. Conclusion

Le projet repose sur une architecture en couches claire, avec un backend Java Spring Boot robuste et un frontend React léger. Cette structure permet de démontrer une maîtrise des bonnes pratiques de conception, de la séparation des responsabilités et de la maintenance applicative.

# PDR - Planification et gestion des approvisionnements

## Présentation

PDR est une application de gestion et d’analyse d’approvisionnement destinée à aider les équipes logistiques et achats à suivre les niveaux de stock, identifier les besoins urgents et proposer des actions d’approvisionnement adaptées.

Le projet a été conçu comme une solution interne de pilotage des stocks et des approvisionnements, avec un tableau de bord analytique, des règles de décision automatisées et des fonctionnalités d’import/export Excel.

## Objectif du projet

L’objectif principal est de centraliser les données d’approvisionnement, d’analyser les écarts entre stock réel et seuils critiques, puis de générer une synthèse exploitable par les décideurs.

Le système permet notamment de :
- suivre les niveaux de stock par article ;
- identifier les articles en dessous du seuil minimum ;
- distinguer les modes d’approvisionnement : min/max, planifié, sur demande, en stock ;
- exploiter un tableau de bord visuel pour suivre les situations critiques ;
- importer des données Excel et exporter les résultats pour les utilisateurs métier.

## Fonctionnalités principales

### 1. Authentification et sécurité
- connexion administrateur avec JWT ;
- protection des routes backend ;
- accès restreint aux pages sensibles du frontend.

### 2. Gestion des articles et paramètres
- maintenance des articles PDR ;
- gestion des seuils min/max ;
- gestion des groupes homogènes ;
- association des articles aux secteurs et aux données techniques.

### 3. Analyse d’approvisionnement
- calcul automatique du besoin selon plusieurs règles métier ;
- détection des situations critiques ;
- synthèse de résultats et statistiques globales.

### 4. Import et export Excel
- import de fichiers de données Excel ;
- lecture automatique des en-têtes et détection des sections ;
- export des rapports et des résultats dans des fichiers Excel.

### 5. Dashboard de pilotage
- visualisation globale par mode d’approvisionnement ;
- indicateurs synthétiques ;
- tableau de suivi des articles et des décisions d’approvisionnement.

## Stack technique

### Backend
- Java 21
- Spring Boot 3 / 4 compatible
- Spring Data JPA
- Spring Security
- JWT
- Apache POI
- MySQL (runtime)
- H2 (tests)

### Frontend
- React
- Vite
- Axios
- React Router
- CSS modules / styles personnalisés

## Architecture du projet

Le projet suit une architecture en couches :

- Controllers : exposent les API REST
- Services : contiennent la logique métier et les traitements complexes
- Repositories : gèrent l’accès aux données
- Models : représentent les entités JPA
- DTOs : sécurisent les échanges entre backend et frontend
- Exceptions : centralisent les erreurs applicatives

Cette structure permet d’isoler les responsabilités et de maintenir le projet facilement évolutif.

## Structure du dépôt

```text
projet2/
├── backend/
│   └── pdr/
│       ├── src/
│       ├── pom.xml
│       └── mvnw
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── docs/
│   ├── architecture-stage.md
│   └── rapport-stage.md
├── docker-compose.yml
├── README.md
└── .gitignore
```

## Prérequis

- Java 21+
- Maven ou Maven Wrapper
- Node.js 18+
- MySQL (si vous souhaitez lancer le projet en local)

## Lancement du backend

```bash
cd backend/pdr
./mvnw spring-boot:run
```

Le backend est configuré pour démarrer sur le port 8089.

## Lancement du frontend

```bash
cd frontend
npm install
npm run dev
```

## Variables d’environnement et configuration

Le backend utilise une configuration Spring Boot standard avec :
- MySQL en environnement d’exécution ;
- H2 pour les tests ;
- paramètres de sécurité JWT ;
- port serveur personnalisé.

## Points forts du projet

- logique métier structurée et maintenable ;
- séparation claire entre API, services et persistance ;
- analyse d’approvisionnement automatisée ;
- interface de pilotage fonctionnelle et orientée décision ;
- import/export Excel pour intégration avec les outils métier.

## Limites et pistes d’amélioration

- optimiser la gestion des données Excel pour certains cas particuliers de fichiers ;
- ajouter davantage de tests d’intégration sur les flux métier complets ;
- renforcer la validation côté backend pour certains imports ;
- améliorer les statistiques et les filtres avancés sur le dashboard.

## Conclusion

PDR est un projet de gestion d’approvisionnement pensé pour répondre à des besoins réels de pilotage de stock et de décision logistique. Il combine une base technique robuste, une logique métier organisée et une interface de suivi fonctionnelle.

Ce projet constitue une base solide pour un projet de fin d’études, avec une architecture qui reste propre, lisible et évolutive.

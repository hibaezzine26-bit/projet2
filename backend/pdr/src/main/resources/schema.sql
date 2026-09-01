CREATE TABLE IF NOT EXISTS administrateur (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nom VARCHAR(255),
    prenom VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255),
    actif BOOLEAN,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS secteur (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nom VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(255),
    description TEXT,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS article_pdr (
    id BIGINT NOT NULL AUTO_INCREMENT,
    code_sap VARCHAR(255) NOT NULL UNIQUE,
    code_oracle VARCHAR(255),
    description TEXT,
    reference TEXT,
    udm VARCHAR(50),
    quantite_installee DOUBLE,
    categorie TEXT,
    groupe_homogene VARCHAR(50),
    seuil_min DOUBLE,
    seuil_max DOUBLE,
    date_creation DATETIME,
    date_modification DATETIME,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS bom (
    id BIGINT NOT NULL AUTO_INCREMENT,
    reference LONGTEXT,
    quantite_par_equipement DOUBLE,
    date_import DATE,
    article_id BIGINT NOT NULL,
    secteur_id BIGINT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_bom_article FOREIGN KEY (article_id) REFERENCES article_pdr(id),
    CONSTRAINT fk_bom_secteur FOREIGN KEY (secteur_id) REFERENCES secteur(id)
);

CREATE TABLE IF NOT EXISTS stock (
    id BIGINT NOT NULL AUTO_INCREMENT,
    quantite_stock DOUBLE,
    date_stock DATE,
    source_fichier VARCHAR(255),
    date_import DATETIME,
    article_id BIGINT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_stock_article FOREIGN KEY (article_id) REFERENCES article_pdr(id)
);

CREATE TABLE IF NOT EXISTS backlog_ot (
    id BIGINT NOT NULL AUTO_INCREMENT,
    numero_ot VARCHAR(255),
    quantite_non_lancee DOUBLE,
    date_import DATE,
    source_fichier VARCHAR(255),
    date_import_systeme DATETIME,
    article_id BIGINT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_backlog_article FOREIGN KEY (article_id) REFERENCES article_pdr(id)
);

CREATE TABLE IF NOT EXISTS consommation (
    id BIGINT NOT NULL AUTO_INCREMENT,
    quantite_consommee DOUBLE,
    source_fichier VARCHAR(255),
    date_import DATETIME,
    date_consommation DATE,
    numero_ot VARCHAR(255),
    article_id BIGINT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_conso_article FOREIGN KEY (article_id) REFERENCES article_pdr(id)
);

CREATE TABLE IF NOT EXISTS besoin_en_cours (
    id BIGINT NOT NULL AUTO_INCREMENT,
    quantite_besoin DOUBLE,
    source_fichier VARCHAR(255),
    date_import DATETIME,
    date_besoin DATE,
    statut VARCHAR(255),
    article_id BIGINT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_besoin_article FOREIGN KEY (article_id) REFERENCES article_pdr(id)
);

CREATE TABLE IF NOT EXISTS import_donnees (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nom_fichier VARCHAR(255),
    type_fichier VARCHAR(50),
    statut VARCHAR(50),
    message_resultat TEXT,
    date_import DATETIME,
    nombre_lignes INTEGER,
    administrateur_id BIGINT,
    PRIMARY KEY (id),
    CONSTRAINT fk_import_admin FOREIGN KEY (administrateur_id) REFERENCES administrateur(id)
);

CREATE TABLE IF NOT EXISTS historique_traitement (
    id BIGINT NOT NULL AUTO_INCREMENT,
    operation VARCHAR(255),
    date_operation DATETIME,
    statut VARCHAR(255),
    message TEXT,
    import_id BIGINT,
    PRIMARY KEY (id),
    CONSTRAINT fk_historique_import FOREIGN KEY (import_id) REFERENCES import_donnees(id)
);

CREATE TABLE IF NOT EXISTS resultat_approvisionnement (
    id BIGINT NOT NULL AUTO_INCREMENT,
    mode VARCHAR(50),
    quantite_a_lancer DOUBLE,
    priorite INTEGER,
    justification TEXT,
    date_analyse DATE,
    article_id BIGINT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_resultat_article FOREIGN KEY (article_id) REFERENCES article_pdr(id)
);

CREATE TABLE IF NOT EXISTS anomalie_consommation (
    id BIGINT NOT NULL AUTO_INCREMENT,
    consommation_mensuelle DOUBLE,
    quantite_installee DOUBLE,
    taux_consommation DOUBLE,
    seuil DOUBLE,
    date_detection DATE,
    statut VARCHAR(255),
    article_id BIGINT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_anomalie_article FOREIGN KEY (article_id) REFERENCES article_pdr(id)
);

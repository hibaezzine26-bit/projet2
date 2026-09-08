# Déploiement Docker

## Prérequis

- Docker Desktop installé et démarré
- Port `5173` disponible (Frontend & Proxy API)
- Port `8089` disponible (Backend Spring Boot direct, optionnel)
- Port `3307` disponible (Accès direct MySQL externe, optionnel)

## Démarrage

Depuis la racine du projet :

```powershell
docker compose up --build -d
```

L'application ordonnance automatiquement le démarrage :
1. **db (MySQL 8.0)** : Initialise la base de données `pdr_db` et attend d'être saine (`healthy`).
2. **backend (Spring Boot 4 / Java 21)** : Démarre, met à jour le schéma Hibernate et effectue le seed des données. Son healthcheck teste `/api/auth/health`.
3. **frontend (React / Nginx)** : Démarre automatiquement dès que le backend est prêt (`healthy`), évitant toute erreur 502 Bad Gateway.

## Accès aux services

- **Frontend & Application Web** : [http://localhost:5173](http://localhost:5173)
- **API (via proxy Nginx)** : [http://localhost:5173/api](http://localhost:5173/api)
- **Santé du Backend** : [http://localhost:5173/api/auth/health](http://localhost:5173/api/auth/health)
- **Documentation Swagger / OpenAPI** : [http://localhost:5173/swagger-ui/index.html](http://localhost:5173/swagger-ui/index.html)
- **Base de données MySQL** : `localhost:3307` (Utilisateur: `projet2`, Mot de passe: `projet2`, Base: `pdr_db`)

### Compte Administrateur par défaut

- **Email** : `admin@ocp.ma`
- **Mot de passe** : `password123`

## Vérification et Logs

```powershell
# État des conteneurs
docker compose ps

# Logs du backend en direct
docker compose logs -f backend

# Logs du frontend Nginx
docker compose logs -f frontend
```

## Arrêt

```powershell
docker compose down
```

Pour réinitialiser complètement la base de données MySQL :

```powershell
docker compose down -v
```


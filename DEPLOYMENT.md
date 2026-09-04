# Deploiement Docker

## Prerequis

- Docker Desktop installe et demarre
- Ports `5173` disponibles

## Demarrage

Depuis la racine du projet :

```powershell
docker compose up --build -d
```

L'application est ensuite disponible sur :

- Frontend : http://localhost:5173
- API : http://localhost:5173/api
- Swagger : http://localhost:5173/api/swagger-ui/index.html

Le premier demarrage peut prendre quelques minutes. MySQL est initialise automatiquement et le schema est mis a jour par Spring Boot.

## Verification

```powershell
docker compose ps
docker compose logs -f backend
```

## Arret

```powershell
docker compose down
```

Pour supprimer aussi les donnees MySQL :

```powershell
docker compose down -v
```

## Rebuild complet

```powershell
docker compose down
 docker compose build --no-cache
 docker compose up -d
```

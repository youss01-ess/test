# API Guide Michelin

API REST (Spring Boot 3, Java 17) pour gérer des restaurants et leurs évaluations.
Examen Backend – formation Web Services.

## Lancer le projet

Prérequis : Java 17+ et Maven 3.

```bash
cd guide-michelin-api
mvn test            # lance les tests unitaires
mvn spring-boot:run # démarre l'API sur http://localhost:8080
```

### Configuration (variables d'environnement)

| Variable | Rôle | Défaut |
|---|---|---|
| `OIDC_ISSUER_URI` | URL du serveur OpenID Connect (ex. Keycloak : `https://.../realms/xxx`) | `http://localhost:8180/realms/michelin` |
| `S3_URL` | URL du serveur S3 | `https://s3.bober.ovh` |
| `S3_ACCESS_KEY_ID` | clé d'accès S3 (donnée dans l'énoncé) | `non-configure` |
| `S3_SECRET_ACCESS_KEY` | clé secrète S3 (donnée dans l'énoncé) | `non-configure` |

Les clés S3 ne sont volontairement pas écrites dans le code (dépôt public). Sans elles l'API démarre,
mais l'envoi d'images renverra une erreur 500.

### Accès
- Swagger UI : http://localhost:8080/swagger-ui.html
- OpenAPI JSON : http://localhost:8080/v3/api-docs
- Console H2 : http://localhost:8080/h2-console (JDBC URL `jdbc:h2:mem:michelin`, user `sa`)

Pour tester avec Swagger : récupérer un token auprès du serveur OIDC (compte `lucien.bramard@michelin.fr`
= USER ou `noel.flantier@michelin.fr` = ADMIN), puis cliquer sur **Authorize** et coller le token.

## Routes

| Méthode | Route | Rôle | Description |
|---|---|---|---|
| GET | `/restaurants` | USER/ADMIN | tous les restaurants (+ `moyenne`) |
| GET | `/restaurants/{id}` | USER/ADMIN | un restaurant (+ `moyenne`) |
| POST | `/restaurants` | ADMIN | créer un restaurant |
| PUT | `/restaurants/{id}` | ADMIN | modifier nom + adresse |
| POST | `/restaurants/{id}/image` | ADMIN | image du restaurant (multipart, champ `file`) |
| POST | `/restaurants/{id}/evaluations` | USER/ADMIN | ajouter une évaluation |
| POST | `/evaluations/{id}/photos` | auteur ou ADMIN | photos de plats (multipart, champ `files`) |
| DELETE | `/evaluations/{id}` | auteur ou ADMIN | supprimer une évaluation |
| GET | `/evaluations?motsCles=a&motsCles=b` | USER/ADMIN | recherche par mots clefs dans le commentaire |
| GET | `/evaluations/mes-evaluations` | USER/ADMIN | évaluations de l'utilisateur connecté |

`moyenne` vaut `-1` si le restaurant n'a aucune évaluation.
Les erreurs sont renvoyées sous la forme `{ "code": 404, "message": "..." }`.

## Organisation du code

```
controller/   routes REST
service/      logique métier (moyenne, droits sur les évaluations, upload S3)
repository/   accès base de données (Spring Data JPA, H2 en mémoire)
entity/       Restaurant, Evaluation
dto/          objets échangés avec les clients
config/       sécurité JWT, S3, Swagger
exception/    gestion centralisée des erreurs
```

Les rôles sont lus dans le JWT (`realm_access.roles` ou `roles`) et transformés en `ROLE_USER` / `ROLE_ADMIN`
dans `SecurityConfig`.

## Ce qui n'est pas fait / limites connues
- Pas testé avec un vrai serveur OpenID Connect : le mapping des rôles suppose un token de type Keycloak.
- Pas de tests des contrôleurs ni de la sécurité (seulement les services).
- Les images S3 ne sont pas supprimées quand on supprime une évaluation.
- Pas de modification d'une évaluation (uniquement ajout / suppression).
- Les erreurs 401/403 générées par Spring Security n'ont pas le format `{code, message}`.
- Pas de pagination, base H2 en mémoire (données perdues à l'arrêt).
- Les URLs d'images renvoyées dépendent de l'accès public aux buckets, non vérifié.

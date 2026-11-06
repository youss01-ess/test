# Guide Michelin - API

API Spring Boot (Java 17) pour les restaurants et leurs évaluations.

## Lancer
```
mvn test
mvn spring-boot:run
```
Les clés S3 de l'énoncé sont déjà dans `application.yml`.
Il reste à renseigner l'URL du serveur OpenID Connect, dans `application.yml` (`issuer-uri`)
ou avec la variable d'environnement `OIDC_ISSUER_URI`.

Swagger : http://localhost:8080/swagger-ui.html (bouton Authorize pour coller le token)

## Routes
- `GET /restaurants`, `GET /restaurants/{id}` (avec `moyenne`, -1 si pas d'évaluation)
- `POST /restaurants`, `PUT /restaurants/{id}`, `POST /restaurants/{id}/image` : ADMIN
- `POST /restaurants/{id}/evaluations`
- `GET /evaluations?motsCles=...`, `GET /evaluations/mes-evaluations`
- `DELETE /evaluations/{id}` (la sienne, ou toutes si ADMIN)
- `POST /evaluations/{id}/photos`

## Pas fait / à améliorer
- pas pu tester avec le vrai serveur OIDC (j'ai supposé un token type Keycloak)
- tests seulement sur les services
- pas de modification d'une évaluation
- les photos ne sont pas supprimées de S3

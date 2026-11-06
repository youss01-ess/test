# Guide Michelin - API

API Spring Boot (Java 17) pour les restaurants et leurs évaluations.

## Lancer
```
mvn test
mvn spring-boot:run
```
Les clés S3 de l'énoncé et l'URL du Keycloak (`https://keycloak.bober.ovh/realms/master`, comme en cours)
sont déjà dans `application.yml`. Si le realm est différent, changer `issuer-uri`
ou définir la variable d'environnement `OIDC_ISSUER_URI`.

### Récupérer un token (Postman ou curl)
Client id : `coursm2` (le même qu'en cours). Exemple avec le flux « password », s'il est activé sur le client :
```
curl -X POST https://keycloak.bober.ovh/realms/master/protocol/openid-connect/token \
  -d grant_type=password -d client_id=coursm2 \
  -d username=noel.flantier@michelin.fr -d password=cestbeaulhiver
```
Le champ `access_token` de la réponse se colle dans le bouton Authorize de Swagger.

Swagger : http://localhost:8080/swagger-ui.html (bouton Authorize pour coller le token)

## Routes
- `GET /restaurants`, `GET /restaurants/{id}` (avec `moyenne`, -1 si pas d'évaluation)
- `POST /restaurants`, `PUT /restaurants/{id}`, `POST /restaurants/{id}/image` : ADMIN
- `POST /restaurants/{id}/evaluations`
- `GET /evaluations?motsCles=...`, `GET /evaluations/mes-evaluations`
- `DELETE /evaluations/{id}` (la sienne, ou toutes si ADMIN)
- `POST /evaluations/{id}/photos`

## Pas fait / à améliorer
- pas testé avec le vrai Keycloak (j'ai supposé que les rôles sont dans `realm_access.roles`)
- tests seulement sur les services
- pas de modification d'une évaluation
- les photos ne sont pas supprimées de S3

# Guide Michelin API

API Spring Boot (Java 17, Maven) pour gérer des restaurants et leurs évaluations.

## Lancer
```
mvn test
mvn spring-boot:run
```
L'API tourne sur http://localhost:8080 et Swagger sur http://localhost:8080/swagger-ui.html.
La base est H2 en mémoire, donc tout est effacé quand on arrête.

## Config
Tout est dans `src/main/resources/application.yml` :
- Keycloak du cours (`keycloak.bober.ovh`, realm `master`)
- S3 avec les clés données dans l'énoncé

Pour tester il faut un token (client `coursm2`), à coller dans "Authorize" sur Swagger.

## Routes
- `GET /restaurants` et `GET /restaurants/{id}` : avec la `moyenne` (-1 si aucune évaluation)
- `POST /restaurants`, `PUT /restaurants/{id}`, `POST /restaurants/{id}/image` : ADMIN seulement
- `POST /restaurants/{id}/evaluations` : ajouter une évaluation
- `GET /evaluations?motsCles=a&motsCles=b` : recherche dans les commentaires
- `GET /evaluations/mes-evaluations` : les évaluations de l'utilisateur connecté
- `DELETE /evaluations/{id}` : la sienne, ou n'importe laquelle si ADMIN
- `POST /evaluations/{id}/photos` : photos des plats

## Ce qui manque
- Je n'ai pas pu tester avec le vrai Keycloak. Je lis les rôles dans `realm_access.roles`, à vérifier.
- Pas de modification d'une évaluation.
- Les photos ne sont pas supprimées de S3 quand on supprime une évaluation.
- Les erreurs 401 et 403 n'ont pas le format `{code, message}`.
- Tests seulement sur les services.

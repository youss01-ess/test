package com.example.guidemichelin.security;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

/**
 * Infos de l'utilisateur connecté, extraites du JWT.
 * On passe ce petit objet aux services pour qu'ils ne dépendent pas de Spring Security
 * (et que ce soit plus simple à tester).
 */
public record CurrentUser(String id, String nom, boolean admin) {

    public static CurrentUser from(JwtAuthenticationToken auth) {
        boolean admin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return fromJwt(auth.getToken(), admin);
    }

    static CurrentUser fromJwt(Jwt jwt, boolean admin) {
        String nom = jwt.getClaimAsString("name");
        if (nom == null) {
            nom = jwt.getClaimAsString("preferred_username");
        }
        if (nom == null) {
            nom = jwt.getSubject();
        }
        // La colonne en base est limitée à 50 caractères
        if (nom.length() > 50) {
            nom = nom.substring(0, 50);
        }
        return new CurrentUser(jwt.getSubject(), nom, admin);
    }
}

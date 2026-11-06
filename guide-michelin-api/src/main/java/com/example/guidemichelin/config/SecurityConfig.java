package com.example.guidemichelin.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable) // API stateless avec JWT : pas besoin de CSRF
                .authorizeHttpRequests(auth -> auth
                        // Swagger et console H2 accessibles sans token
                        .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**", "/h2-console/**").permitAll()
                        // Seuls les admins créent / modifient les restaurants
                        .requestMatchers(HttpMethod.POST, "/restaurants", "/restaurants/*/image").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/restaurants/*").hasRole("ADMIN")
                        // Le reste : utilisateur connecté avec le rôle USER ou ADMIN
                        // (la règle "on ne supprime que ses évaluations" est vérifiée dans le service)
                        .anyRequest().hasAnyRole("USER", "ADMIN"))
                .oauth2ResourceServer(oauth -> oauth.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())))
                .headers(h -> h.frameOptions(f -> f.sameOrigin())) // pour la console H2
                .cors(Customizer.withDefaults());
        return http.build();
    }

    /**
     * Transforme les rôles contenus dans le JWT en "authorities" Spring (ROLE_USER, ROLE_ADMIN).
     */
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(SecurityConfig::extractAuthorities);
        return converter;
    }

    // Keycloak met les rôles dans "realm_access.roles" ; d'autres serveurs utilisent "roles".
    // On regarde les deux pour être tranquille.
    static Collection<GrantedAuthority> extractAuthorities(Jwt jwt) {
        List<String> roles = new ArrayList<>();

        Object realmAccess = jwt.getClaim("realm_access");
        if (realmAccess instanceof Map<?, ?> map && map.get("roles") instanceof Collection<?> realmRoles) {
            realmRoles.forEach(r -> roles.add(r.toString()));
        }
        List<String> topLevelRoles = jwt.getClaimAsStringList("roles");
        if (topLevelRoles != null) {
            roles.addAll(topLevelRoles);
        }

        List<GrantedAuthority> authorities = new ArrayList<>();
        for (String role : roles) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));
        }
        return authorities;
    }
}

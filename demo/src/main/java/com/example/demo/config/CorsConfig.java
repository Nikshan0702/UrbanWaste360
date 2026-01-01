package com.example.demo.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origins:}")
    private String allowedOrigins;

    @Value("${app.cors.allowed-origin-patterns:}")
    private String allowedOriginPatterns;

    @Value("${app.cors.allow-credentials:true}")
    private boolean allowCredentials;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();

        // Prefer allowed-origin-patterns for safety with credentials
        if (StringUtils.hasText(allowedOriginPatterns)) {
            cfg.setAllowedOriginPatterns(split(allowedOriginPatterns));
        } else if (StringUtils.hasText(allowedOrigins)) {
            List<String> origins = split(allowedOrigins);
            if (origins.size() == 1 && "*".equals(origins.get(0))) {
                cfg.setAllowedOriginPatterns(List.of("*"));
            } else {
                cfg.setAllowedOrigins(origins);
            }
        } else {
            cfg.setAllowedOriginPatterns(List.of("*"));
        }

        cfg.setAllowCredentials(allowCredentials);
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setExposedHeaders(List.of("Location"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }

    private static List<String> split(String csv) {
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }
}

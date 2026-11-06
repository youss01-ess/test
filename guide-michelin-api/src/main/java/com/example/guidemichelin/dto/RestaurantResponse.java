package com.example.guidemichelin.dto;

import java.util.List;

/** "moyenne" vaut -1 quand le restaurant n'a aucune évaluation. */
public record RestaurantResponse(
        Long id,
        String nom,
        String adresse,
        String imageUrl,
        List<EvaluationResponse> evaluations,
        double moyenne) {
}

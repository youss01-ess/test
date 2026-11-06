package com.example.guidemichelin.dto;

import java.util.List;

public record RestaurantResponse(
        Long id,
        String nom,
        String adresse,
        String imageUrl,
        List<EvaluationResponse> evaluations,
        double moyenne) {
}

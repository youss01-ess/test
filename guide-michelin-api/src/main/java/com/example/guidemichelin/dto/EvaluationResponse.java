package com.example.guidemichelin.dto;

import java.util.List;

public record EvaluationResponse(
        Long id,
        Long restaurantId,
        String evaluateur,
        String commentaire,
        int note,
        List<String> photos) {
}

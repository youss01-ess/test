package com.example.guidemichelin.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EvaluationRequest(
        @NotBlank @Size(max = 255) String commentaire,
        @Min(0) @Max(3) int note) {
}

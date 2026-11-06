package com.example.guidemichelin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RestaurantRequest(
        @NotBlank @Size(max = 90) String nom,
        @NotBlank @Size(max = 255) String adresse) {
}

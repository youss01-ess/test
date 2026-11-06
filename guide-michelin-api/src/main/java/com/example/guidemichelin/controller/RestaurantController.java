package com.example.guidemichelin.controller;

import com.example.guidemichelin.dto.EvaluationRequest;
import com.example.guidemichelin.dto.EvaluationResponse;
import com.example.guidemichelin.dto.RestaurantRequest;
import com.example.guidemichelin.dto.RestaurantResponse;
import com.example.guidemichelin.security.CurrentUser;
import com.example.guidemichelin.service.EvaluationService;
import com.example.guidemichelin.service.RestaurantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/restaurants")
@Tag(name = "Restaurants")
public class RestaurantController {

    private final RestaurantService restaurantService;
    private final EvaluationService evaluationService;

    public RestaurantController(RestaurantService restaurantService, EvaluationService evaluationService) {
        this.restaurantService = restaurantService;
        this.evaluationService = evaluationService;
    }

    @GetMapping
    @Operation(summary = "Liste tous les restaurants (avec leur moyenne)")
    public List<RestaurantResponse> getAll() {
        return restaurantService.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupère un restaurant (avec sa moyenne)")
    public RestaurantResponse getOne(@PathVariable Long id) {
        return restaurantService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Crée un restaurant (ADMIN)")
    public RestaurantResponse create(@Valid @RequestBody RestaurantRequest request) {
        return restaurantService.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifie le nom et l'adresse d'un restaurant (ADMIN)")
    public RestaurantResponse update(@PathVariable Long id, @Valid @RequestBody RestaurantRequest request) {
        return restaurantService.update(id, request);
    }

    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Envoie l'image du restaurant (ADMIN)")
    public RestaurantResponse uploadImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return restaurantService.updateImage(id, file);
    }

    @PostMapping("/{id}/evaluations")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Ajoute une évaluation sur un restaurant")
    public EvaluationResponse addEvaluation(@PathVariable Long id,
                                            @Valid @RequestBody EvaluationRequest request,
                                            JwtAuthenticationToken auth) {
        return evaluationService.add(id, request, CurrentUser.from(auth));
    }
}

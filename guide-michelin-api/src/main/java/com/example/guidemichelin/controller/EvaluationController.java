package com.example.guidemichelin.controller;

import com.example.guidemichelin.dto.EvaluationResponse;
import com.example.guidemichelin.security.CurrentUser;
import com.example.guidemichelin.service.EvaluationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/evaluations")
@Tag(name = "Evaluations")
public class EvaluationController {

    private final EvaluationService evaluationService;

    public EvaluationController(EvaluationService evaluationService) {
        this.evaluationService = evaluationService;
    }

    @GetMapping
    @Operation(summary = "Recherche des évaluations par mots clefs (ex: ?motsCles=pizza&motsCles=cher)")
    public List<EvaluationResponse> search(@RequestParam(required = false) List<String> motsCles) {
        return evaluationService.search(motsCles);
    }

    // Attention : cette route doit rester distincte de /{id}
    @GetMapping("/mes-evaluations")
    @Operation(summary = "Récupère les évaluations créées par l'utilisateur connecté")
    public List<EvaluationResponse> mine(JwtAuthenticationToken auth) {
        return evaluationService.findMine(CurrentUser.from(auth));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Supprime une évaluation (la sienne, ou n'importe laquelle pour un ADMIN)")
    public void delete(@PathVariable Long id, JwtAuthenticationToken auth) {
        evaluationService.delete(id, CurrentUser.from(auth));
    }

    @PostMapping(value = "/{id}/photos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Ajoute des photos de plats à une évaluation")
    public EvaluationResponse addPhotos(@PathVariable Long id,
                                        @RequestParam("files") List<MultipartFile> files,
                                        JwtAuthenticationToken auth) {
        return evaluationService.addPhotos(id, files, CurrentUser.from(auth));
    }
}

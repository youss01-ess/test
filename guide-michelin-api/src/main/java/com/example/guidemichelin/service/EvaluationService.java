package com.example.guidemichelin.service;

import com.example.guidemichelin.dto.EvaluationRequest;
import com.example.guidemichelin.dto.EvaluationResponse;
import com.example.guidemichelin.entity.Evaluation;
import com.example.guidemichelin.entity.Restaurant;
import com.example.guidemichelin.exception.ForbiddenException;
import com.example.guidemichelin.exception.NotFoundException;
import com.example.guidemichelin.repository.EvaluationRepository;
import com.example.guidemichelin.repository.RestaurantRepository;
import com.example.guidemichelin.security.CurrentUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final RestaurantRepository restaurantRepository;
    private final StorageService storageService;

    public EvaluationService(EvaluationRepository evaluationRepository,
                             RestaurantRepository restaurantRepository,
                             StorageService storageService) {
        this.evaluationRepository = evaluationRepository;
        this.restaurantRepository = restaurantRepository;
        this.storageService = storageService;
    }

    public EvaluationResponse add(Long restaurantId, EvaluationRequest request, CurrentUser user) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new NotFoundException("Restaurant " + restaurantId + " introuvable"));

        Evaluation evaluation = new Evaluation();
        evaluation.setRestaurant(restaurant);
        evaluation.setEvaluateur(user.nom());
        evaluation.setAuteurId(user.id());
        evaluation.setCommentaire(request.commentaire());
        evaluation.setNote(request.note());

        return RestaurantService.toResponse(evaluationRepository.save(evaluation));
    }

    public void delete(Long id, CurrentUser user) {
        Evaluation evaluation = getEvaluation(id);
        checkCanEdit(evaluation, user);
        evaluationRepository.delete(evaluation);
        // TODO : supprimer aussi les photos sur S3
    }

    public EvaluationResponse addPhotos(Long id, List<MultipartFile> files, CurrentUser user) {
        Evaluation evaluation = getEvaluation(id);
        checkCanEdit(evaluation, user);
        for (MultipartFile file : files) {
            evaluation.getPhotos().add(storageService.uploadEvaluationPhoto(file));
        }
        return RestaurantService.toResponse(evaluationRepository.save(evaluation));
    }

    /**
     * Cherche les évaluations dont le commentaire contient au moins un des mots clefs.
     * Sans mot clef, on renvoie tout.
     */
    @Transactional(readOnly = true)
    public List<EvaluationResponse> search(List<String> motsCles) {
        if (motsCles == null || motsCles.isEmpty()) {
            return evaluationRepository.findAll().stream().map(RestaurantService::toResponse).toList();
        }
        // Map par id pour ne pas avoir de doublons si une évaluation contient plusieurs mots clefs
        Map<Long, Evaluation> resultats = new LinkedHashMap<>();
        for (String motCle : motsCles) {
            for (Evaluation e : evaluationRepository.findByCommentaireContainingIgnoreCase(motCle)) {
                resultats.put(e.getId(), e);
            }
        }
        return resultats.values().stream().map(RestaurantService::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<EvaluationResponse> findMine(CurrentUser user) {
        return evaluationRepository.findByAuteurId(user.id()).stream()
                .map(RestaurantService::toResponse)
                .toList();
    }

    private Evaluation getEvaluation(Long id) {
        return evaluationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Evaluation " + id + " introuvable"));
    }

    // Un USER ne touche qu'à ses évaluations, un ADMIN à toutes
    private void checkCanEdit(Evaluation evaluation, CurrentUser user) {
        if (!user.admin() && !evaluation.getAuteurId().equals(user.id())) {
            throw new ForbiddenException("Vous ne pouvez modifier que vos propres évaluations");
        }
    }
}

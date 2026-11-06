package com.example.guidemichelin.service;

import com.example.guidemichelin.dto.EvaluationResponse;
import com.example.guidemichelin.dto.RestaurantRequest;
import com.example.guidemichelin.dto.RestaurantResponse;
import com.example.guidemichelin.entity.Evaluation;
import com.example.guidemichelin.entity.Restaurant;
import com.example.guidemichelin.exception.NotFoundException;
import com.example.guidemichelin.repository.RestaurantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@Transactional
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final StorageService storageService;

    public RestaurantService(RestaurantRepository restaurantRepository, StorageService storageService) {
        this.restaurantRepository = restaurantRepository;
        this.storageService = storageService;
    }

    @Transactional(readOnly = true)
    public List<RestaurantResponse> findAll() {
        return restaurantRepository.findAll().stream().map(RestaurantService::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public RestaurantResponse findById(Long id) {
        return toResponse(getRestaurant(id));
    }

    public RestaurantResponse create(RestaurantRequest request) {
        Restaurant restaurant = new Restaurant(request.nom(), request.adresse());
        return toResponse(restaurantRepository.save(restaurant));
    }

    public RestaurantResponse update(Long id, RestaurantRequest request) {
        Restaurant restaurant = getRestaurant(id);
        restaurant.setNom(request.nom());
        restaurant.setAdresse(request.adresse());
        return toResponse(restaurantRepository.save(restaurant));
    }

    public RestaurantResponse updateImage(Long id, MultipartFile file) {
        Restaurant restaurant = getRestaurant(id);
        restaurant.setImageUrl(storageService.uploadRestaurantImage(file));
        return toResponse(restaurantRepository.save(restaurant));
    }

    private Restaurant getRestaurant(Long id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Restaurant " + id + " introuvable"));
    }


    static RestaurantResponse toResponse(Restaurant r) {
        List<EvaluationResponse> evaluations = r.getEvaluations().stream()
                .map(RestaurantService::toResponse)
                .toList();
        return new RestaurantResponse(r.getId(), r.getNom(), r.getAdresse(), r.getImageUrl(),
                evaluations, calculerMoyenne(r.getEvaluations()));
    }

    static EvaluationResponse toResponse(Evaluation e) {
        return new EvaluationResponse(e.getId(), e.getRestaurant().getId(), e.getEvaluateur(),
                e.getCommentaire(), e.getNote(), e.getPhotos());
    }

    // -1 si pas d'évaluation (voir énoncé)
    static double calculerMoyenne(List<Evaluation> evaluations) {
        if (evaluations == null || evaluations.isEmpty()) {
            return -1;
        }
        return evaluations.stream().mapToInt(Evaluation::getNote).average().orElse(-1);
    }
}

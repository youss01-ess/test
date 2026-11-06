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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EvaluationServiceTest {

    @Mock
    private EvaluationRepository evaluationRepository;
    @Mock
    private RestaurantRepository restaurantRepository;
    @Mock
    private StorageService storageService;
    @InjectMocks
    private EvaluationService evaluationService;

    private final CurrentUser lucien = new CurrentUser("user-1", "Lucien Bramard", false);
    private final CurrentUser autreUser = new CurrentUser("user-2", "Quelqu'un", false);
    private final CurrentUser noel = new CurrentUser("admin-1", "Noël Flantier", true);

    private Restaurant restaurant;

    @BeforeEach
    void setUp() {
        restaurant = new Restaurant("Chez Paul", "1 rue de Paris");
        restaurant.setId(1L);
    }

    private Evaluation evaluation(Long id, String auteurId, String commentaire) {
        Evaluation e = new Evaluation();
        e.setId(id);
        e.setAuteurId(auteurId);
        e.setEvaluateur("Quelqu'un");
        e.setCommentaire(commentaire);
        e.setNote(2);
        e.setRestaurant(restaurant);
        return e;
    }

    // ---------- add ----------

    @Test
    void add_creeUneEvaluationAvecLAuteurDuToken() {
        when(restaurantRepository.findById(1L)).thenReturn(Optional.of(restaurant));
        when(evaluationRepository.save(any(Evaluation.class))).thenAnswer(inv -> {
            Evaluation e = inv.getArgument(0);
            e.setId(10L);
            return e;
        });

        EvaluationResponse result = evaluationService.add(1L, new EvaluationRequest("Très bon", 3), lucien);

        assertEquals(10L, result.id());
        assertEquals("Lucien Bramard", result.evaluateur());
        assertEquals(3, result.note());
        assertEquals(1L, result.restaurantId());
    }

    @Test
    void add_restaurantInconnu_lanceNotFound() {
        when(restaurantRepository.findById(404L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class,
                () -> evaluationService.add(404L, new EvaluationRequest("Bof", 1), lucien));
        verify(evaluationRepository, never()).save(any());
    }

    // ---------- delete ----------

    @Test
    void delete_proprietaire_supprime() {
        Evaluation e = evaluation(1L, "user-1", "ok");
        when(evaluationRepository.findById(1L)).thenReturn(Optional.of(e));

        evaluationService.delete(1L, lucien);

        verify(evaluationRepository).delete(e);
    }

    @Test
    void delete_adminPeutSupprimerCelleDesAutres() {
        Evaluation e = evaluation(1L, "user-1", "ok");
        when(evaluationRepository.findById(1L)).thenReturn(Optional.of(e));

        evaluationService.delete(1L, noel);

        verify(evaluationRepository).delete(e);
    }

    @Test
    void delete_autreUtilisateur_lanceForbidden() {
        Evaluation e = evaluation(1L, "user-1", "ok");
        when(evaluationRepository.findById(1L)).thenReturn(Optional.of(e));

        assertThrows(ForbiddenException.class, () -> evaluationService.delete(1L, autreUser));
        verify(evaluationRepository, never()).delete(any(Evaluation.class));
    }

    @Test
    void delete_evaluationInconnue_lanceNotFound() {
        when(evaluationRepository.findById(7L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> evaluationService.delete(7L, noel));
    }

    // ---------- search ----------

    @Test
    void search_unMotCle() {
        when(evaluationRepository.findByCommentaireContainingIgnoreCase("pizza"))
                .thenReturn(List.of(evaluation(1L, "user-1", "super pizza")));

        List<EvaluationResponse> result = evaluationService.search(List.of("pizza"));

        assertEquals(1, result.size());
        assertEquals("super pizza", result.get(0).commentaire());
    }

    @Test
    void search_plusieursMotsCles_pasDeDoublons() {
        Evaluation both = evaluation(1L, "user-1", "pizza pas chère");
        Evaluation onlyCher = evaluation(2L, "user-2", "trop cher");
        when(evaluationRepository.findByCommentaireContainingIgnoreCase("pizza")).thenReturn(List.of(both));
        when(evaluationRepository.findByCommentaireContainingIgnoreCase("cher")).thenReturn(List.of(both, onlyCher));

        List<EvaluationResponse> result = evaluationService.search(List.of("pizza", "cher"));

        assertEquals(2, result.size());
    }

    @Test
    void search_aucunMotCle_renvoieTout() {
        when(evaluationRepository.findAll()).thenReturn(List.of(
                evaluation(1L, "user-1", "a"), evaluation(2L, "user-2", "b")));

        assertEquals(2, evaluationService.search(null).size());
        assertEquals(2, evaluationService.search(List.of()).size());
    }

    @Test
    void search_aucunResultat_listeVide() {
        when(evaluationRepository.findByCommentaireContainingIgnoreCase("xyz")).thenReturn(List.of());

        assertTrue(evaluationService.search(List.of("xyz")).isEmpty());
    }

    // ---------- findMine ----------

    @Test
    void findMine_neRenvoieQueLesEvaluationsDeLUtilisateur() {
        when(evaluationRepository.findByAuteurId("user-1"))
                .thenReturn(List.of(evaluation(1L, "user-1", "a"), evaluation(3L, "user-1", "c")));

        List<EvaluationResponse> result = evaluationService.findMine(lucien);

        assertEquals(2, result.size());
        verify(evaluationRepository).findByAuteurId("user-1");
    }
}

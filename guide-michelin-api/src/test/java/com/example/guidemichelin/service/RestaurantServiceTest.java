package com.example.guidemichelin.service;

import com.example.guidemichelin.dto.RestaurantRequest;
import com.example.guidemichelin.dto.RestaurantResponse;
import com.example.guidemichelin.entity.Evaluation;
import com.example.guidemichelin.entity.Restaurant;
import com.example.guidemichelin.exception.NotFoundException;
import com.example.guidemichelin.repository.RestaurantRepository;
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
class RestaurantServiceTest {

    @Mock
    private RestaurantRepository restaurantRepository;
    @Mock
    private StorageService storageService;
    @InjectMocks
    private RestaurantService restaurantService;

    // Petit helper pour construire un restaurant avec des notes
    private Restaurant restaurantAvecNotes(Long id, int... notes) {
        Restaurant r = new Restaurant("Chez Paul", "1 rue de Paris");
        r.setId(id);
        for (int note : notes) {
            Evaluation e = new Evaluation();
            e.setNote(note);
            e.setRestaurant(r);
            r.getEvaluations().add(e);
        }
        return r;
    }

    @Test
    void findById_sansEvaluation_moyenneEgaleMoinsUn() {
        when(restaurantRepository.findById(1L)).thenReturn(Optional.of(restaurantAvecNotes(1L)));

        RestaurantResponse result = restaurantService.findById(1L);

        assertEquals(-1, result.moyenne());
        assertTrue(result.evaluations().isEmpty());
    }

    @Test
    void findById_avecEvaluations_calculeLaMoyenne() {
        when(restaurantRepository.findById(1L)).thenReturn(Optional.of(restaurantAvecNotes(1L, 3, 2, 1)));

        RestaurantResponse result = restaurantService.findById(1L);

        assertEquals(2.0, result.moyenne());
        assertEquals(3, result.evaluations().size());
    }

    @Test
    void findById_noteZeroEstPriseEnCompte() {
        // 0 est une vraie note, ce n'est pas "pas de note"
        when(restaurantRepository.findById(1L)).thenReturn(Optional.of(restaurantAvecNotes(1L, 0, 3)));

        assertEquals(1.5, restaurantService.findById(1L).moyenne());
    }

    @Test
    void findById_restaurantInconnu_lanceNotFound() {
        when(restaurantRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> restaurantService.findById(99L));
    }

    @Test
    void findAll_renvoieLesMoyennesDeChaqueRestaurant() {
        when(restaurantRepository.findAll()).thenReturn(List.of(
                restaurantAvecNotes(1L),
                restaurantAvecNotes(2L, 3, 3)));

        List<RestaurantResponse> result = restaurantService.findAll();

        assertEquals(2, result.size());
        assertEquals(-1, result.get(0).moyenne());
        assertEquals(3.0, result.get(1).moyenne());
    }

    @Test
    void create_sauvegardeLeRestaurant() {
        when(restaurantRepository.save(any(Restaurant.class))).thenAnswer(inv -> {
            Restaurant r = inv.getArgument(0);
            r.setId(5L);
            return r;
        });

        RestaurantResponse result = restaurantService.create(new RestaurantRequest("Le Bistrot", "2 avenue Foch"));

        assertEquals(5L, result.id());
        assertEquals("Le Bistrot", result.nom());
        assertEquals(-1, result.moyenne());
    }

    @Test
    void update_modifieNomEtAdresse() {
        Restaurant existant = restaurantAvecNotes(1L, 2);
        when(restaurantRepository.findById(1L)).thenReturn(Optional.of(existant));
        when(restaurantRepository.save(existant)).thenReturn(existant);

        RestaurantResponse result = restaurantService.update(1L, new RestaurantRequest("Nouveau nom", "Nouvelle adresse"));

        assertEquals("Nouveau nom", result.nom());
        assertEquals("Nouvelle adresse", result.adresse());
        assertEquals(2.0, result.moyenne());
    }

    @Test
    void update_restaurantInconnu_lanceNotFound() {
        when(restaurantRepository.findById(42L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class,
                () -> restaurantService.update(42L, new RestaurantRequest("a", "b")));
        verify(restaurantRepository, never()).save(any());
    }
}

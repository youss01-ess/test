package com.example.guidemichelin.repository;

import com.example.guidemichelin.entity.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {

    List<Evaluation> findByCommentaireContainingIgnoreCase(String motCle);

    List<Evaluation> findByAuteurId(String auteurId);
}

package com.example.guidemichelin.entity;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
public class Evaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nom affiché de l'évaluateur (récupéré dans le JWT)
    @Column(nullable = false, length = 50)
    private String evaluateur;

    // Identifiant ("sub") de l'utilisateur dans le JWT : sert à savoir à qui appartient l'évaluation
    @Column(nullable = false)
    private String auteurId;

    @Column(nullable = false, length = 255)
    private String commentaire;

    // Nombre d'étoiles : 0, 1, 2 ou 3
    @Column(nullable = false)
    private int note;

    // URLs des photos des plats (stockées sur S3)
    @ElementCollection
    private List<String> photos = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Restaurant restaurant;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEvaluateur() { return evaluateur; }
    public void setEvaluateur(String evaluateur) { this.evaluateur = evaluateur; }

    public String getAuteurId() { return auteurId; }
    public void setAuteurId(String auteurId) { this.auteurId = auteurId; }

    public String getCommentaire() { return commentaire; }
    public void setCommentaire(String commentaire) { this.commentaire = commentaire; }

    public int getNote() { return note; }
    public void setNote(int note) { this.note = note; }

    public List<String> getPhotos() { return photos; }
    public void setPhotos(List<String> photos) { this.photos = photos; }

    public Restaurant getRestaurant() { return restaurant; }
    public void setRestaurant(Restaurant restaurant) { this.restaurant = restaurant; }
}

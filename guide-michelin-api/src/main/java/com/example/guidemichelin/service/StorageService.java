package com.example.guidemichelin.service;

import com.example.guidemichelin.config.StorageProperties;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

/** Envoie les images sur le serveur S3 et renvoie leur URL. */
@Service
public class StorageService {

    private final S3Client s3Client;
    private final StorageProperties properties;

    public StorageService(S3Client s3Client, StorageProperties properties) {
        this.s3Client = s3Client;
        this.properties = properties;
    }

    public String uploadRestaurantImage(MultipartFile file) {
        return upload(properties.getBucketRestaurant(), file);
    }

    public String uploadEvaluationPhoto(MultipartFile file) {
        return upload(properties.getBucketEvaluation(), file);
    }

    private String upload(String bucket, MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Le fichier doit être une image");
        }
        // UUID pour éviter d'écraser un fichier qui a le même nom
        String key = UUID.randomUUID() + "-" + file.getOriginalFilename();
        try {
            s3Client.putObject(
                    PutObjectRequest.builder().bucket(bucket).key(key).contentType(contentType).build(),
                    RequestBody.fromBytes(file.getBytes()));
        } catch (IOException e) {
            throw new RuntimeException("Impossible de lire le fichier envoyé", e);
        }
        return properties.getUrl() + "/" + bucket + "/" + key;
    }
}

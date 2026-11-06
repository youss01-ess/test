package com.example.guidemichelin.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Propriétés "storage.s3.*" du application.yml */
@ConfigurationProperties(prefix = "storage.s3")
public class StorageProperties {

    private String url;
    private String accessKeyId;
    private String secretAccessKey;
    private String bucketRestaurant;
    private String bucketEvaluation;

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getAccessKeyId() { return accessKeyId; }
    public void setAccessKeyId(String accessKeyId) { this.accessKeyId = accessKeyId; }

    public String getSecretAccessKey() { return secretAccessKey; }
    public void setSecretAccessKey(String secretAccessKey) { this.secretAccessKey = secretAccessKey; }

    public String getBucketRestaurant() { return bucketRestaurant; }
    public void setBucketRestaurant(String bucketRestaurant) { this.bucketRestaurant = bucketRestaurant; }

    public String getBucketEvaluation() { return bucketEvaluation; }
    public void setBucketEvaluation(String bucketEvaluation) { this.bucketEvaluation = bucketEvaluation; }
}

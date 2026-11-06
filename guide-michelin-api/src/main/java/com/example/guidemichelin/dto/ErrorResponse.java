package com.example.guidemichelin.dto;

/** Format d'erreur renvoyé par l'API : un code (HTTP) + un message. */
public record ErrorResponse(int code, String message) {
}

package com.splitwise.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.splitwise.model.ExtractedItemDetail;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GeminiService implements IAIService {

    @Value("${gemini.endpoint}")
    private String geminiEndPoint;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${prompts.extractItems}")
    private String extractItemsPrompt;

    private final RestTemplate restTemplate;

    private final ObjectMapper objectMapper;

    @Override
    public ExtractedItemDetail extractContentFromImage(MultipartFile imageFile) throws IOException {
        String apiUrl = geminiEndPoint + "?key=" + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String base64Image = Base64.getEncoder().encodeToString(imageFile.getBytes());
        String mimeType = imageFile.getContentType();

        Map<String, Object> imageData = new HashMap<>();
        imageData.put("mime_type", mimeType);
        imageData.put("data", base64Image);

        Map<String, Object> imagePart = new HashMap<>();
        imagePart.put("inline_data", imageData);

        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", extractItemsPrompt);

        List<Map<String, Object>> parts = List.of(imagePart, textPart);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", parts);

        List<Map<String, Object>> contents = List.of(content);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", contents);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
        ExtractedItemDetail extractedItemDetail = new ExtractedItemDetail();

        try {
            ResponseEntity<String> responseEntity = restTemplate.exchange(
                    apiUrl,
                    HttpMethod.POST,
                    requestEntity,
                    String.class
            );

            if (responseEntity.getStatusCode().is2xxSuccessful()) {
                return objectMapper.readValue(responseEntity.getBody(), ExtractedItemDetail.class);
            } else {
                extractedItemDetail.setError(
                        "Error: API request failed with status code " + responseEntity.getStatusCodeValue() + " Body: " + responseEntity.getBody());
            }

        } catch (Exception e) {
            extractedItemDetail.setError(e.getMessage());
        }

        return extractedItemDetail;
    }
}
package in.ap.ai.chat;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;


import java.util.*;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    // Optional: default model (used if auto-detect fails)
    @Value("${gemini.default.model:models/gemini-1.5-flash-latest}")
    private String defaultModel;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    // ✅ MAIN METHOD
    public String generate(String input) {
        try {
            String model = getWorkingModel(); // auto-detect working model
            String url = "https://generativelanguage.googleapis.com/v1/"
                    + model + ":generateContent?key=" + apiKey;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                    Map.of(
                        "parts", List.of(
                            Map.of("text", input)
                        )
                    )
                )
            );

            HttpEntity<Map<String, Object>> request =
                    new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response =
                    restTemplate.postForEntity(url, request, String.class);

            return extractText(response.getBody());

        } catch (Exception e) {
            e.printStackTrace();
            return "Error calling Gemini API";
        }
    }

    // ✅ AUTO-DETECT VALID MODEL (prevents 404)
    private String getWorkingModel() {
        try {
            String url = "https://generativelanguage.googleapis.com/v1/models?key=" + apiKey;

            ResponseEntity<String> response =
                    restTemplate.getForEntity(url, String.class);

            Map<?, ?> map = mapper.readValue(response.getBody(), Map.class);
            List<?> models = (List<?>) map.get("models");

            for (Object obj : models) {
                Map<?, ?> model = (Map<?, ?>) obj;

                List<?> methods = (List<?>) model.get("supportedGenerationMethods");

                if (methods != null && methods.contains("generateContent")) {
                    // return first working model
                    return model.get("name").toString();
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        // fallback if API fails
        return defaultModel;
    }

    // ✅ CLEAN RESPONSE PARSING
    private String extractText(String json) {
        try {
            Map<?, ?> map = mapper.readValue(json, Map.class);

            List<?> candidates = (List<?>) map.get("candidates");
            if (candidates == null || candidates.isEmpty()) {
                return "No response from AI";
            }

            Map<?, ?> first = (Map<?, ?>) candidates.get(0);
            Map<?, ?> content = (Map<?, ?>) first.get("content");
            List<?> parts = (List<?>) content.get("parts");

            if (parts == null || parts.isEmpty()) {
                return "Empty response";
            }

            return ((Map<?, ?>) parts.get(0)).get("text").toString();

        } catch (Exception e) {
            e.printStackTrace();
            return "Error parsing Gemini response";
        }
    }

    // ✅ DEBUG: LIST ALL MODELS
    public List<String> listAvailableModels() {
        try {
            String url = "https://generativelanguage.googleapis.com/v1/models?key=" + apiKey;

            ResponseEntity<String> response =
                    restTemplate.getForEntity(url, String.class);

            Map<?, ?> map = mapper.readValue(response.getBody(), Map.class);
            List<?> models = (List<?>) map.get("models");

            return models.stream()
                    .map(m -> ((Map<?, ?>) m).get("name").toString())
                    .collect(Collectors.toList());

        } catch (Exception e) {
            e.printStackTrace();
            return List.of("Error fetching models");
        }
    }
}
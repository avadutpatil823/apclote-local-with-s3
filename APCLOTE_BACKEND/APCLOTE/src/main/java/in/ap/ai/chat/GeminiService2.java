package in.ap.ai.chat;


import java.util.*;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class GeminiService2 {

    @Value("${deepseek.api.key}")
    private String apiKey;

    // Default model
    @Value("${deepseek.default.model:deepseek-chat}")
    private String defaultModel;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    // ✅ MAIN METHOD
    public String generate(String input) {
        try {
            String url = "https://api.deepseek.com/v1/chat/completions";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            Map<String, Object> requestBody = Map.of(
                "model", defaultModel,
                "messages", List.of(
                    Map.of("role", "system", "content", "You are an AI mentor that explains concepts step by step."),
                    Map.of("role", "user", "content", input)
                ),
                "max_tokens", 300,
                "temperature", 0.7
            );

            HttpEntity<Map<String, Object>> request =
                    new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response =
                    restTemplate.postForEntity(url, request, String.class);

            return extractText(response.getBody());

        } catch (Exception e) {
            e.printStackTrace();
            return "Error calling DeepSeek API";
        }
    }

    // ✅ CLEAN RESPONSE PARSING
    private String extractText(String json) {
        try {
            Map<?, ?> map = mapper.readValue(json, Map.class);

            List<?> choices = (List<?>) map.get("choices");
            if (choices == null || choices.isEmpty()) {
                return "No response from AI";
            }

            Map<?, ?> first = (Map<?, ?>) choices.get(0);
            Map<?, ?> message = (Map<?, ?>) first.get("message");

            return message.get("content").toString();

        } catch (Exception e) {
            e.printStackTrace();
            return "Error parsing DeepSeek response";
        }
    }

    // ✅ OPTIONAL: LIST MODELS (STATIC LIST – DeepSeek doesn't provide public endpoint like Gemini)
    public List<String> listAvailableModels() {
        return List.of(
            "deepseek-chat",
            "deepseek-coder"
        );
    }
}

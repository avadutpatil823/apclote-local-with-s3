package in.ap.ai.chat;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ChatService {

    @Autowired
    private ChatMessageRepository repo;

    @Autowired
    private GeminiService gemini;

    // =========================
    // 🧠 MAIN CHAT FUNCTION
    // =========================

    public String chat(String userId, String topic, String question) {

        if (topic == null || topic.trim().isEmpty()) {
            topic = generateTopic(question);
        }

        // ✅ fetch USER-SPECIFIC history
        List<ChatMessage> history =
            repo.findByUserIdAndTopicOrderByCreatedAtAsc(userId, topic);

        String context = buildContext(history);

        String prompt = """
                You are an advanced AI ChatGPT-like Tutor Assistant.

                =========================
                RULES
                =========================
                - Always respond in clean plain text only
                - Do NOT use markdown (*, #, ```)
                - Each idea must be on a new line
                - Use short and simple sentences
                - Be structured and human-like
                - Give real-life examples when needed
                - Be clear and educational

                =========================
                RESPONSE FORMAT
                =========================
                1. Short answer (1–2 lines)
                2. Explanation (step-by-step if needed)
                3. Real-life example

                =========================
                CHAT HISTORY
                =========================
                %s

                =========================
                USER QUESTION
                =========================
                %s

                =========================
                INSTRUCTIONS
                =========================
                - Use history only if relevant
                - Do not repeat previous answers
                - Be concise but complete
                """.formatted(context, question);

        String reply = gemini.generate(prompt);
        reply = cleanResponse(reply);

        // ✅ save with userId
        save(userId, topic, "user", question);
        save(userId, topic, "assistant", reply);

        return reply;
    }
    
    
    
    
    // =========================
    // 🧠 AUTO TOPIC GENERATION
    // =========================
    private String generateTopic(String question) {

        try {
            String prompt = """
                    Generate a short chat title (2 to 5 words only).
                    No explanation, only title.

                    Example:
                    Input: What is polymorphism in Java?
                    Output: Java Polymorphism

                    Input:
                    %s
                    """.formatted(question);

            String topic = gemini.generate(prompt);

            return topic
                    .replaceAll("[^a-zA-Z0-9 ]", "")
                    .trim();

        } catch (Exception e) {
            return "General Chat";
        }
    }

    // =========================
    // 🧠 BUILD CONTEXT MEMORY
    // =========================
    private String buildContext(List<ChatMessage> history) {

        if (history == null || history.isEmpty()) {
            return "";
        }

        StringBuilder sb = new StringBuilder();

        // limit context to last 10 messages (performance fix)
        int start = Math.max(0, history.size() - 10);

        for (int i = start; i < history.size(); i++) {

            ChatMessage msg = history.get(i);

            sb.append(msg.getRole())
              .append(": ")
              .append(msg.getContent())
              .append("\n");
        }

        return sb.toString();
    }

    // =========================
    // 🧹 CLEAN RESPONSE
    // =========================
    private String cleanResponse(String text) {

        if (text == null) return "";

        return text
                .replace("```", "")
                .replace("*", "")
                .replace("#", "")
                .replaceAll("\\r", "")
                .replaceAll("\\n{3,}", "\n\n")
                .replaceAll("\\s{2,}", " ")
                .trim();
    }

    // =========================
    // 💾 SAVE MESSAGE
    // =========================
    private void save(String userId, String topic, String role, String content) {

        ChatMessage msg = new ChatMessage();
        msg.setUserId(userId); // ✅ important
        msg.setTopic(topic);
        msg.setRole(role);
        msg.setContent(content);
        msg.setCreatedAt(LocalDateTime.now());

        repo.save(msg);
    }

    public List<String> getAllTopics(String userId) {
        return repo.findDistinctTopicsByUser(userId);
    }

    public List<ChatMessage> getChat(String userId, String topic) {
        return repo.findByUserIdAndTopicOrderByCreatedAtAsc(userId, topic);
    }

    public void deleteChat(String userId, String topic) {
        repo.deleteByUserIdAndTopic(userId, topic);
    }
    
    
    
    
}
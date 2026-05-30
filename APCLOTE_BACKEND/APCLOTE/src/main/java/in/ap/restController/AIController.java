package in.ap.restController;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import in.ap.ai.chat.ChatMessage;
import in.ap.ai.chat.ChatService;
import in.ap.ai.mentor.MentorService;
import in.ap.entity.User;


@RestController
@RequestMapping("/api")
public class AIController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private MentorService mentorService;

    @Autowired
    private in.ap.service.UserService userService;

    // =========================
    // 🧠 GET LOGGED-IN USER ID
    // =========================
    private Long getUserId() {
        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User user = userService.getUserByEmail(email);
        return user.getId();
    }

    // =========================
    // 💬 CHAT
    // =========================
    @PostMapping("/chat")
    public Map<String, String> chat(@RequestBody Map<String, String> req) {

        Long userId = getUserId(); // ✅ get from token
        String topic = req.get("topic");
        String question = req.get("question");

        return Map.of(
            "reply",
            chatService.chat(userId.toString(), topic, question) // ✅ pass userId
        );
    }

    // =========================
    // 📂 GET TOPICS
    // =========================
    @GetMapping("/chat/topics")
    public List<String> getTopics() {

        Long userId = getUserId();

        return chatService.getAllTopics(userId.toString());
    }

    // =========================
    // 📜 GET CHAT HISTORY
    // =========================
    @GetMapping("/chat/{topic}")
    public List<ChatMessage> getChat(@PathVariable String topic) {

        Long userId = getUserId();

        return chatService.getChat(userId.toString(), topic);
    }

    // =========================
    // ❌ DELETE CHAT
    // =========================
    @DeleteMapping("/chat/{topic}")
    public Map<String, String> deleteChat(@PathVariable String topic) {

        Long userId = getUserId();

        chatService.deleteChat(userId.toString(), topic);

        return Map.of("message", "Chat deleted successfully");
    }

    // =========================
    // 🎓 MENTOR
    // =========================
    @PostMapping("/mentor")
    public Map<String, String> mentor(@RequestBody Map<String, String> req) {
        return Map.of("reply", mentorService.mentor(req.get("input"), req.get("mode")));
    }
}
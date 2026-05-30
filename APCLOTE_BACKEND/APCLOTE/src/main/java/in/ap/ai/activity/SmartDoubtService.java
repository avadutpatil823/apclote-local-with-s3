package in.ap.ai.activity;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import in.ap.ai.chat.ChatService;
import in.ap.ai.mentor.MentorService;
import in.ap.entity.ClassVideo;
import in.ap.repo.ClassVideoRepo;
import in.ap.restController.AIController;
@Service
public class SmartDoubtService {

    @Autowired
    private ClassVideoRepo videoRepo;

    @Autowired
    private AIController aiController;

    public Map<String, Object> handleDoubt(Long videoId, Long currentTime, String type) {

        ClassVideo video = videoRepo.findById(videoId).orElse(null);

        if (video == null) {
            return Map.of(
                "reply", "Video not found",
                "type", type
            );
        }

        String input = """
                User is stuck while watching a video.

                Title: %s
                Description: %s
                Current Time: %d seconds

                Explain the concept clearly in simple terms.
                """.formatted(
                video.getTitle(),
                video.getDescription(),
                currentTime
        );

        String reply;

        // =========================
        // 🔁 REDIRECT TO AIController
        // =========================

        if ("chatbot".equalsIgnoreCase(type)) {

            Map<String, String> req = Map.of(
                "topic", video.getTitle(),
                "question", input
            );

            reply = aiController.chat(req).get("reply");
        }
        else if ("mentor".equalsIgnoreCase(type)) {

            Map<String, String> req = Map.of(
                "input", input,
                "mode", "mentor"
            );

            reply = aiController.mentor(req).get("reply");
        }
        else {
            reply = "Invalid type";
        }

        // ✅ FINAL RESPONSE FORMAT
        return Map.of(
            "reply", reply,
            "type", type,
            "topic", video.getTitle(),
            "videoId", videoId,
            "currentTime", currentTime
        );
    }
}
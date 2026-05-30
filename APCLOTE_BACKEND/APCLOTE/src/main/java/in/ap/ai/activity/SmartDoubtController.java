package in.ap.ai.activity;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/doubt")
public class SmartDoubtController {

    @Autowired
    private SmartDoubtService doubtService;

    @PostMapping("/resolve") // ✅ match your frontend URL
    public Map<String, Object> handleDoubt(@RequestBody Map<String, Object> req) {

        Long videoId = Long.valueOf(req.get("videoId").toString());
        Long currentTime = Long.valueOf(req.get("currentTime").toString());
        String type = req.get("type").toString();

        return doubtService.handleDoubt(videoId, currentTime, type);
    }
}
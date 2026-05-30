package in.ap.ai.activity;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import in.ap.entity.User;
import in.ap.service.UserService;


@RestController
@RequestMapping("/api/tracking")
@CrossOrigin
public class VideoTrackingController {

    @Autowired
    private VideoTrackingService service;

    @Autowired
    private UserService userService;

    // 🔐 Extract user from JWT
    private Long getUserId() {
        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User user = userService.getUserByEmail(email);
        return user.getId();
    }

    // 🎯 Track user behavior
    @PostMapping("/update")
    public String track(@RequestParam Long videoId,
                        @RequestParam Long currentTime,
                        @RequestParam String action,
                        @RequestParam(required = false) Long durationSeconds) {

        Long userId = getUserId(); // secure extraction
        return service.track(userId, videoId, currentTime, action, durationSeconds);
    }
}

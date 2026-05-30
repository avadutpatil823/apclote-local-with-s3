package in.ap.ai.activity;

import java.util.Map;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import in.ap.entity.User;
import in.ap.service.UserService;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/progress")
@CrossOrigin
@AllArgsConstructor
public class StudentResourceCompletionController {

    private final StudentResourceCompletionService completionService;
    private final UserService userService;

    @PostMapping("/complete")
    public Map<String, Object> complete(@RequestParam String resourceType, @RequestParam Long resourceId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userService.getUserByEmail(email);
        StudentResourceCompletion completion = completionService.complete(user.getId(), resourceType, resourceId);

        return Map.of(
                "resourceType", completion.getResourceType(),
                "resourceId", completion.getResourceId(),
                "completedAt", completion.getCompletedAt()
        );
    }
}

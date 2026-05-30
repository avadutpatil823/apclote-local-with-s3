package in.ap.restController;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import in.ap.ai.analytics.DashboardService;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/dashboard")
@AllArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping({"/me", "/student/me"})
    public ResponseEntity<Map<String, Object>> getMyDashboard(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        return ResponseEntity.ok(dashboardService.getCurrentStudentDashboard(authorizationHeader));
    }

    @GetMapping("/admin/student")
    public ResponseEntity<Map<String, Object>> getStudentDashboardForAdmin(@RequestParam Long studentId) {
        return ResponseEntity.ok(dashboardService.getStudentDashboardForAdmin(studentId));
    }
}

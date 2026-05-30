package in.ap.shorts;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import in.ap.entity.User;
import in.ap.service.UserService;

@RestController
@RequestMapping("/api/videos")
@CrossOrigin
public class ShortVideoController {

    @Autowired
    private ShortVideoService service;
    @Autowired
    private UserService userService;

    private Long getUserId() {
    	 String email = SecurityContextHolder
                 .getContext()
                 .getAuthentication()
                 .getName();

         User user = userService.getUserByEmail(email);
         return user.getId();
    }

    @PostMapping("/upload")
    public ResponseEntity<ShortVideo> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "desc", defaultValue = "") String desc
    ) throws Exception {

        String baseUrl = ServletUriComponentsBuilder
                .fromCurrentContextPath()
                .build()
                .toUriString();

        ShortVideo saved = service.upload(getUserId(), file, desc, baseUrl);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/feed")
    public ResponseEntity<?> feed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(service.feed(page, size));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Boolean> like(@PathVariable Long id) {
        return ResponseEntity.ok(service.like(getUserId(), id));
    }

    @PostMapping("/{id}/comment")
    public ResponseEntity<Comment> comment(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        Comment saved = service.comment(getUserId(), id, body.get("text"));
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<Page<Comment>> comments(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(service.getComments(id, page, size));
    }
}

package in.ap.shorts;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ShortVideoService {

    @Autowired
    private ShortVideoRepository videoRepo;

    @Autowired
    private VideoLikeRepository likeRepo;

    @Autowired
    private CommentRepository commentRepo;

    @Autowired
    private NotificationRepository notificationRepo;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Transactional
    public ShortVideo upload(Long userId, MultipartFile file, String desc, String baseUrl) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Video file is required");
        }

        String contentType = file.getContentType();
        if (contentType != null && !contentType.startsWith("video/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only video files are allowed");
        }

        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);

        String originalName = Optional.ofNullable(file.getOriginalFilename()).orElse("video.mp4");
        originalName = originalName.replaceAll("[^a-zA-Z0-9._-]", "_");

        String fileName = UUID.randomUUID() + "_" + originalName;
        Path filePath = uploadPath.resolve(fileName).normalize();

        if (!filePath.startsWith(uploadPath)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file path");
        }

        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        ShortVideo video = new ShortVideo();
        video.setUserId(userId);
        video.setVideoUrl(baseUrl + "/uploads/" + fileName);
        video.setDescription(desc == null ? "" : desc.trim());

        return videoRepo.save(video);
    }

    public List<ShortVideo> feed(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 20);

        int latestSize = Math.max(1, (int) Math.ceil(safeSize * 0.7));
        latestSize = Math.min(latestSize, safeSize);

        List<ShortVideo> latest = videoRepo
                .findAllByOrderByCreatedAtDesc(PageRequest.of(safePage, latestSize))
                .getContent();

        Set<Long> latestIds = latest.stream()
                .map(ShortVideo::getId)
                .collect(Collectors.toSet());

        List<ShortVideo> random = getRandomVideos(safeSize - latest.size(), latestIds);

        List<ShortVideo> result = new ArrayList<>();
        result.addAll(latest);
        result.addAll(random);

        return result;
    }

    public Page<ShortVideo> myVideos(Long userId, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 20);

        return videoRepo.findByUserIdOrderByCreatedAtDesc(
                userId,
                PageRequest.of(safePage, safeSize)
        );
    }

    private List<ShortVideo> getRandomVideos(int limit, Set<Long> excludeIds) {
        if (limit <= 0) {
            return List.of();
        }

        List<ShortVideo> allVideos = new ArrayList<>(videoRepo.findAll());

        if (excludeIds != null && !excludeIds.isEmpty()) {
            allVideos.removeIf(video -> excludeIds.contains(video.getId()));
        }

        Collections.shuffle(allVideos);

        if (allVideos.size() <= limit) {
            return allVideos;
        }

        return new ArrayList<>(allVideos.subList(0, limit));
    }

    @Transactional
    public boolean like(Long userId, Long videoId) {
        ShortVideo video = videoRepo.findById(videoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Video not found"));

        int deletedRows = likeRepo.deleteByUserIdAndVideoId(userId, videoId);

        if (deletedRows > 0) {
            syncLikesCount(videoId);
            return false;
        }

        try {
            VideoLike like = new VideoLike();
            like.setUserId(userId);
            like.setVideoId(videoId);
            likeRepo.save(like);

            if (!video.getUserId().equals(userId)) {
                Notification n = new Notification();
                n.setUserId(video.getUserId());
                n.setTriggeredBy(userId);
                n.setVideoId(videoId);
                n.setType("LIKE");
                notificationRepo.save(n);
            }

            syncLikesCount(videoId);
            return true;
        } catch (DataIntegrityViolationException ex) {
            syncLikesCount(videoId);
            return true;
        }
    }

    private void syncLikesCount(Long videoId) {
        ShortVideo video = videoRepo.findById(videoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Video not found"));

        long count = likeRepo.countByVideoId(videoId);
        video.setLikesCount((int) count);
        videoRepo.save(video);
    }

    @Transactional
    public Comment comment(Long userId, Long videoId, String text) {
        String cleanText = text == null ? "" : text.trim();
        if (cleanText.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment text is required");
        }

        ShortVideo video = videoRepo.findById(videoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Video not found"));

        Comment comment = new Comment();
        comment.setUserId(userId);
        comment.setVideoId(videoId);
        comment.setText(cleanText);

        Comment saved = commentRepo.save(comment);

        if (!video.getUserId().equals(userId)) {
            Notification n = new Notification();
            n.setUserId(video.getUserId());
            n.setTriggeredBy(userId);
            n.setVideoId(videoId);
            n.setType("COMMENT");
            notificationRepo.save(n);
        }

        return saved;
    }

    public Page<Comment> getComments(Long videoId, int page, int size) {
        if (!videoRepo.existsById(videoId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Video not found");
        }

        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);

        return commentRepo.findByVideoIdOrderByCreatedAtDesc(
                videoId,
                PageRequest.of(safePage, safeSize)
        );
    }
}

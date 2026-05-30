package in.ap.ai.activity;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import in.ap.entity.ClassVideo;
import in.ap.repo.ClassVideoRepo;

@Service
public class VideoTrackingService {

    @Autowired
    private VideoTrackingRepository repo;

    @Autowired
    private ClassVideoRepo classVideoRepo;

    public String track(Long userId, Long videoId, Long currentTime, String action, Long durationSeconds) {
        LocalDateTime now = LocalDateTime.now();

        VideoTracking tracking = repo
                .findByUserIdAndVideoId(userId, videoId)
                .orElse(new VideoTracking());

        ClassVideo classVideo = persistDurationIfNeeded(videoId, durationSeconds);

        tracking.setUserId(userId);
        tracking.setVideoId(videoId);
        tracking.setCurrentTime(currentTime);
        tracking.setLastUpdated(now);

        Long resolvedDuration = resolveDuration(classVideo, durationSeconds);

        if (isCompletionAction(action, currentTime, resolvedDuration)) {
            tracking.setCompleted(true);
            tracking.setCompletedAt(now);
            if (resolvedDuration != null && resolvedDuration > 0) {
                tracking.setCurrentTime(resolvedDuration);
            }
            if (tracking.getFirstActionTime() == null) {
                tracking.setFirstActionTime(now);
            }
            repo.save(tracking);
            return "OK";
        }

        // Mark first contact with a video so dashboards can count it as started.
        if ("start".equals(action)) {
            if (tracking.getFirstActionTime() == null) {
                tracking.setFirstActionTime(now);
            }
            repo.save(tracking);
            return "OK";
        }

        if ("progress".equals(action)) {
            if (tracking.getFirstActionTime() == null) {
                tracking.setFirstActionTime(now);
            }
            repo.save(tracking);
            return "OK";
        }

        if ("end".equals(action) || "exit".equals(action)) {
            repo.save(tracking);
            return "OK";
        }

        if ("reset".equals(action)) {
            tracking.setPauseCount(0);
            tracking.setRewindCount(0);
            tracking.setFirstActionTime(now);
            repo.save(tracking);
            return "OK";
        }

        refreshWindowIfNeeded(tracking, now);

        if ("pause".equals(action)) {
            tracking.setPauseCount(tracking.getPauseCount() + 1);
        }

        if ("rewind".equals(action)) {
            tracking.setRewindCount(tracking.getRewindCount() + 1);
        }

        boolean stuck = isUserStuck(tracking, now);

        repo.save(tracking);

        if (stuck) {
            return "STUCK_DETECTED";
        }

        return "OK";
    }

    private ClassVideo persistDurationIfNeeded(Long videoId, Long durationSeconds) {
        if (videoId == null || durationSeconds == null || durationSeconds <= 0) {
            return videoId == null ? null : classVideoRepo.findById(videoId).orElse(null);
        }

        ClassVideo classVideo = classVideoRepo.findById(videoId).orElse(null);
        if (classVideo == null) {
            return null;
        }

        if (classVideo.getDurationSeconds() == null || classVideo.getDurationSeconds() < durationSeconds) {
            classVideo.setDurationSeconds(durationSeconds);
            return classVideoRepo.save(classVideo);
        }

        return classVideo;
    }

    private Long resolveDuration(ClassVideo classVideo, Long durationSeconds) {
        if (durationSeconds != null && durationSeconds > 0) {
            return durationSeconds;
        }

        return classVideo == null ? null : classVideo.getDurationSeconds();
    }

    private boolean isCompletionAction(String action, Long currentTime, Long durationSeconds) {
        if ("complete".equalsIgnoreCase(action) || "end".equalsIgnoreCase(action)) {
            return true;
        }

        if (durationSeconds == null || durationSeconds <= 0 || currentTime == null) {
            return false;
        }

        return currentTime >= durationSeconds || durationSeconds - currentTime <= 600;
    }

    private boolean isUserStuck(VideoTracking tracking, LocalDateTime now) {
        return (tracking.getPauseCount() >= 4 && tracking.getRewindCount() >= 2)
                || (tracking.getRewindCount() >= 5);
    }

    private void refreshWindowIfNeeded(VideoTracking tracking, LocalDateTime now) {
        if (tracking.getFirstActionTime() == null || tracking.getFirstActionTime().plusMinutes(10).isBefore(now)) {
            tracking.setPauseCount(0);
            tracking.setRewindCount(0);
            tracking.setFirstActionTime(now);
        }
    }
}

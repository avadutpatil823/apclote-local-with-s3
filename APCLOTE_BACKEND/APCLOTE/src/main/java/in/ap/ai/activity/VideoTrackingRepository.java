package in.ap.ai.activity;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VideoTrackingRepository extends JpaRepository<VideoTracking, Long> {
    Optional<VideoTracking> findByUserIdAndVideoId(Long userId, Long videoId);
    List<VideoTracking> findByUserId(Long userId);
}

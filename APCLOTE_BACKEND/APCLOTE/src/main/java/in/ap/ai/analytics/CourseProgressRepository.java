package in.ap.ai.analytics;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseProgressRepository extends JpaRepository<CourseProgress, Long> {

    List<CourseProgress> findByUserId(Long userId);

    List<CourseProgress> findByUserIdOrderByUpdatedAtDesc(Long userId);

    Optional<CourseProgress> findByUserIdAndBatchId(Long userId, Long batchId);
}

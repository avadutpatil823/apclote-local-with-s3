package in.ap.ai.activity;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentResourceCompletionRepository extends JpaRepository<StudentResourceCompletion, Long> {
    Optional<StudentResourceCompletion> findByUserIdAndResourceTypeAndResourceId(Long userId, String resourceType, Long resourceId);
    List<StudentResourceCompletion> findByUserId(Long userId);
}

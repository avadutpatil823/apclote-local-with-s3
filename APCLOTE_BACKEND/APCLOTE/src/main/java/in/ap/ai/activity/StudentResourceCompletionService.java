package in.ap.ai.activity;

import java.time.LocalDateTime;
import java.util.Locale;

import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class StudentResourceCompletionService {

    private final StudentResourceCompletionRepository repository;

    public StudentResourceCompletion complete(Long userId, String resourceType, Long resourceId) {
        String normalizedType = normalizeType(resourceType);
        StudentResourceCompletion completion = repository
                .findByUserIdAndResourceTypeAndResourceId(userId, normalizedType, resourceId)
                .orElse(new StudentResourceCompletion());

        completion.setUserId(userId);
        completion.setResourceType(normalizedType);
        completion.setResourceId(resourceId);
        completion.setCompletedAt(LocalDateTime.now());

        return repository.save(completion);
    }

    private String normalizeType(String resourceType) {
        return String.valueOf(resourceType == null ? "" : resourceType).trim().toUpperCase(Locale.ROOT);
    }
}

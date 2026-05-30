package in.ap.ai.chat;


import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // ✅ user + topic based history
    List<ChatMessage> findByUserIdAndTopicOrderByCreatedAtAsc(String userId, String topic);

    // ✅ latest messages
    List<ChatMessage> findTop20ByUserIdAndTopicOrderByCreatedAtDesc(String userId, String topic);

    // ✅ sidebar topics per user
    @Query("""
        SELECT cm.topic
        FROM ChatMessage cm
        WHERE cm.userId = :userId
        AND cm.createdAt = (
            SELECT MAX(c2.createdAt)
            FROM ChatMessage c2
            WHERE c2.topic = cm.topic AND c2.userId = :userId
        )
        ORDER BY cm.createdAt DESC
    """)
    List<String> findDistinctTopicsByUser(String userId);

    // ✅ delete per user
    void deleteByUserIdAndTopic(String userId, String topic);
}
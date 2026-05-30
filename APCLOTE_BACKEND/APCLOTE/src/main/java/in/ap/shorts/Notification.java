package in.ap.shorts;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Notification {

	 @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long triggeredBy;
    private Long videoId;

    private String type; // LIKE / COMMENT
    private boolean isRead = false;

    private LocalDateTime createdAt = LocalDateTime.now();
}

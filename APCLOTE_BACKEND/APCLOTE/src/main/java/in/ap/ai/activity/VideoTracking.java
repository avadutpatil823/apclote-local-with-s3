package in.ap.ai.activity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class VideoTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long videoId;

    @Column(name = "current_sec")
    private Long currentTime;
    private int pauseCount;
    private int rewindCount;
    private Boolean completed = false;
    
    private LocalDateTime firstActionTime;

    private LocalDateTime lastUpdated;
    private LocalDateTime completedAt;
}

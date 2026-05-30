package in.ap.ai.analytics;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(
        name = "course_progress",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "batch_id"})
)
public class CourseProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long studentId;
    private Long batchId;
    private String batchName;
    private Long courseId;
    private String courseName;
    private Double courseFee;
    private Long purchaseOrderId;
    private String orderStatus;
    private LocalDate validUntil;
    private LocalDate batchStartDate;

    private int totalClassRooms;
    private int totalClasses;
    private int totalVideos;
    @Column(name = "completed_videos")
    private int completedVideos;
    private int videosStarted;
    private int totalNotes;
    private int totalTests;
    private int testsAttempted;

    private double averageTestScore;
    private long totalWatchSeconds;
    private double progressPercentage;

    @Column(length = 80)
    private String status;

    private LocalDateTime purchaseDate;
    private LocalDateTime lastActivityAt;
    private LocalDateTime nextClassDate;
    private LocalDateTime updatedAt;
}

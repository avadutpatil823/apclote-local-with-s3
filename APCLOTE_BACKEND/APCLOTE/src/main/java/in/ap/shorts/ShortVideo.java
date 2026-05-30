package in.ap.shorts;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class ShortVideo {

    @Id @GeneratedValue
    private Long id;

    private Long userId;
    private String videoUrl;
    private String description;

    private int likesCount = 0;
    private int viewsCount = 0;

    private LocalDateTime createdAt = LocalDateTime.now();
}

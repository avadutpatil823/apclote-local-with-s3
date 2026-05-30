package in.ap.shorts;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"userId","videoId"}))
@Setter
@Getter
public class VideoLike {

    @Id @GeneratedValue
    private Long id;

    private Long userId;
    private Long videoId;
}
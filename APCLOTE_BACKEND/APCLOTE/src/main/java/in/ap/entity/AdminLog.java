package in.ap.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@NoArgsConstructor
@Getter
@Setter
public class AdminLog {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private Long actorId;
	private String actorName;
	private String actorEmail;
	private String actorRole;
	private String action;
	private String resourceType;
	private String resourceName;
	@Column(length = 1200)
	private String details;
	@CreationTimestamp
	@Column(updatable = false)
	private LocalDateTime createdAt;
}

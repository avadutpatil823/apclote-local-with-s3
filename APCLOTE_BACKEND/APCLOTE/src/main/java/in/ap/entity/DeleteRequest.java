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
public class DeleteRequest {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private String resourceType;
	private Long resourceId;
	private String resourceName;
	@Column(length = 4000)
	private String reason;
	@Column(length = 2000)
	private String resourceLink;
	private String status = "PENDING";
	private Long lecturerId;
	private String lecturerName;
	private String lecturerEmail;
	private Long assignedAdminId;
	private String assignedAdminEmail;
	@CreationTimestamp
	private LocalDateTime createdAt;
	private LocalDateTime completedAt;
	private String completedByEmail;
}

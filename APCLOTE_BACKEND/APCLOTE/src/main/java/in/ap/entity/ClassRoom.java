package in.ap.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@NoArgsConstructor
@Getter
@Setter
public class ClassRoom {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private String name;
	private LocalDateTime createdAt;
	private String createdByName;
	@ManyToOne
	@JoinColumn(name = "batch_id")
	@JsonIgnore
	private Batch batch;
	@ManyToOne
	@JoinColumn(name = "subject_id")
	private SubjectList subject;
	@OneToMany(mappedBy = "classRoom")
	@JsonManagedReference
	private List<Class> classes=new ArrayList<>();



}

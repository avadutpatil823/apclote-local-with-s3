package in.ap.entity;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapKeyColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
@Entity
@NoArgsConstructor
@Getter
@Setter
@ToString
public class Lecturer {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@OneToOne
	private User user;
	
	@OneToMany(mappedBy = "lecturer", cascade = CascadeType.ALL)
	@JsonIgnore
    private List<LecturerBatchSubject> lecturerBatchSubjects = new ArrayList<>();
	private Double salary;
	private LocalDate dateOfJoining;
	

	@JoinTable(
		    name = "batch_lecturers",
		    joinColumns = @JoinColumn(name = "lecturer_id"),
		    inverseJoinColumns = @JoinColumn(name = "batch_id")
		)
	@JsonIgnore
	@ManyToMany
	private List<Batch> batches = new ArrayList<>();

}

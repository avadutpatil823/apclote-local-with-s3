package in.ap.entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
public class LecturerBatchSubject {

	    @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long id;

	    @ManyToOne
	    @JoinColumn(name = "lecturer_id")
	    @JsonBackReference
	    private Lecturer lecturer;

	    @ManyToOne
	    @JoinColumn(name = "batch_id")
	    @JsonIgnore
	    private Batch batch;

	    @ManyToOne
	    @JoinColumn(name = "subject_id")
	    private SubjectList subject;

	    private Boolean accessActive = true;

	    private LocalDateTime accessRemovedAt;
}

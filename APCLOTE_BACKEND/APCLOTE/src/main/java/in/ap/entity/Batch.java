package in.ap.entity;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
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
public class Batch {

	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private String name;
	@ManyToMany(mappedBy = "batches")
	private List<Lecturer> lecturers;
	 @ManyToOne
	    @JoinColumn(name = "course_id")
	    private Course course;
	@OneToMany(mappedBy = "batch")
	private List<ClassRoom> classRooms=new ArrayList<>();
	private LocalDate startDate;
	private LocalTime start_time;
	private LocalTime end_time;
	
	 @OneToMany(mappedBy = "batch", cascade = CascadeType.ALL)
	 private List<LecturerBatchSubject> lecturerBatchSubjects = new ArrayList<>();
	 
	
	
	 @Override
	    public boolean equals(Object o) {
	        if (this == o) return true;
	        if (o == null || getClass() != o.getClass()) return false;
	        Batch batch = (Batch) o;
	        return Objects.equals(id, batch.id);
	    }

	    @Override
	    public int hashCode() {
	        return Objects.hash(id);
	    }
	
	
}

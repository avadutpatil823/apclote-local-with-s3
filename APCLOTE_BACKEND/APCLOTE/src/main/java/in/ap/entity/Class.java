package in.ap.entity;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;

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
import lombok.ToString;

@Entity
@NoArgsConstructor
@Getter
@Setter
@ToString
public class Class {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private String zoomlink;
	private String className;
	@ManyToOne
	@JoinColumn(name = "classRoom_id")
	@JsonBackReference
	private ClassRoom classRoom;
	@ManyToOne
	@JoinColumn(name = "lecturer_id")
	private Lecturer lecturer;
	private LocalDate date;
	private LocalTime starttime;
	private LocalTime EndTime;
	@OneToMany(mappedBy = "classs")
	private List<ClassVideo> videos=new ArrayList<>();
	@OneToMany(mappedBy = "classs")
	private List<ClassNotesFile> notes=new ArrayList<>();;
	@OneToMany(mappedBy = "classs")
	private List<Test> tests=new ArrayList<>();;
}

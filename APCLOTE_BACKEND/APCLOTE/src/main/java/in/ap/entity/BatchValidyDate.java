package in.ap.entity;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
public class BatchValidyDate {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id; 
	
   
	private String  batchName;
	
	private LocalDate validityDate;
	@ManyToOne
	@JsonIgnore
	private Student student;
	
	
	
}

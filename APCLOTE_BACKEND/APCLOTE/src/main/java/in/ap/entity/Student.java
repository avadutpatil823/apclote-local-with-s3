package in.ap.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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
public class Student {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@OneToOne
	@JoinColumn(name = "user_id")
	private User user;
	@ManyToMany
	private List<Batch> batchs=new ArrayList<>();
	@OneToMany(mappedBy = "student")
	private List<PurchaseOrder> purchaseOrder=new ArrayList<>();
	
	@OneToMany(mappedBy = "student")
	private List<BatchValidyDate> batchValidyDate=new ArrayList<>();
	
	private double uniqueKey;

	private Boolean active = true;

	private Boolean deleted = false;

	private LocalDateTime deactivatedAt;

	private LocalDateTime deletedAt;
	
}

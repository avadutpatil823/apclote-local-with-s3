package in.ap.repo;

import java.time.LocalDate;
import java.util.List;

import org.hibernate.query.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import in.ap.entity.Batch;
import in.ap.entity.Lecturer;
import in.ap.entity.User;

@Repository
public interface LecturerRepo extends JpaRepository<Lecturer, Long> {

	
	public Lecturer findByUser(User user);
	public List<Lecturer> findBySalary(Double salary);
	public List<Lecturer> findByDateOfJoining(LocalDate date);
	org.springframework.data.domain.Page<Lecturer> findByUser_NameContainingIgnoreCase(String userName, Pageable pageable);
	
	
	 @Query("""
	           SELECT lbs.lecturer 
	           FROM LecturerBatchSubject lbs 
	           WHERE lbs.batch.id = :batchId
	           """)
	    List<Lecturer> findByBatchId(@Param("batchId") Long batchId);

	@Query("""
			SELECT DISTINCT l
			FROM Lecturer l
			JOIN l.batches b
			WHERE b.id = :batchId
			""")
	List<Lecturer> findWithBatch(@Param("batchId") Long batchId);

	

    

    @Query("""
            SELECT lbs.lecturer 
            FROM LecturerBatchSubject lbs
            WHERE lbs.batch.id = :batchId 
              AND lbs.subject.id = :subjectId
            """)
     List<Lecturer> findByBatchIdAndSubjectId(@Param("batchId") Long batchId,
                                              @Param("subjectId") Long subjectId);
}

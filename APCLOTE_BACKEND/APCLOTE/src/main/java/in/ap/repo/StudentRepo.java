package in.ap.repo;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import in.ap.entity.Batch;
import in.ap.entity.Lecturer;
import in.ap.entity.PurchaseOrder;
import in.ap.entity.Student;
import in.ap.entity.User;

@Repository
public interface StudentRepo extends JpaRepository<Student, Long> {

	Student findByUser(User user);
	@Query("SELECT s FROM Student s WHERE s.user.email = :email")
	Student findByUserEmail(@Param("email") String email);
	List<Student> findByBatchs(List<Batch> batchs);
	Student findByPurchaseOrder(PurchaseOrder porder);
	Page<Student> findByUser_NameContainingIgnoreCase(String userName, Pageable pageable);
	@Query("SELECT s FROM Student s WHERE s.deleted IS NULL OR s.deleted = false")
	Page<Student> findVisibleStudents(Pageable pageable);

	@Query("SELECT s FROM Student s WHERE (s.deleted IS NULL OR s.deleted = false) AND LOWER(s.user.name) LIKE LOWER(CONCAT('%', :userName, '%'))")
	Page<Student> findVisibleStudentsByName(@Param("userName") String userName, Pageable pageable);

	@Query("SELECT s FROM Student s JOIN s.batchs b WHERE b.id = :batchId AND (s.deleted IS NULL OR s.deleted = false)")
	Page<Student> findActiveRecordsByBatchId(@Param("batchId") Long batchId, Pageable pageable);

	@Query("SELECT DISTINCT s FROM Student s JOIN s.batchs b WHERE b.id = :batchId")
	List<Student> findByBatchId(@Param("batchId") Long batchId);
	
}

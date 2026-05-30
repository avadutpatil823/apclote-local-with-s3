package in.ap.repo;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.NativeQuery;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import in.ap.entity.Batch;
import in.ap.entity.Lecturer;

@Repository
public interface BatchRepo extends JpaRepository<Batch, Long> {
	
	Batch findByName(String name);

	@NativeQuery("select * from Batch b where b.startDate=:date")
	public List<Batch> FindByStartDate(@Param("date") LocalDate date);
	
	@Query(value = "SELECT * FROM batch b " +
            "JOIN batch_lecturers bl ON b.id = bl.batch_id " +
            "WHERE bl.lecturer_id = :lecturerId", nativeQuery = true)
    public List<Batch> findBatchesByLecturer(@Param("lecturerId") Long lecturerId);
	
	@Query(value = "SELECT DISTINCT b.* FROM batch b " +
            "JOIN batch_lecturers bl ON b.id = bl.batch_id " +
            "WHERE bl.lecturers_id IN (:lecturerIds)", nativeQuery = true)
    public List<Batch> findBatchesByLecturers(@Param("lecturerIds") List<Long> lecturerIds);

	public List<Batch> findByNameContainingIgnoreCase(String keyword);

}

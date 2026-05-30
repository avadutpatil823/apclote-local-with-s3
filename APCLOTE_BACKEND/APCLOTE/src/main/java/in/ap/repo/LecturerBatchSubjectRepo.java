package in.ap.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import in.ap.entity.BatchLecturerSubjectInter;
import in.ap.entity.Lecturer;
import in.ap.entity.LecturerBatchSubject;
@Repository
public interface LecturerBatchSubjectRepo extends JpaRepository<LecturerBatchSubject, Long> {

	 @Query("SELECT lbs.lecturer FROM LecturerBatchSubject lbs WHERE lbs.subject.id = :subjectId AND (lbs.accessActive IS NULL OR lbs.accessActive = true)")
	    List<Lecturer> findLecturersBySubjectId(@Param("subjectId") Long subjectId);

	    // Find all lecturers by subject name
	    @Query("SELECT lbs.lecturer FROM LecturerBatchSubject lbs WHERE lbs.subject.name = :subjectName AND (lbs.accessActive IS NULL OR lbs.accessActive = true)")
	    List<Lecturer> findLecturersBySubjectName(@Param("subjectName") String subjectName);

	    // Optional: by batch + subject
	    @Query("SELECT lbs.lecturer FROM LecturerBatchSubject lbs " +
	           "WHERE lbs.batch.id = :batchId AND lbs.subject.id = :subjectId AND (lbs.accessActive IS NULL OR lbs.accessActive = true)")
	    List<Lecturer> findLecturersByBatchAndSubject(@Param("batchId") Long batchId,
	                                                  @Param("subjectId") Long subjectId);
	    
	    @Query("SELECT COUNT(lbs) > 0 FROM LecturerBatchSubject lbs WHERE lbs.batch.id = :batchId AND lbs.subject.id = :subjectId AND lbs.lecturer.id = :lecturerId AND (lbs.accessActive IS NULL OR lbs.accessActive = true)")
	    boolean existsByBatchIdAndSubjectIdAndLecturerId(@Param("batchId") Long batchId, @Param("subjectId") Long subjectId, @Param("lecturerId") Long lecturerId);

	    @Query("SELECT lbs FROM LecturerBatchSubject lbs WHERE lbs.batch.id = :batchId AND lbs.subject.id = :subjectId AND (lbs.accessActive IS NULL OR lbs.accessActive = true)")
	    List<LecturerBatchSubject> findActiveByBatchIdAndSubjectId(@Param("batchId") Long batchId, @Param("subjectId") Long subjectId);

	    List<LecturerBatchSubject> findByLecturerId(Long lecturerId);

	    @Query("SELECT lbs FROM LecturerBatchSubject lbs WHERE lbs.lecturer.id = :lecturerId AND lbs.batch.id = :batchId AND (lbs.accessActive IS NULL OR lbs.accessActive = true)")
	    List<LecturerBatchSubject> findActiveByLecturerIdAndBatchId(@Param("lecturerId") Long lecturerId, @Param("batchId") Long batchId);

      List<LecturerBatchSubject> findByLecturer(Lecturer lecturer);
      List<LecturerBatchSubject> findByBatch(in.ap.entity.Batch batch);
      List<LecturerBatchSubject> findBySubject(in.ap.entity.SubjectList subject);
      
      @Query("SELECT l.batch.id AS batchId, l.subject AS subject " +
    	       "FROM LecturerBatchSubject l " +
    	       "WHERE l.lecturer.id = :lecturerId AND (l.accessActive IS NULL OR l.accessActive = true)")
    	List<BatchLecturerSubjectInter> findSubjectAssignmentsByLecturerId(@Param("lecturerId") Long lecturerId);
}

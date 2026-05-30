package in.ap.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import in.ap.entity.Course;
@Repository
public interface CourseRepo extends JpaRepository<Course, Long> {

	public Course findByName(String name);
	public List<Course> findByDuration(int Duration);
	public List<Course> findByFee(Double fee);
}

package in.ap.repo;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import in.ap.entity.ClassRoom;
import in.ap.entity.Lecturer;

@Repository
public interface ClassRepo extends JpaRepository<in.ap.entity.Class, Long> {

	
	in.ap.entity.Class findByZoomlink(String zoomLink);
	in.ap.entity.Class findByClassName(String clsname);
	public List<in.ap.entity.Class> findByClassRoom(ClassRoom classroom);
	public List<in.ap.entity.Class> findByLecturer(Lecturer lecturer);
	public List<in.ap.entity.Class> findByDate(LocalDate date);
}

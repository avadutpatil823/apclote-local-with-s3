package in.ap.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import in.ap.entity.Subject;
@Repository
public interface SubjectRepo extends JpaRepository<Subject, Long> {

	Subject findByName(String name);
	List<Subject> findAllByName(String name);
}

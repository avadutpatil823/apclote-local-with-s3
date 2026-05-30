package in.ap.repo;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import in.ap.entity.Class;
import in.ap.entity.Test;
@Repository
public interface TestRepo extends JpaRepository<Test, Long> {

	List<Test> findByClasss(Class classs);
	List<Test> findByDate(LocalDate date);
	List<Test> findAll();
}

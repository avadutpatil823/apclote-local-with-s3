package in.ap.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import in.ap.entity.SubjectList;
@Repository
public interface SubjectListRepo extends JpaRepository<SubjectList, Long> {

	public SubjectList findByName(String name);
}

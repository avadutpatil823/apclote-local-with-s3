package in.ap.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import in.ap.entity.Batch;
import in.ap.entity.ClassRoom;
import in.ap.entity.SubjectList;

@Repository
public interface ClassRoomRepo extends JpaRepository<ClassRoom, Long> {

	ClassRoom findByName(String name);
	List<ClassRoom> findByBatch(Batch batch);
	List<ClassRoom> findBySubject(SubjectList subject);
}

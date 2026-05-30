package in.ap.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import in.ap.entity.ClassVideo;

@Repository
public interface ClassVideoRepo extends JpaRepository<ClassVideo, Long> {

	ClassVideo findBytitle(String title);
	ClassVideo findByFilePath(String FilePath);
	public List<ClassVideo> findByClasss(in.ap.entity.Class classs);
}

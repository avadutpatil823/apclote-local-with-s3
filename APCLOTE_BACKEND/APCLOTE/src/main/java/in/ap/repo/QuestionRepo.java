package in.ap.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import in.ap.entity.Question;
import in.ap.entity.Test;

@Repository
public interface QuestionRepo extends JpaRepository<Question, Long> {

	void deleteByTest(Test test);
}

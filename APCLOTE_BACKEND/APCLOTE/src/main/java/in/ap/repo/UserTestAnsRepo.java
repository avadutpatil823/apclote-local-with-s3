package in.ap.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import in.ap.entity.Test;
import in.ap.entity.User;
import in.ap.entity.UserTestAnswer;

@Repository
public interface UserTestAnsRepo extends JpaRepository<UserTestAnswer, Long> {

	public Optional<UserTestAnswer> findByUserAndTest(User user, Test test);
	
	public List<UserTestAnswer> findByUser(User user);

	void deleteByTest(Test test);
	
}

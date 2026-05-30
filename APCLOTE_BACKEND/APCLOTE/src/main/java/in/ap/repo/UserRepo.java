package in.ap.repo;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import in.ap.entity.User;
@Repository
public interface UserRepo extends JpaRepository<User, Long> {

	User findById(long id);
	User findByEmail(String email);
	List<User> findByRole(String role);
	List<User> findByRoleAndSubAdmin(String role, Boolean subAdmin);
	List<User> findByRoleAndSubAdminAndAdminAction(String role, Boolean subAdmin, String adminAction);
	@Query("SELECT u FROM User u WHERE u.deleted IS NULL OR u.deleted = false")
	Page<User> findVisibleUsers(Pageable pageable);
	
}


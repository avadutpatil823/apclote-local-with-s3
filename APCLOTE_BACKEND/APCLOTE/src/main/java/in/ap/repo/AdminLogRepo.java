package in.ap.repo;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import in.ap.entity.AdminLog;

@Repository
public interface AdminLogRepo extends JpaRepository<AdminLog, Long> {
	Page<AdminLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
}

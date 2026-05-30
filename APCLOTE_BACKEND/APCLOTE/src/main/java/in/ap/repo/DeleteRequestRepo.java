package in.ap.repo;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import in.ap.entity.DeleteRequest;

@Repository
public interface DeleteRequestRepo extends JpaRepository<DeleteRequest, Long> {

	Page<DeleteRequest> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);
	Page<DeleteRequest> findAllByOrderByCreatedAtDesc(Pageable pageable);
}

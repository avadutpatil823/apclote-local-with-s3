package in.ap.shorts;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    java.util.List<Comment> findByVideoIdOrderByCreatedAtDesc(Long id);

	Object findByVideoIdOrderByIdDesc(Long id, PageRequest of);
	Page<Comment> findByVideoIdOrderByCreatedAtDesc(Long videoId, Pageable pageable);
}

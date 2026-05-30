package in.ap.shorts;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShortVideoRepository extends JpaRepository<ShortVideo, Long> {

    Page<ShortVideo> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<ShortVideo> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
}

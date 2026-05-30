package in.ap.shorts;

import org.springframework.data.jpa.repository.JpaRepository;


import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VideoLikeRepository extends JpaRepository<VideoLike, Long> {

    Optional<VideoLike> findByUserIdAndVideoId(Long userId, Long videoId);

    long countByVideoId(Long videoId);

    @Modifying
    @Query("delete from VideoLike v where v.userId = :userId and v.videoId = :videoId")
    int deleteByUserIdAndVideoId(@Param("userId") Long userId, @Param("videoId") Long videoId);
}


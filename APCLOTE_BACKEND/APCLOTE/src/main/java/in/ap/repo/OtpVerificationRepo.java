package in.ap.repo;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import in.ap.entity.OtpVerification;

@Repository
public interface OtpVerificationRepo extends JpaRepository<OtpVerification, Long> {
    Optional<OtpVerification> findByEmail(String email);
}


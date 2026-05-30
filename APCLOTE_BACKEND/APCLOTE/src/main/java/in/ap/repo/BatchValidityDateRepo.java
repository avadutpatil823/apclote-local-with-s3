package in.ap.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import in.ap.entity.BatchValidyDate;
@Repository
public interface BatchValidityDateRepo extends JpaRepository<BatchValidyDate, Long>{

	
}

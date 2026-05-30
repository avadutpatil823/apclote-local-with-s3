package in.ap.repo;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import in.ap.entity.Batch;
import in.ap.entity.PurchaseOrder;
import in.ap.entity.User;
import jakarta.transaction.Transactional;

@Repository
public interface PurchaseOrderRepo extends JpaRepository<PurchaseOrder, Long> {

	
	public List<PurchaseOrder> findByUser(User user);
	public List<PurchaseOrder> findByBatch(Batch batch);
	public List<PurchaseOrder> findByStatus(String status);
	public List<PurchaseOrder> findByPurchaseDate(LocalDate date);
	
	    @Modifying
	    @Transactional
	    @Query(value = "ALTER TABLE purchase_order DROP INDEX UK1lvg6ax0rvgmxdnbnniidup5s", nativeQuery = true)
	    void dropOldUniqueIndex();

	    @Modifying
	    @Transactional
	    @Query(value = "ALTER TABLE purchase_order ADD CONSTRAINT UK_user_batch_student UNIQUE (user_id, batch_id, student_id)", nativeQuery = true)
	    void addCompositeUniqueKey();
}

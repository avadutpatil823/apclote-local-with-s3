package in.ap.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import in.ap.entity.Payment;
import in.ap.entity.PurchaseOrder;

@Repository
public interface PaymentRepo extends JpaRepository<Payment, Long> {

	Payment findByPurchaseOrder(PurchaseOrder po);
	Payment findByPaymentId(String paymentId);
	Payment findByReciptId(String reciptId);
	Payment findByStatus(String Status);
	Payment findByEmail(String email);
}

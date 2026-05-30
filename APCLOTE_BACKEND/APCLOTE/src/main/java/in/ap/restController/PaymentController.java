
package in.ap.restController;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;

import in.ap.entity.Payment;
import in.ap.entity.PurchaseOrder;
import in.ap.helper.RazorpaySignatureVerifier;
import in.ap.repo.PurchaseOrderRepo;
import in.ap.service.UserService;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@AllArgsConstructor
@NoArgsConstructor
public class PaymentController {
    private static final Logger monitorLog = LoggerFactory.getLogger("APCLOTE_MONITOR");

@Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Autowired
    private UserService userService; // assume you have this bean
    @Autowired
    private PurchaseOrderRepo orderRepo;

    

    // Keep your existing createOrder style but return order info (GET used as you had it)
    @GetMapping("/createOrder")
    public ResponseEntity<?> createOrder(@RequestParam("poId") Long poId) throws Exception {
        // create PurchaseOrder (existing method)
       // PurchaseOrder po = userService.createOrder(batchId);
    	
    	PurchaseOrder po = orderRepo.findById(poId).get();

        // create razorpay order
        RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
        JSONObject orderRequest = new JSONObject();
        // amount must be in paise (integer)
        int amountPaise = (int) Math.round(po.getFee() * 100); // e.g., 500.0 -> 50000
        orderRequest.put("amount", amountPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "rcpt_" + po.getId() + "_" + System.currentTimeMillis());
        orderRequest.put("payment_capture", 1);

        Order order = client.orders.create(orderRequest);
        monitorLog.info("event=razorpay_order_created purchaseOrderId={} razorpayOrderId={} amount={} currency=INR", po.getId(), order.get("id"), po.getFee());

        // Save razorpay order id in purchase order for later reference
        po.setRazorpayOrderId(order.get("id"));
        // persist the update
        userService.savePurchaseOrder(po);

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", order.get("id"));          // razorpay order id
        response.put("amount", po.getFee());
        response.put("currency", "INR");
        response.put("key", razorpayKeyId);                // public key for checkout
        response.put("purchaseOrderId", po.getId());      // internal purchase order id
        return ResponseEntity.status(201).body(response);
    }

    // Verify signature coming from frontend and update DB
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> payload) throws Exception {
        // payload expected: razorpay_payment_id, razorpay_order_id, razorpay_signature, purchaseOrderId
        String razorpayPaymentId = payload.get("razorpay_payment_id");
        String razorpayOrderId = payload.get("razorpay_order_id");
        String razorpaySignature = payload.get("razorpay_signature");
        Long purchaseOrderId = Long.parseLong(payload.get("purchaseOrderId"));

        String generated = RazorpaySignatureVerifier.generateSignature(razorpayOrderId, razorpayPaymentId, razorpayKeySecret);
        if (!generated.equals(razorpaySignature)) {
            // mark as FAILED in DB
            userService.markPaymentFailed(purchaseOrderId, razorpayOrderId, razorpayPaymentId, razorpaySignature);
            monitorLog.warn("event=payment_verify_failed purchaseOrderId={} razorpayOrderId={} razorpayPaymentId={} reason=invalid_signature", purchaseOrderId, razorpayOrderId, razorpayPaymentId);
            return ResponseEntity.status(400).body(Map.of("status", "failure", "message", "Invalid signature"));
        }

        // mark as COMPLETED in DB, save payment record
        Payment savedPayment = userService.markPaymentCompleted(purchaseOrderId, razorpayOrderId, razorpayPaymentId, razorpaySignature);
        monitorLog.info("event=payment_completed purchaseOrderId={} paymentId={} razorpayOrderId={} razorpayPaymentId={}", purchaseOrderId, savedPayment.getId(), razorpayOrderId, razorpayPaymentId);
        return ResponseEntity.ok(Map.of("status", "success", "payment", savedPayment));
    }
}



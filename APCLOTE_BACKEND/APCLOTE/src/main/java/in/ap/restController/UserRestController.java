package in.ap.restController;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import in.ap.entity.Batch;
import in.ap.entity.Payment;
import in.ap.entity.PurchaseOrder;
import in.ap.entity.Test;
import in.ap.entity.User;
import in.ap.entity.UserTestAnswer;
import in.ap.helper.UserException;
import in.ap.repo.TestRepo;
import in.ap.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@RestController
@AllArgsConstructor
@Getter
@Setter
@RequestMapping("/api")
public class UserRestController {
	private static final Logger monitorLog = LoggerFactory.getLogger("APCLOTE_MONITOR");
	private UserService userService;
	
	@PostMapping("/updateUser")
	public ResponseEntity<User> updateUserDetails(@RequestBody User user){
		
		User updateUser = userService.updateUser(user);
		monitorLog.info("event=user_profile_update userId={} name=\"{}\" email={}", updateUser.getId(), updateUser.getName(), updateUser.getEmail());
		return new ResponseEntity<User>(updateUser, HttpStatus.ACCEPTED);	
	}
	@GetMapping("/getAllBatchs")
	public ResponseEntity<Page<Batch>> getAllBatchs(
			@RequestParam int pageNumber,
			@RequestParam int pageSize,
			@RequestParam(required = false) String key){
		int safePage = Math.max(pageNumber - 1, 0);
		if (key != null && !key.trim().isEmpty()) {
			List<Batch> searched = userService.search(key);
			int start = Math.min(safePage * pageSize, searched.size());
			int end = Math.min(start + pageSize, searched.size());
			Page<Batch> page = new PageImpl<>(searched.subList(start, end), PageRequest.of(safePage, pageSize), searched.size());
			return new ResponseEntity<Page<Batch>>(page, HttpStatus.ACCEPTED);
		}
		Page<Batch> batches = userService.getAllBatches(safePage,pageSize);
		return new ResponseEntity<Page<Batch>>(batches, HttpStatus.ACCEPTED);
	}
	
	@GetMapping("/getMyBatchs")
	public ResponseEntity<List<Batch>> getMyBatchs(){
		List<Batch> batches = userService.getMyCourses();
		return new ResponseEntity<List<Batch>>(batches, HttpStatus.ACCEPTED);
	}
	
	@GetMapping("/getUser")
	public ResponseEntity<User> getUser(){
		String email = SecurityContextHolder.getContext().getAuthentication().getName();
		User user = userService.getUserByEmail(email);
		return new ResponseEntity<User>(user, HttpStatus.ACCEPTED);
	}
	@GetMapping("/createOrder")
	public ResponseEntity<PurchaseOrder> createOrder(@RequestParam("batchId") Long batchId){
		PurchaseOrder purchaseOrder = userService.createOrder(batchId);
		String email = SecurityContextHolder.getContext().getAuthentication().getName();
		monitorLog.info("event=purchase_order_created actorEmail={} purchaseOrderId={} batchId={} amount={}", email, purchaseOrder.getId(), batchId, purchaseOrder.getFee());
		return new ResponseEntity<PurchaseOrder>(purchaseOrder, HttpStatus.CREATED);
	}
	@GetMapping("/doPayment")
	public ResponseEntity<Payment> dopayment(@RequestParam("poId")Long poId,@RequestParam("upiId")String upiId)  {
		Payment payment = userService.doPayment(poId, upiId);
		String email = SecurityContextHolder.getContext().getAuthentication().getName();
		monitorLog.info("event=manual_payment_created actorEmail={} purchaseOrderId={} paymentId={} upiId={}", email, poId, payment.getId(), upiId);
//		Batch batch = new Batch();
//		payment.getPurchaseOrder().setBatch(batch);
	    return new ResponseEntity<Payment>(payment, HttpStatus.ACCEPTED);

	}
	@GetMapping("/getClassTests")
	public ResponseEntity<List<Test>> getClassTests(@RequestParam("classId")Long classId){
		List<Test> tests = userService.getTests(classId);
		return new ResponseEntity<List<Test>>(tests, HttpStatus.FOUND);
	}
	
	@GetMapping("/getUserTestAns")
	public ResponseEntity<List<UserTestAnswer>> getAllUserTestAns(){
		List<UserTestAnswer> alluserTestAns = userService.getAlluserTestAns();
		return new ResponseEntity<List<UserTestAnswer>>(alluserTestAns, HttpStatus.ACCEPTED);
	}
	
	
	@GetMapping("/submitTest")
	public ResponseEntity<UserTestAnswer> submitTest(@RequestParam("testId")Long testId,@RequestParam("userAnswers")List<String> userAnswers){
		
		UserTestAnswer submitedTest = userService.submitTest(testId, userAnswers);
		String email = SecurityContextHolder.getContext().getAuthentication().getName();
		monitorLog.info("event=test_submitted actorEmail={} testId={} answerId={}", email, testId, submitedTest.getId());
		return new ResponseEntity<UserTestAnswer>(submitedTest, HttpStatus.ACCEPTED);
	}
	@GetMapping("/search")
	public ResponseEntity<List<Batch>> search(@RequestParam("key") String key){
		
		List<Batch> batchs = userService.search(key);
		return new ResponseEntity<List<Batch>>(batchs, HttpStatus.ACCEPTED);
	}
	
	public ResponseEntity<PurchaseOrder> getAllPOs(){
		return null;
	}
  @GetMapping("/myPos")
  public ResponseEntity<List<PurchaseOrder>> getMyPOs(){
	  
	  List<PurchaseOrder> myPOS = userService.getMyPOS();
	  List<PurchaseOrder> update=new ArrayList<>();
	  for (PurchaseOrder po : myPOS) {
		       String batchName = po.getBatch().getName();
		        Batch batch = new Batch();
		        batch.setName(batchName);
		        po.setBatch(batch);
		        update.add(po);
	}
	return new ResponseEntity<List<PurchaseOrder>>(update, HttpStatus.ACCEPTED);
	}
  
  @GetMapping("/stream")
  public ResponseEntity<Resource> streamVideo(
          @RequestParam String filePath,
          @RequestHeader(value = "Range", required = false) String rangeHeader) throws IOException {
	  
	  String normalizedPath = filePath.replace("\\", "/");
      return userService.streamVideo(normalizedPath, rangeHeader);
  }

  @GetMapping("/videos/signed-playlist")
  public ResponseEntity<String> getSignedVideoPlaylist(
          @RequestParam Long videoId,
          @RequestParam(required = false) String playlistKey) {
      return userService.getSignedVideoPlaylist(videoId, playlistKey);
  }
  
  @GetMapping("/view")
  public ResponseEntity<Resource> viewDocument(@RequestParam String filePath) throws IOException {
	  String normalizedPath = filePath.replace("\\", "/");
      return userService.viewDocument(normalizedPath);
  }

  @GetMapping("/download")
  public ResponseEntity<Resource> downloadDocument(@RequestParam String filePath) throws IOException {
	  String normalizedPath = filePath.replace("\\", "/");
      return userService.downloadDocument(normalizedPath);
  }
  
  
  
  @PostMapping("/send-otp")
  public ResponseEntity<String> sendOtp(@RequestBody Map<String, String> request) throws UserException {
      String email = request.get("email");
      userService.sendOtp(email);
      monitorLog.info("event=otp_sent email={}", email);
      return ResponseEntity.ok("OTP sent successfully to " + email);
  }

  @PostMapping("/verify-otp")
  public ResponseEntity<String> verifyOtp(@RequestBody Map<String, String> request) {
      String email = request.get("email");
      String otp = request.get("otp");
      boolean isValid = userService.verifyOtp(email, otp);
      if (isValid) {
          monitorLog.info("event=otp_verified email={}", email);
          return ResponseEntity.ok("OTP verified successfully");
      }
      monitorLog.warn("event=otp_verify_failed email={}", email);
      return ResponseEntity.badRequest().body("Invalid or expired OTP");
  }

  @PostMapping("/reset-password")
  public ResponseEntity<String> resetPassword(@RequestBody Map<String, String> request) throws UserException {
      String email = request.get("email");
      String newPassword = request.get("newPassword");
      userService.resetPassword(email, newPassword);
      monitorLog.info("event=password_reset email={}", email);
      return ResponseEntity.ok("Password reset successful");
  }
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
	
}



package in.ap.service;

import java.io.IOException
;
import java.util.List;

import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;

import in.ap.entity.Batch;
import in.ap.entity.Payment;
import in.ap.entity.PurchaseOrder;
import in.ap.entity.Test;
import in.ap.entity.User;
import in.ap.entity.UserTestAnswer;
import in.ap.helper.UserException;


@Service
public interface UserService {

	User saveUser(User user);
	User updateUser(User user);
	User getUser(Long userId);
	List<User> getAllUsers();
	User getUserByEmail(String email);
	public Page<Batch> getAllBatches(int pageNumber,int PageSize);
	PurchaseOrder createOrder(Long batchId);
	Payment doPayment(Long purchaseOrderId,String upiId);
    List<Batch> getMyCourses();
    List<Test> getTests(Long classId);
    UserTestAnswer submitTest(Long testId,List<String> userAnswers);
    public List<Batch> search(@RequestParam("key") String keyword);
    public List<PurchaseOrder> getMyPOS();
    public ResponseEntity<Resource> streamVideo(String filePath, String rangeHeader)throws IOException;
    public ResponseEntity<String> getSignedVideoPlaylist(Long videoId, String playlistKey);
    public ResponseEntity<Resource> viewDocument(String filePath) throws IOException;
    public ResponseEntity<Resource> downloadDocument(String filePath) throws IOException;
    public List<UserTestAnswer> getAlluserTestAns();
    
    void sendOtp(String email) throws UserException;
    boolean verifyOtp(String email, String otp);
    void resetPassword(String email, String newPassword) throws UserException;
    public PurchaseOrder savePurchaseOrder(PurchaseOrder po);
    public void markPaymentFailed(Long purchaseOrderId, String rzOrderId, String rzPaymentId, String signature);
    public Payment markPaymentCompleted(Long purchaseOrderId, String rzOrderId, String rzPaymentId, String signature) throws UserException;
}

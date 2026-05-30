package in.ap.service.impl;

import java.io.File;

import java.io.FileInputStream;
import java.io.IOException;
import java.lang.reflect.Array;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

import org.hibernate.Length;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.core.env.Environment;
import org.springframework.util.StringUtils;
import org.springframework.web.util.HtmlUtils;
import org.springframework.web.bind.annotation.RequestParam;

import in.ap.entity.Batch;
import in.ap.entity.BatchValidyDate;
import in.ap.entity.Class;
import in.ap.entity.ClassRoom;
import in.ap.entity.ClassVideo;
import in.ap.entity.Lecturer;
import in.ap.entity.Payment;
import in.ap.entity.PurchaseOrder;
import in.ap.entity.Question;
import in.ap.entity.Student;
import in.ap.entity.Test;
import in.ap.entity.User;
import in.ap.entity.UserTestAnswer;
import in.ap.helper.EmailService;
import in.ap.helper.UserException;
import in.ap.repo.BatchRepo;
import in.ap.repo.BatchValidityDateRepo;
import in.ap.repo.ClassRepo;
import in.ap.repo.ClassVideoRepo;
import in.ap.repo.PaymentRepo;
import in.ap.repo.PurchaseOrderRepo;
import in.ap.repo.StudentRepo;
import in.ap.repo.TestRepo;
import in.ap.repo.UserRepo;
import in.ap.repo.UserTestAnsRepo;
import in.ap.service.UserService;
import lombok.AllArgsConstructor;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
@Service
@AllArgsConstructor
public class UserServiceImpl implements UserService {
	private static final String NOTES_FRAME_ANCESTORS =
	        "frame-ancestors 'self' http://localhost:5173 http://127.0.0.1:5173 http://localhost:3000 http://localhost:9898 https://apclote.in https://www.apclote.in";
	
	private UserRepo userRepo;
	private BatchRepo batchRepo;
	private StudentRepo studentRepo;
	private PurchaseOrderRepo purchaseOrderRepo;
	private PaymentRepo paymentRepo;
	private ClassRepo classRepo;
	private ClassVideoRepo classVideoRepo;
	private TestRepo testRepo;
	private UserTestAnsRepo userTestAnsRepo;
	private BatchValidityDateRepo bvRepo;
	private final Map<String, String> otpStore = new ConcurrentHashMap();
	private EmailService emailService;
	private PasswordEncoder encoder;
	private S3Client s3Client;
	private CloudFrontService cloudFrontService;
	private Environment environment;

	@Override
	public User saveUser(User user) {
		return userRepo.save(user);
	}

	@Override
	public User updateUser(User user) {
		
		return userRepo.save(user);
	}

	@Override
	public User getUser(Long userId) {
		return userRepo.findById(userId).orElseThrow();
	
	}
	
	

	@Override
	public List<User> getAllUsers() {
		
		return userRepo.findAll();
	}

	@Override
	public User getUserByEmail(String email) {
		
		return userRepo.findByEmail(email);
	}

	public Page<Batch> updateForSecurePage(Page<Batch> batchPage) {

	    List<Batch> updatedBatches = new ArrayList<>();

	    for (Batch batch : batchPage.getContent()) {

	        // Process lecturers
	        List<Lecturer> lecturers = batch.getLecturers();
	        List<Lecturer> updatedLecturers = new ArrayList<>();

	        if (lecturers != null) {
	            for (Lecturer lecturer : lecturers) {
	                lecturer.setSalary(null);
	                lecturer.setLecturerBatchSubjects(null);

	                if (lecturer.getUser() != null) {
	                    lecturer.getUser().setAddress(null);
	                    lecturer.getUser().setCreatedAt(null);
	                    lecturer.getUser().setPassword(null);
	                    lecturer.getUser().setPhono(null);
	                    lecturer.getUser().setRole(null);
	                    lecturer.getUser().setUpdateAt(null);
	                }

	                updatedLecturers.add(lecturer);
	            }
	        }
	        batch.setLecturers(updatedLecturers);

	        // Process classrooms
	        List<ClassRoom> classRooms = batch.getClassRooms();
	        List<ClassRoom> updatedClassRooms = new ArrayList<>();

	        if (classRooms != null) {
	            for (ClassRoom classRoom : classRooms) {
	                List<Class> classes = classRoom.getClasses();
	                List<Class> updatedClasses = new ArrayList<>();

	                if (classes != null) {
	                    for (Class class1 : classes) {
	                        Lecturer lecturer = class1.getLecturer();
	                        if (lecturer != null) {
	                            lecturer.setBatches(null);
	                            lecturer.setLecturerBatchSubjects(null);
	                            lecturer.setDateOfJoining(null);
	                            lecturer.setSalary(null);

	                            if (lecturer.getUser() != null) {
	                                User user = new User();
	                                user.setName(lecturer.getUser().getName());
	                                lecturer.setUser(user);
	                            }
	                        }

	                        class1.setLecturer(lecturer);
	                        class1.setNotes(null);
	                        class1.setTests(null);
	                        class1.setVideos(null);
	                        class1.setZoomlink(null);

	                        updatedClasses.add(class1);
	                    }
	                }
	                classRoom.setClasses(updatedClasses);
	                updatedClassRooms.add(classRoom);
	            }
	        }

	        batch.setClassRooms(updatedClassRooms);
	        updatedBatches.add(batch);
	    }

	    // Return a new Page with sanitized data and original pagination info
	    return new PageImpl(
	        updatedBatches,
	        batchPage.getPageable(),
	        batchPage.getTotalElements()
	    );
	}
	
	
	
	
	
	
	
	@Override
	public Page<Batch> getAllBatches(int pageNumber,int PageSize) {
		PageRequest pageRequest = PageRequest.of(pageNumber, PageSize,Sort.by("startDate").descending());
		
		Page<Batch> batchs = batchRepo.findAll(pageRequest);
		
		Page<Batch> updatedBatchs = updateForSecurePage(batchs);
		
		return updatedBatchs;
		
	}

	@Override
	public PurchaseOrder createOrder(Long batchId) {
		
		
		String email = SecurityContextHolder.getContext().getAuthentication().getName();
		User user = userRepo.findByEmail(email);
		Student student = studentRepo.findByUser(user);
		Batch batch = batchRepo.findById(batchId).get();
		
		PurchaseOrder po = new PurchaseOrder();
		po.setUniqueLL(Math.random()*100);
		po.setBatch(batch);
		po.setFee(batch.getCourse().getFee());
		po.setPurchaseDate(LocalDate.now());
		po.setStudent(student);
		po.setUser(user);
		po.setStatus("PENDING");
		
		PurchaseOrder savedPo = purchaseOrderRepo.save(po);
		return savedPo;
	}

	@Override
	public Payment doPayment(Long purchaseOrderId,String upiId) {
		PurchaseOrder po = purchaseOrderRepo.findById(purchaseOrderId).get();
		
		Payment payment = new Payment();
		try {
			
		 String ranString = generateRandomString();
		String paymentId="P143"+ranString;
		
		String randomString = generateRandomString();
		String orderId="O587"+randomString;
		
		String randomString2 = generateRandomString();
		String recieptId="Rec##445%"+randomString2;
		
		payment.setUpiId(upiId);
		payment.setPurchaseOrder(po);
		payment.setPaymentId(paymentId);
		payment.setOrderId(orderId);
		payment.setReciptId(recieptId);
		payment.setAmount(po.getFee());
		payment.setEmail(po.getUser().getEmail());
		
		payment.setStatus("COMPLITED");	
		paymentRepo.save(payment);
		po.setStatus("COMPLITED");
		purchaseOrderRepo.save(po);
		Student std ;
		std= studentRepo.findByUserEmail(po.getUser().getEmail());
		
		if(std==null) {
			
			std=new Student();
		}
		
		
		std.setUniqueKey(Math.random()*10);
		std.getPurchaseOrder().add(po);
		std.setUser(po.getUser());
		std.getBatchs().add(po.getBatch());
		BatchValidyDate bv = new BatchValidyDate();
		bv.setBatchName(po.getBatch().getName());
		bv.setValidityDate(LocalDate.now().plusYears(1));
		BatchValidyDate batchValidyDate = bvRepo.save(bv);
		std.getBatchValidyDate().add(batchValidyDate);
		
		
		
		
		Student student = studentRepo.save(std);
		
		batchValidyDate.setStudent(student);
		bvRepo.save(batchValidyDate);
		
		
		LocalDateTime now = LocalDateTime.now();
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("h a dd/MM/yyyy", Locale.ENGLISH);
		String date = now.format(formatter).toLowerCase();

        String formatted = now.format(formatter).toLowerCase();
		if(payment.getStatus().equalsIgnoreCase("COMPLITED")) {
			
			EmailService emailService = new EmailService();
			String subject="🎉 Welcome to APCLOTE! Your Course Purchase is Confirmed";
			String body="Dear ["+student.getUser().getName()+"],\r\n"
					+ "\r\n"
					+ "Thank you for choosing APCLOTE – Your Online Coaching Platform for Success. We’re excited to have you on board!\r\n"
					+ "\r\n"
					+ "✅ Purchase Confirmation:\r\n"
					+ "You have successfully enrolled in:\r\n"
					+ "Course Name: ["+payment.getPurchaseOrder().getBatch().getName()+"]\r\n"
					+ "Order ID: ["+payment.getOrderId()+"]\r\n"
					+ "Purchase Date: ["+date+"]\r\n"
					+ "\r\n"
					+ "Your learning journey starts now! You can access your course anytime by logging into your APCLOTE account.\r\n"
					+ "\r\n"
					+ "👉 [Access Your Course] (<a>www.APCLOTE.in.course/</a>\n"
					+ "\r\n"
					+ "What’s next?\r\n"
					+ "\r\n"
					+ "Explore your dashboard and get familiar with the platform.\r\n"
					+ "\r\n"
					+ "Start your first lesson today and track your progress easily.\r\n"
					+ "\r\n"
					+ "Reach out to our support team anytime if you face difficulties.\r\n"
					+ "\r\n"
					+ "At APCLOTE, we believe in making learning simple, engaging, and effective. We’re confident this course will help you reach your goals.\r\n"
					+ "\r\n"
					+ "If you have any questions, feel free to contact us at support@apclote.com\r\n"
					+ ".\r\n"
					+ "\r\n"
					+ "Once again, welcome to the APCLOTE family! 🚀\r\n"
					+ "\r\n"
					+ "Best regards,\r\n"
					+ "Team APCLOTE\r\n"
					+ "Your Online Coaching Partner";
			emailService.sendEmail(po.getUser().getEmail(), subject, body);
		}
		
		
			
		}
		catch (Exception e) {
			e.printStackTrace();
			po.setStatus("FAILED");
			
			payment.setStatus("FAILED");	
		}
		PurchaseOrder save = purchaseOrderRepo.save(po);
		payment.setPurchaseOrder(save);
		Payment save2 = paymentRepo.save(payment);
		return save2;
	}
	
	
	
	public String generateRandomString() {
		Character[] chrs={'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R',
	               'S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k',
	               'l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','1','2','3','4',
	               '5','6','7','8','9'};
		int ran;
		String ranString="";
		for (int i=0;i<9;i++) {
			ran=(int) (Math.random()*chrs.length);
			ranString+=chrs[ran];
		}
		return ranString;
	}

	@Override
	public List<Batch> getMyCourses() {
		String email= SecurityContextHolder.getContext().getAuthentication().getName();
		
		Student student; 
		student= studentRepo.findByUserEmail(email);
		
		if(!(student==null)) {
			if (Boolean.FALSE.equals(student.getActive()) || Boolean.TRUE.equals(student.getDeleted())) {
				return List.of();
			}
			List<BatchValidyDate> batchValidyDate = student.getBatchValidyDate();
		      List<Batch> batchs = student.getBatchs();
		   for (BatchValidyDate bvd : batchValidyDate) {
			    LocalDate validityDate = bvd.getValidityDate();
			    if(validityDate.isBefore(LocalDate.now())) {
			    	String batchName = bvd.getBatchName();
			    	List<Batch> filteredbatchs = batchs.stream().filter((batch)->!(batch.getName().equals(batchName))).toList();
			    	student.setBatchs(filteredbatchs);
			    	 student = studentRepo.save(student);
			    }
		}
		   
		   return student.getBatchs();
		  
		}
		return null;
	}

	@Override
	public List<Test> getTests(Long classId) {
		Class classs= classRepo.findById(classId).get();
		List<Test> tests = testRepo.findByClasss(classs);
		return tests;
	}

	@Override
	public UserTestAnswer submitTest(Long testId,List<String> userAnswers) {
		Test test = testRepo.findById(testId).get();
		
		String email = SecurityContextHolder.getContext().getAuthentication().getName();
		User user = userRepo.findByEmail(email);
		Optional<UserTestAnswer> existingAnswer = userTestAnsRepo.findByUserAndTest(user, test);
		if (existingAnswer.isPresent()) {
			return existingAnswer.get();
		}

		UserTestAnswer userTestAnswer = new UserTestAnswer();
		userTestAnswer.setTest(test);
		userTestAnswer.setDate(LocalDate.now());
		userTestAnswer.setUser(user);
		userTestAnswer.setUserAnswers(userAnswers);
		List<Question> questions=userTestAnswer.getTest().getQuestions();
  
		for(int i=0;i<questions.size();i++) {
			Question question = questions.get(i);
			String keyAnswer = question.getKeyAnswer();
			String userAnswer = userTestAnswer.getUserAnswers().get(i);
			System.out.println(keyAnswer);
			System.out.println(userAnswer);
			
			if(keyAnswer.equalsIgnoreCase(userAnswer)) {
				userTestAnswer.setCorrectAns(userTestAnswer.getCorrectAns()+1);
				
			}
			else {
				userTestAnswer.setWrongAns(userTestAnswer.getWrongAns()+1);
			}
			
		}
		try {
		UserTestAnswer savedUserTestAnswer = userTestAnsRepo.save(userTestAnswer);
		return savedUserTestAnswer;
		}
		catch (Exception e) {
			e.printStackTrace();
			return existingAnswer.orElse(new UserTestAnswer());
		}
		
		
		
		
	}
	@Override
	public List<Batch> search(@RequestParam("key") String keyword){
		List<Batch> batchs;
		 if (keyword == null || keyword.trim().isEmpty()) {
	            batchs= batchRepo.findAll(); // return all if empty
	        }
		 else {
	        batchs= batchRepo.findByNameContainingIgnoreCase(keyword);
	        
		 }
		 
		 
		 return updateForSecure(batchs);
	    }
	
	public List<PurchaseOrder> getMyPOS(){
		
		 String email = SecurityContextHolder.getContext().getAuthentication().getName();
		 User user = userRepo.findByEmail(email);
		   List<PurchaseOrder> purchaseOrders = purchaseOrderRepo.findByUser(user);
		   for (PurchaseOrder purchaseOrder : purchaseOrders) {
			  System.out.println("=================");
		}
		   return purchaseOrders;
		
	}
	
	public ResponseEntity<Resource> streamVideo(String filePath, String rangeHeader) throws IOException {
	    File videoFile = new File(filePath);
	    if (!videoFile.exists()) {
	        return ResponseEntity.notFound().build();
	    }

	    long fileSize = videoFile.length();
	    InputStreamResource resource;
	    long start = 0;
	    long end = fileSize - 1;

	    if (StringUtils.hasText(rangeHeader)) {
	        List<HttpRange> ranges = HttpRange.parseRanges(rangeHeader);
	        HttpRange range = ranges.get(0);

	        start = range.getRangeStart(fileSize);
	        end = range.getRangeEnd(fileSize);
	    }

	    long contentLength = end - start + 1;
	    FileInputStream inputStream = new FileInputStream(videoFile);
	    inputStream.skip(start);
	    resource = new InputStreamResource(inputStream);

	    return ResponseEntity.status(rangeHeader != null ? HttpStatus.PARTIAL_CONTENT : HttpStatus.OK)
	            .header(HttpHeaders.CONTENT_TYPE, Files.probeContentType(videoFile.toPath()))
	            .header(HttpHeaders.ACCEPT_RANGES, "bytes")
	            .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(contentLength))
	            .header(HttpHeaders.CONTENT_RANGE, "bytes " + start + "-" + end + "/" + fileSize)
	            .body(resource);
	}

	@Override
	public ResponseEntity<String> getSignedVideoPlaylist(Long videoId, String requestedPlaylistKey) {
	    try {
	        ClassVideo video = classVideoRepo.findById(videoId).orElse(null);

	        if (video == null || !StringUtils.hasText(video.getHlsUrl())) {
	            return ResponseEntity.notFound().build();
	        }

	        String masterPlaylistKey = cloudFrontService.normalizeKey(video.getHlsUrl());
	        String playlistKey = StringUtils.hasText(requestedPlaylistKey)
	                ? cloudFrontService.normalizeKey(requestedPlaylistKey)
	                : masterPlaylistKey;
	        String bucketName = environment.getProperty("aws.bucketName");

	        if (!StringUtils.hasText(bucketName) || !StringUtils.hasText(playlistKey)) {
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                    .body("Streaming configuration is incomplete");
	        }

	        String allowedPlaylistPrefix = getPlaylistBasePath(masterPlaylistKey);

	        if (!playlistKey.startsWith(allowedPlaylistPrefix)) {
	            return ResponseEntity.status(HttpStatus.FORBIDDEN)
	                    .body("Playlist is not allowed for this video");
	        }

	        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
	                .bucket(bucketName)
	                .key(playlistKey)
	                .build();

	        ResponseBytes<GetObjectResponse> playlistObject = s3Client.getObjectAsBytes(getObjectRequest);
	        String playlist = playlistObject.asUtf8String();
	        String signedPlaylist = signPlaylistResources(playlist, playlistKey, videoId);

	        return ResponseEntity.ok()
	                .contentType(MediaType.parseMediaType("application/vnd.apple.mpegurl"))
	                .cacheControl(CacheControl.noStore())
	                .body(signedPlaylist);
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                .body("Unable to create signed streaming URL");
	    }
	}

	private String signPlaylistResources(String playlist, String playlistKey, Long videoId) throws Exception {
	    String basePath = getPlaylistBasePath(playlistKey);
	    StringBuilder signedPlaylist = new StringBuilder();
	    String[] lines = playlist.split("\\r?\\n", -1);

	    for (String line : lines) {
	        String trimmedLine = line.trim();

	        if (trimmedLine.isEmpty() || trimmedLine.startsWith("#")) {
	            signedPlaylist.append(line).append("\n");
	            continue;
	        }

	        String resourceKey = trimmedLine.startsWith("http://") || trimmedLine.startsWith("https://")
	                ? cloudFrontService.normalizeKey(trimmedLine)
	                : basePath + trimmedLine;

	        if (resourceKey.endsWith(".m3u8")) {
	            signedPlaylist.append(buildSignedPlaylistUrl(videoId, resourceKey)).append("\n");
	            continue;
	        }

	        signedPlaylist.append(cloudFrontService.generateSignedUrl(resourceKey)).append("\n");
	    }

	    return signedPlaylist.toString();
	}

	private String getPlaylistBasePath(String playlistKey) {
	    String basePath = "";
	    int lastSlash = playlistKey.lastIndexOf("/");

	    if (lastSlash >= 0) {
	        basePath = playlistKey.substring(0, lastSlash + 1);
	    }

	    return basePath;
	}

	private String buildSignedPlaylistUrl(Long videoId, String playlistKey) {
	    return "/api/videos/signed-playlist?videoId="
	            + videoId
	            + "&playlistKey="
	            + URLEncoder.encode(playlistKey, StandardCharsets.UTF_8);
	}
	
	public ResponseEntity<Resource> viewDocument(String filePath) throws IOException {
	    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
	        String documentKey = cloudFrontService.normalizeKey(filePath);
	        String bucketName = environment.getProperty("aws.bucketName");

	        if (!StringUtils.hasText(bucketName) || !StringUtils.hasText(documentKey)) {
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	        }

	        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
	                .bucket(bucketName)
	                .key(documentKey)
	                .build();

	        ResponseBytes<GetObjectResponse> objectBytes = s3Client.getObjectAsBytes(getObjectRequest);
	        GetObjectResponse objectResponse = objectBytes.response();
	        String fileName = documentKey.substring(documentKey.lastIndexOf("/") + 1);
	        String contentType = StringUtils.hasText(objectResponse.contentType())
	                ? objectResponse.contentType()
	                : "application/octet-stream";

	        if (fileName.toLowerCase(Locale.ROOT).endsWith(".docx")) {
	            return ResponseEntity.ok()
	                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + ".html\"")
	                    .header("Content-Security-Policy", NOTES_FRAME_ANCESTORS)
	                    .header("Cache-Control", "no-store")
	                    .contentType(MediaType.TEXT_HTML)
	                    .body(new InputStreamResource(new java.io.ByteArrayInputStream(
	                            buildDocxPreviewHtml(fileName, objectBytes.asByteArray()).getBytes(StandardCharsets.UTF_8)
	                    )));
	        }

	        return ResponseEntity.ok()
	                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
	                .header("Content-Security-Policy", NOTES_FRAME_ANCESTORS)
	                .header("Cache-Control", "no-store")
	                .contentType(MediaType.parseMediaType(contentType))
	                .contentLength(objectResponse.contentLength())
	                .body(new InputStreamResource(new java.io.ByteArrayInputStream(objectBytes.asByteArray())));
	    }

        File file = new File(filePath);
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        if (file.getName().toLowerCase(Locale.ROOT).endsWith(".docx")) {
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getName() + ".html\"")
                    .header("Content-Security-Policy", NOTES_FRAME_ANCESTORS)
                    .header("Cache-Control", "no-store")
                    .contentType(MediaType.TEXT_HTML)
                    .body(new InputStreamResource(new java.io.ByteArrayInputStream(
                            buildDocxPreviewHtml(file.getName(), Files.readAllBytes(file.toPath())).getBytes(StandardCharsets.UTF_8)
                    )));
        }

        Resource resource = new FileSystemResource(file);
        String contentType = Files.probeContentType(file.toPath());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getName() + "\"")
                .header("Content-Security-Policy", NOTES_FRAME_ANCESTORS)
                .header("Cache-Control", "no-store")
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

	public ResponseEntity<Resource> downloadDocument(String filePath) throws IOException {
	    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
	        String documentKey = cloudFrontService.normalizeKey(filePath);
	        String bucketName = environment.getProperty("aws.bucketName");

	        if (!StringUtils.hasText(bucketName) || !StringUtils.hasText(documentKey)) {
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	        }

	        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
	                .bucket(bucketName)
	                .key(documentKey)
	                .build();

	        ResponseBytes<GetObjectResponse> objectBytes = s3Client.getObjectAsBytes(getObjectRequest);
	        GetObjectResponse objectResponse = objectBytes.response();
	        String fileName = documentKey.substring(documentKey.lastIndexOf("/") + 1);
	        String contentType = StringUtils.hasText(objectResponse.contentType())
	                ? objectResponse.contentType()
	                : "application/octet-stream";

	        return ResponseEntity.ok()
	                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
	                .header("Cache-Control", "no-store")
	                .contentType(MediaType.parseMediaType(contentType))
	                .contentLength(objectResponse.contentLength())
	                .body(new InputStreamResource(new java.io.ByteArrayInputStream(objectBytes.asByteArray())));
	    }

        File file = new File(filePath);
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(file);
        String contentType = Files.probeContentType(file.toPath());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getName() + "\"")
                .header("Cache-Control", "no-store")
                .contentType(MediaType.parseMediaType(StringUtils.hasText(contentType) ? contentType : "application/octet-stream"))
                .contentLength(file.length())
                .body(resource);
    }

	private String buildDocxPreviewHtml(String fileName, byte[] docxBytes) throws IOException {
	    String text = extractDocxText(docxBytes);
	    String safeTitle = HtmlUtils.htmlEscape(fileName);
	    String safeBody = HtmlUtils.htmlEscape(text).replace("\n", "<br />");

	    return """
	            <!doctype html>
	            <html>
	              <head>
	                <meta charset="utf-8" />
	                <meta name="viewport" content="width=device-width, initial-scale=1" />
	                <style>
	                  body { margin: 0; padding: 32px; font-family: Arial, sans-serif; color: #0f172a; background: #f8fafc; line-height: 1.7; user-select: none; }
	                  main { max-width: 880px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 32px; }
	                  h1 { margin: 0 0 24px; font-size: 22px; }
	                  p { margin: 0; white-space: normal; }
	                  @media print { body { display: none; } }
	                </style>
	              </head>
	              <body oncontextmenu="return false">
	                <main>
	                  <h1>%s</h1>
	                  <p>%s</p>
	                </main>
	              </body>
	            </html>
	            """.formatted(safeTitle, safeBody);
	}

	private String extractDocxText(byte[] docxBytes) throws IOException {
	    StringBuilder text = new StringBuilder();

	    try (ZipInputStream zipInputStream = new ZipInputStream(new java.io.ByteArrayInputStream(docxBytes))) {
	        ZipEntry entry;

	        while ((entry = zipInputStream.getNextEntry()) != null) {
	            if (!"word/document.xml".equals(entry.getName())) {
	                continue;
	            }

	            String xml = new String(zipInputStream.readAllBytes(), StandardCharsets.UTF_8);
	            return xml
	                    .replaceAll("</w:p>", "\n")
	                    .replaceAll("</w:tr>", "\n")
	                    .replaceAll("<[^>]+>", "")
	                    .replace("&amp;", "&")
	                    .replace("&lt;", "<")
	                    .replace("&gt;", ">")
	                    .replace("&quot;", "\"")
	                    .replace("&apos;", "'")
	                    .trim();
	        }
	    }

	    return text.toString();
	}
	
	
	
	
	public List<UserTestAnswer> getAlluserTestAns(){
		  String email = SecurityContextHolder.getContext().getAuthentication().getName();
		  User user = userRepo.findByEmail(email);
		return userTestAnsRepo.findByUser(user);
	}
	
	
	
	public List<Batch> updateForSecure(List<Batch> batchs) {
	    List<Batch> updatedBatchs = new ArrayList<>();

	    for (Batch batch : batchs) {
	        // Sanitize Lecturers
	        List<Lecturer> lecturers = batch.getLecturers();
	        List<Lecturer> updatedLecturers = new ArrayList<>();

	        for (Lecturer lecturer : lecturers) {
	            lecturer.setSalary(null);
	            lecturer.setLecturerBatchSubjects(null);
	            lecturer.getUser().setAddress(null);
	            lecturer.getUser().setCreatedAt(null);
	            lecturer.getUser().setPassword(null);
	            lecturer.getUser().setPhono(null);
	            lecturer.getUser().setRole(null);
	            lecturer.getUser().setUpdateAt(null);
	            updatedLecturers.add(lecturer);
	        }
	        batch.setLecturers(updatedLecturers);

	        // Sanitize ClassRooms and Classes
	        List<ClassRoom> classRooms = batch.getClassRooms();
	        List<ClassRoom> updatedClassRooms = new ArrayList<>();

	        for (ClassRoom classRoom : classRooms) {
	            List<Class> classes = classRoom.getClasses();
	            List<Class> updatedClasses = new ArrayList<>();

	            for (Class class1 : classes) {
	                Lecturer lecturer = class1.getLecturer();
	                if (lecturer != null) {
	                    lecturer.setBatches(null);
	                    lecturer.setLecturerBatchSubjects(null);
	                    lecturer.setDateOfJoining(null);
	                    lecturer.setSalary(null);

	                    String name = lecturer.getUser().getName();
	                    User user = new User();
	                    user.setName(name);
	                    lecturer.setUser(user);
	                }

	                class1.setLecturer(lecturer);
	                class1.setNotes(null);
	                class1.setTests(null);
	                class1.setVideos(null);
	                class1.setZoomlink(null);

	                updatedClasses.add(class1);
	            }

	            classRoom.setClasses(updatedClasses);
	            updatedClassRooms.add(classRoom);
	        }

	        batch.setClassRooms(updatedClassRooms);
	        updatedBatchs.add(batch);
	    }

	    return updatedBatchs;
	}

	
	
	 @Override
	    public void sendOtp(String email) throws UserException {
	        User user = userRepo.findByEmail(email);
	        if (user == null) throw new UserException("No user found with this email");

	        String otp = String.valueOf(new Random().nextInt(900000) + 100000); // 6-digit OTP
	        otpStore.put(email, otp);

	        String subject = "APCLOTE - Password Reset OTP";
	        String body = "Dear " + user.getName() + ",\n\n"
	                + "Your OTP for password reset is: " + otp + "\n"
	                + "This OTP is valid for 10 minutes.\n\n"
	                + "If you didn't request this, please ignore this email.\n\n"
	                + "Team APCLOTE";

	        emailService.sendEmail(email, subject, body);
	    }

	    @Override
	    public boolean verifyOtp(String email, String otp) {
	        String storedOtp = otpStore.get(email);
	        if (storedOtp != null && storedOtp.equals(otp)) {
	            otpStore.remove(email); // clear after successful verification
	            return true;
	        }
	        return false;
	    }

	    @Override
	    public void resetPassword(String email, String newPassword) throws UserException {
	        User user = userRepo.findByEmail(email);
	        if (user == null) throw new UserException("User not found");

	        user.setPassword(encoder.encode(newPassword));
	        userRepo.save(user);
	    }
	    
	 
	    public PurchaseOrder savePurchaseOrder(PurchaseOrder po) {
	        return purchaseOrderRepo.save(po);
	    }

	    public void markPaymentFailed(Long purchaseOrderId, String rzOrderId, String rzPaymentId, String signature) {
	        PurchaseOrder po = purchaseOrderRepo.findById(purchaseOrderId).orElseThrow();
	        po.setStatus("FAILED");
	        PurchaseOrder savedPO = purchaseOrderRepo.save(po);

	        Payment payment = new Payment();
	        payment.setPurchaseOrder(savedPO);
	        payment.setOrderId(rzOrderId);
	        payment.setPaymentId(rzPaymentId);
	        payment.setRazorpaySignature(signature);
	        payment.setStatus("FAILED");
	        payment.setAmount(po.getFee());
	        paymentRepo.save(payment);
	    }
	    
	    public Payment markPaymentCompleted(Long purchaseOrderId, String rzOrderId, String rzPaymentId, String signature) throws UserException {
	    	System.out.println("Mark p complite");
	        PurchaseOrder po = purchaseOrderRepo.findById(purchaseOrderId).orElseThrow();
	        // verify signature again here if you like (already done earlier)
	        po.setStatus("COMPLETED");
	        po.setRazorpayOrderId(rzOrderId);
	        PurchaseOrder savedPO = purchaseOrderRepo.save(po);
	        
	        String randomString2 = generateRandomString();
			String recieptId="Rec##445%"+randomString2;

	        Payment payment = new Payment();
	        payment.setPurchaseOrder(savedPO);
	        payment.setOrderId(rzOrderId);
	        payment.setPaymentId(rzPaymentId);
	        payment.setRazorpaySignature(signature);
	        payment.setStatus("COMPLETED");
	        payment.setAmount(po.getFee());
	        payment.setEmail(po.getUser().getEmail());
	        payment.setReciptId(recieptId);
	        Payment saved = paymentRepo.save(payment);

	        Student std ;
			std= studentRepo.findByUserEmail(savedPO.getUser().getEmail());
			System.out.println(std);
			if(std==null) {
				System.out.println("innnnnnnn");
				std=new Student();
			}
			
			
			std.setUniqueKey(Math.random()*10);
			std.getPurchaseOrder().add(savedPO);
			std.setUser(savedPO.getUser());
			std.getBatchs().add(savedPO.getBatch());
			BatchValidyDate bv = new BatchValidyDate();
			bv.setBatchName(savedPO.getBatch().getName());
			bv.setValidityDate(LocalDate.now().plusYears(1));
			BatchValidyDate batchValidyDate = bvRepo.save(bv);
			std.getBatchValidyDate().add(batchValidyDate);
			
			
			
			
			
			Student student = studentRepo.save(std);
			student.toString();
			batchValidyDate.setStudent(student);
			bvRepo.save(batchValidyDate);
			
			
			LocalDateTime now = LocalDateTime.now();
			DateTimeFormatter formatter = DateTimeFormatter.ofPattern("h a dd/MM/yyyy", Locale.ENGLISH);
			String date = now.format(formatter).toLowerCase();

	        String formatted = now.format(formatter).toLowerCase();
			if(payment.getStatus().equalsIgnoreCase("COMPLITED")) {
				
				EmailService emailService = new EmailService();
				String subject="🎉 Welcome to APCLOTE! Your Course Purchase is Confirmed";
				String body="Dear ["+student.getUser().getName()+"],\r\n"
						+ "\r\n"
						+ "Thank you for choosing APCLOTE – Your Online Coaching Platform for Success. We’re excited to have you on board!\r\n"
						+ "\r\n"
						+ "✅ Purchase Confirmation:\r\n"
						+ "You have successfully enrolled in:\r\n"
						+ "Course Name: ["+payment.getPurchaseOrder().getBatch().getName()+"]\r\n"
						+ "Order ID: ["+payment.getOrderId()+"]\r\n"
						+ "Purchase Date: ["+date+"]\r\n"
						+ "\r\n"
						+ "Your learning journey starts now! You can access your course anytime by logging into your APCLOTE account.\r\n"
						+ "\r\n"
						+ "👉 [Access Your Course] (<a>www.APCLOTE.in.course/</a>\n"
						+ "\r\n"
						+ "What’s next?\r\n"
						+ "\r\n"
						+ "Explore your dashboard and get familiar with the platform.\r\n"
						+ "\r\n"
						+ "Start your first lesson today and track your progress easily.\r\n"
						+ "\r\n"
						+ "Reach out to our support team anytime if you face difficulties.\r\n"
						+ "\r\n"
						+ "At APCLOTE, we believe in making learning simple, engaging, and effective. We’re confident this course will help you reach your goals.\r\n"
						+ "\r\n"
						+ "If you have any questions, feel free to contact us at support@apclote.com\r\n"
						+ ".\r\n"
						+ "\r\n"
						+ "Once again, welcome to the APCLOTE family! 🚀\r\n"
						+ "\r\n"
						+ "Best regards,\r\n"
						+ "Team APCLOTE\r\n"
						+ "Your Online Coaching Partner";
				emailService.sendEmail(po.getUser().getEmail(), subject, body);

	       

	        
	    }
			
			

			return saved;

	
	
	
	}
}




package in.ap.service.impl;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import in.ap.entity.Batch;
import in.ap.entity.Class;
import in.ap.entity.ClassNotesFile;
import in.ap.entity.ClassRoom;
import in.ap.entity.ClassVideo;
import in.ap.entity.Course;
import in.ap.entity.DeleteRequest;
import in.ap.entity.Lecturer;
import in.ap.entity.LecturerBatchSubject;
import in.ap.entity.PurchaseOrder;
import in.ap.entity.Student;
import in.ap.entity.Subject;
import in.ap.entity.SubjectList;
import in.ap.entity.Test;
import in.ap.entity.User;
import in.ap.helper.EmailService;
import in.ap.helper.UserException;
import in.ap.repo.BatchRepo;
import in.ap.repo.ClassNotesFileRepo;
import in.ap.repo.ClassRepo;
import in.ap.repo.ClassRoomRepo;
import in.ap.repo.ClassVideoRepo;
import in.ap.repo.CourseRepo;
import in.ap.repo.DeleteRequestRepo;
import in.ap.repo.LecturerBatchSubjectRepo;
import in.ap.repo.LecturerRepo;
import in.ap.repo.PurchaseOrderRepo;
import in.ap.repo.QuestionRepo;
import in.ap.repo.StudentRepo;
import in.ap.repo.SubjectListRepo;
import in.ap.repo.SubjectRepo;
import in.ap.repo.TestRepo;
import in.ap.repo.UserTestAnsRepo;
import in.ap.repo.UserRepo;
import in.ap.service.AdminService;
import io.micrometer.common.util.StringUtils;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Request;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
@AllArgsConstructor
public class AdminserviceImpl implements AdminService {
	
	private BatchRepo batchRepo;
	private ClassRoomRepo classRoomRepo;
	private LecturerRepo lecturerRepo;
	private UserRepo userRepo;
	private CourseRepo courseRepo;
	private SubjectRepo subjectRepo;
	private EmailService emailService;
	private SubjectListRepo subjectListRepo;
	private PurchaseOrderRepo purchaseOrderRepo;
	private LecturerBatchSubjectRepo lecturerBatchSubjectRepo;
	private StudentRepo studentRepo;
	private ClassRepo classRepo;
	private ClassVideoRepo classVideoRepo;
	private ClassNotesFileRepo classNotesFileRepo;
	private TestRepo testRepo;
	private QuestionRepo questionRepo;
	private UserTestAnsRepo userTestAnsRepo;
	private S3Client s3Client;
	private Environment environment;
	private DeleteRequestRepo deleteRequestRepo;
	
    private final String DIR="syllabus";
	@Override
	public Batch createBatch(Batch batch) {
		
		Course course = courseRepo.findById(batch.getCourse().getId()).get();
		batch.setCourse(course);
		Batch batch1 = batchRepo.save(batch);
       batch.getCourse().getBatches().add(batch1);
       Course course1 = courseRepo.save(batch.getCourse());
       batch1.setCourse(course1);
   
		return batchRepo.save(batch);
	}

	@Override
	public Batch updateBatch(Batch batch) {
		Batch existing = batchRepo.findById(batch.getId())
				.orElseThrow(() -> new UserException("Batch not found with id: " + batch.getId()));
		Course course = courseRepo.findById(batch.getCourse().getId())
				.orElseThrow(() -> new UserException("Course not found with id: " + batch.getCourse().getId()));

		existing.setName(batch.getName());
		existing.setCourse(course);
		existing.setStartDate(batch.getStartDate());
		existing.setStart_time(batch.getStart_time());
		existing.setEnd_time(batch.getEnd_time());
		return batchRepo.save(existing);
	}

	@Override
	public Lecturer createLecurer(Lecturer lecturer,Long id,String pass) throws UserException {
		
		
		User user = userRepo.findById(id).orElseThrow();
		if (lecturerRepo.findByUser(user) != null) {
			throw new UserException("This user is already a lecturer");
		}
		user.setRole("ROLE_LECTURER");
		userRepo.save(user);
		lecturer.setUser(user);
		Lecturer savedLecturer= lecturerRepo.save(lecturer);
		
		String subject="Lecturer Account Created – Action Required";
		String body="\r\n"
				+ "Dear ["+ savedLecturer.getUser().getName()+"],\r\n"
				+ "\r\n"
				+ "We are pleased to inform you that your Lecturer Account has been successfully created on the APCLOTE Coaching Center platform.\r\n"
				+ "\r\n"
				+ "You can use the following credentials to log in:\r\n"
				+ "\r\n"
				+ "Email (Username):"+user.getEmail()
				+ "\r\n"
				+ (pass == null || pass.isBlank() ? "Use your existing account password to log in.\r\n" : "Temporary Password:"+pass + "\r\n")
				+ "👉 For your security, we strongly recommend that you log in at the earliest opportunity and change your password immediately after your first login.\r\n"
				+ "\r\n"
				+ "If you face any issues while accessing your account or resetting your password, please feel free to reach out to us at [support_email/contact number].\r\n"
				+ "\r\n"
				+ "We look forward to your valuable contributions to APCLOTE Coaching Center.\r\n"
				+ "\r\n"
				+ "Best regards,\r\n"
				+ "Admin Team\r\n"
				+ "APCLOTE Coaching Center";
		
		 emailService.sendEmail(user.getEmail(),subject , body);
		
		
		return savedLecturer;
	}
	
	
	public Lecturer updateLecturer(Lecturer lecturer) {
		Lecturer savedLecturer= lecturerRepo.save(lecturer);
		return savedLecturer;
	}
	
	public String deleteLecturer(Long lecturerId) {
		try {
			Lecturer lecturer = lecturerRepo.findById(lecturerId).get();
			User user = lecturer.getUser();
			if (user != null) {
				user.setActive(false);
				user.setDeleted(true);
				user.setDeactivatedAt(LocalDateTime.now());
				userRepo.save(user);
			}
			lecturerRepo.deleteById(lecturerId);
		
		return "Lecturer Deleted Successfully";
		}
		catch (Exception e) {
			e.printStackTrace();
			return "Failed To Delete";
		}
	}

	@Override
	@Transactional
	public String deleteSubject(Long subjectId) {
		SubjectList subject = subjectListRepo.findById(subjectId)
				.orElseThrow(() -> new UserException("Subject not found with id: " + subjectId));

		for (ClassRoom classRoom : new ArrayList<>(classRoomRepo.findBySubject(subject))) {
			deleteClassRoomEntity(classRoom);
		}

		lecturerBatchSubjectRepo.deleteAll(new ArrayList<>(lecturerBatchSubjectRepo.findBySubject(subject)));

		List<Subject> courseSubjects = subjectRepo.findAllByName(subject.getName());
		for (Course course : courseRepo.findAll()) {
			if (course.getSubjects() != null && course.getSubjects().removeIf(s -> s.getId() != null &&
					courseSubjects.stream().anyMatch(cs -> cs.getId().equals(s.getId())))) {
				courseRepo.save(course);
			}
		}
		subjectRepo.deleteAll(courseSubjects);
		subjectListRepo.delete(subject);
		return "Subject Deleted Successfully";
	}

	@Override
	@Transactional
	public String deleteCourse(Long courseId) {
		Course course = courseRepo.findById(courseId)
				.orElseThrow(() -> new UserException("Course not found with id: " + courseId));

		for (Batch batch : new ArrayList<>(course.getBatches())) {
			deleteBatchEntity(batch);
		}

		if (course.getSubjects() != null) {
			subjectRepo.deleteAll(new ArrayList<>(course.getSubjects()));
			course.getSubjects().clear();
		}

		deleteS3Object(course.getSyllabusFilePath());
		courseRepo.delete(course);
		return "Course Deleted Successfully";
	}

	@Override
	@Transactional
	public String deleteBatch(Long batchId) {
		Batch batch = batchRepo.findById(batchId)
				.orElseThrow(() -> new UserException("Batch not found with id: " + batchId));
		deleteBatchEntity(batch);
		return "Batch Deleted Successfully";
	}

	@Override
	@Transactional
	public String deleteClassRoom(Long classRoomId) {
		ClassRoom classRoom = classRoomRepo.findById(classRoomId)
				.orElseThrow(() -> new UserException("Class room not found with id: " + classRoomId));
		deleteClassRoomEntity(classRoom);
		return "Class Room Deleted Successfully";
	}

	@Override
	@Transactional
	public String deleteClass(Long classId) {
		Class class1 = classRepo.findById(classId)
				.orElseThrow(() -> new UserException("Class not found with id: " + classId));
		deleteClassEntity(class1);
		return "Class Deleted Successfully";
	}

	@Override
	@Transactional
	public String deleteVideo(Long videoId) {
		ClassVideo video = classVideoRepo.findById(videoId)
				.orElseThrow(() -> new UserException("Video not found with id: " + videoId));
		deleteVideoEntity(video);
		return "Video Deleted Successfully";
	}

	@Override
	@Transactional
	public String deleteNotes(Long notesId) {
		ClassNotesFile notes = classNotesFileRepo.findById(notesId)
				.orElseThrow(() -> new UserException("Notes not found with id: " + notesId));
		deleteNotesEntity(notes);
		return "Notes Deleted Successfully";
	}

	@Override
	@Transactional
	public String deleteTest(Long testId) {
		Test test = testRepo.findById(testId)
				.orElseThrow(() -> new UserException("Test not found with id: " + testId));
		deleteTestEntity(test);
		return "Test Deleted Successfully";
	}

	@Override
	public Page<DeleteRequest> getDeleteRequests(String status, int pageNumber, int pageSize) {
		PageRequest page = PageRequest.of(Math.max(pageNumber, 0), pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));
		if (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)) {
			return deleteRequestRepo.findAllByOrderByCreatedAtDesc(page);
		}
		return deleteRequestRepo.findByStatusOrderByCreatedAtDesc(status, page);
	}

	@Override
	public DeleteRequest getDeleteRequest(Long requestId) {
		return deleteRequestRepo.findById(requestId)
				.orElseThrow(() -> new UserException("Delete request not found with id: " + requestId));
	}

	@Override
	@Transactional
	public String approveDeleteRequest(Long requestId) {
		DeleteRequest request = deleteRequestRepo.findById(requestId)
				.orElseThrow(() -> new UserException("Delete request not found with id: " + requestId));

		if (!"PENDING".equalsIgnoreCase(request.getStatus())) {
			return "Delete request is already " + request.getStatus();
		}

		deleteRequestedResource(request.getResourceType(), request.getResourceId());
		String email = SecurityContextHolder.getContext().getAuthentication().getName();
		request.setStatus("COMPLETED");
		request.setCompletedAt(LocalDateTime.now());
		request.setCompletedByEmail(email);
		deleteRequestRepo.save(request);
		sendDeleteCompletionEmail(request);
		return "Delete request completed successfully";
	}

	private void sendDeleteCompletionEmail(DeleteRequest request) {
		if (request.getLecturerEmail() == null || request.getLecturerEmail().isBlank()) {
			return;
		}

		String subject = "APCLOTE delete request completed";
		String body = "Dear " + safeText(request.getLecturerName()) + ",\n\n"
				+ "Your requested resource has been deleted successfully.\n\n"
				+ "Resource Type: " + safeText(request.getResourceType()) + "\n"
				+ "Resource Id: " + safeText(request.getResourceId() != null ? String.valueOf(request.getResourceId()) : null) + "\n"
				+ "Resource Name: " + safeText(request.getResourceName()) + "\n\n"
				+ "You can continue with your next process.\n\n"
				+ "Regards,\n"
				+ "APCLOTE Admin Team";

		try {
			emailService.sendEmail(request.getLecturerEmail(), subject, body);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	private String safeText(String value) {
		return value == null || value.isBlank() ? "N/A" : value;
	}

	private void deleteRequestedResource(String resourceType, Long resourceId) {
		if (resourceType == null || resourceId == null) {
			throw new UserException("Delete request resource is incomplete");
		}

		switch (resourceType) {
			case "subject" -> deleteSubject(resourceId);
			case "course" -> deleteCourse(resourceId);
			case "batch" -> deleteBatch(resourceId);
			case "classRoom" -> deleteClassRoom(resourceId);
			case "class" -> deleteClass(resourceId);
			case "video" -> deleteVideo(resourceId);
			case "notes" -> deleteNotes(resourceId);
			case "test" -> deleteTest(resourceId);
			default -> throw new UserException("Unsupported resource type: " + resourceType);
		}
	}

	private void deleteBatchEntity(Batch batch) {
		for (Student student : studentRepo.findByBatchId(batch.getId())) {
			if (student.getBatchs() != null && student.getBatchs().remove(batch)) {
				studentRepo.save(student);
			}
		}

		for (Lecturer lecturer : lecturerRepo.findWithBatch(batch.getId())) {
			if (lecturer.getBatches() != null && lecturer.getBatches().remove(batch)) {
				lecturerRepo.save(lecturer);
			}
		}

		for (PurchaseOrder purchaseOrder : purchaseOrderRepo.findByBatch(batch)) {
			purchaseOrder.setBatch(null);
			purchaseOrderRepo.save(purchaseOrder);
		}

		lecturerBatchSubjectRepo.deleteAll(new ArrayList<>(lecturerBatchSubjectRepo.findByBatch(batch)));

		for (ClassRoom classRoom : new ArrayList<>(classRoomRepo.findByBatch(batch))) {
			deleteClassRoomEntity(classRoom);
		}

		if (batch.getCourse() != null && batch.getCourse().getBatches() != null) {
			batch.getCourse().getBatches().remove(batch);
			courseRepo.save(batch.getCourse());
		}

		batchRepo.delete(batch);
	}

	private void deleteClassRoomEntity(ClassRoom classRoom) {
		for (Class class1 : new ArrayList<>(classRepo.findByClassRoom(classRoom))) {
			deleteClassEntity(class1);
		}

		if (classRoom.getBatch() != null && classRoom.getBatch().getClassRooms() != null) {
			classRoom.getBatch().getClassRooms().remove(classRoom);
			batchRepo.save(classRoom.getBatch());
		}

		classRoomRepo.delete(classRoom);
	}

	private void deleteClassEntity(Class class1) {
		for (ClassVideo video : new ArrayList<>(classVideoRepo.findByClasss(class1))) {
			deleteVideoEntity(video);
		}

		for (ClassNotesFile notes : new ArrayList<>(classNotesFileRepo.findByClasss(class1))) {
			deleteNotesEntity(notes);
		}

		for (Test test : new ArrayList<>(testRepo.findByClasss(class1))) {
			deleteTestEntity(test);
		}

		if (class1.getClassRoom() != null && class1.getClassRoom().getClasses() != null) {
			class1.getClassRoom().getClasses().remove(class1);
			classRoomRepo.save(class1.getClassRoom());
		}

		classRepo.delete(class1);
	}

	private void deleteVideoEntity(ClassVideo video) {
		if (video.getClasss() != null && video.getClasss().getVideos() != null) {
			video.getClasss().getVideos().remove(video);
			classRepo.save(video.getClasss());
		}
		deleteS3Object(video.getOriginalVideoUrl());
		deleteS3Prefix(video.getHlsUrl());
		deleteS3Object(video.getFilePath());
		classVideoRepo.delete(video);
	}

	private void deleteNotesEntity(ClassNotesFile notes) {
		if (notes.getClasss() != null && notes.getClasss().getNotes() != null) {
			notes.getClasss().getNotes().remove(notes);
			classRepo.save(notes.getClasss());
		}
		deleteS3Object(notes.getFilePath());
		classNotesFileRepo.delete(notes);
	}

	private void deleteTestEntity(Test test) {
		userTestAnsRepo.deleteByTest(test);
		questionRepo.deleteByTest(test);

		if (test.getClasss() != null && test.getClasss().getTests() != null) {
			test.getClasss().getTests().remove(test);
			classRepo.save(test.getClasss());
		}

		testRepo.delete(test);
	}

	private void deleteLocalFile(String filePath) {
		if (filePath == null || filePath.isBlank()) {
			return;
		}
		try {
			Files.deleteIfExists(Paths.get(filePath));
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	

	@Override
	public ClassRoom createClassroom(ClassRoom classRoom, Long batchId, Long subjectId, String lecturerEmail) {
		 Batch batch = batchRepo.findById(batchId)
				 .orElseThrow(() -> new UserException("Batch not found with id: " + batchId));
		 User user = userRepo.findByEmail(lecturerEmail);
		 Lecturer lecturer = lecturerRepo.findByUser(user);
		 SubjectList subject = subjectListRepo.findById(subjectId)
				 .orElseThrow(() -> new UserException("Subject not found with id: " + subjectId));

		 boolean assigned = lecturerBatchSubjectRepo
				 .existsByBatchIdAndSubjectIdAndLecturerId(batchId, subjectId, lecturer.getId());

		 if (!assigned) {
			 throw new UserException("You are not assigned to this subject in this batch");
		 }

		 classRoom.setBatch(batch);
		 classRoom.setSubject(subject);
		 classRoom.setCreatedAt(LocalDateTime.now());
		 classRoom.setCreatedByName(user.getName());
		 return classRoomRepo.save(classRoom);
		
	}

	@Override
	@Transactional
	public String assignBatchAndSubjects(Long batchId, Long subjectId, Long lecturerId) {
	    try {
	        // Fetch entities
	        Batch batch = batchRepo.findById(batchId)
	                .orElseThrow(() -> new UserException("Batch not found with id: " + batchId));
	        Subject subjecttt = subjectRepo.findById(subjectId)
	                .orElseThrow(() -> new UserException("Subject not found with id: " + subjectId));
	        Lecturer lecturer = lecturerRepo.findById(lecturerId)
	                .orElseThrow(() -> new UserException("Lecturer not found with id: " + lecturerId));

	        SubjectList subject = subjectListRepo.findByName(subjecttt.getName());
	        // Check if this assignment already exists
	        boolean exists = lecturerBatchSubjectRepo
	                .existsByBatchIdAndSubjectIdAndLecturerId(batchId, subject.getId(), lecturerId);

	        if (exists) {
	            return "This Lecturer is already assigned to this Batch and Subject";
	        }

	        // Create and save new LecturerBatchSubject record
	        LecturerBatchSubject lbs = new LecturerBatchSubject();
	        lbs.setBatch(batch);
	        lbs.setSubject(subject);
	        lbs.setLecturer(lecturer);
	        lecturerBatchSubjectRepo.save(lbs);

	        // Update bidirectional relationships
	        batch.getLecturers().add(lecturer);
	        lecturer.getBatches().add(batch);

	        // No need to call save(batch) or save(lecturer) explicitly 
	        // if CascadeType is set on the relationship (otherwise keep them)
	        batchRepo.save(batch);
	        lecturerRepo.save(lecturer);

	        return "Batch and Subject assigned successfully";

	    } catch (Exception e) {
	        e.printStackTrace();
	        return "Failed to assign Batch and Subject: " + e.getMessage();
		}
	}

	@Override
	public Map<String, Object> getAssignmentConflict(Long batchId, Long subjectId) {
		SubjectList subject = resolveSubjectList(subjectId);
		List<LecturerBatchSubject> assignments =
				lecturerBatchSubjectRepo.findActiveByBatchIdAndSubjectId(batchId, subject.getId());

		if (assignments == null || assignments.isEmpty()) {
			return null;
		}

		return assignmentPayload(assignments.get(0));
	}

	@Override
	public Map<String, Object> getLecturerDetails(Long lecturerId) {
		Lecturer lecturer = lecturerRepo.findById(lecturerId)
				.orElseThrow(() -> new UserException("Lecturer not found with id: " + lecturerId));

		Map<String, Object> payload = new HashMap<>();
		payload.put("id", lecturer.getId());
		payload.put("salary", lecturer.getSalary());
		payload.put("dateOfJoining", lecturer.getDateOfJoining());

		if (lecturer.getUser() != null) {
			Map<String, Object> user = new HashMap<>();
			user.put("id", lecturer.getUser().getId());
			user.put("name", lecturer.getUser().getName());
			user.put("email", lecturer.getUser().getEmail());
			user.put("phone", lecturer.getUser().getPhono());
			user.put("address", lecturer.getUser().getAddress());
			user.put("role", lecturer.getUser().getRole());
			payload.put("user", user);
		}

		List<Map<String, Object>> assignments =
				lecturerBatchSubjectRepo.findByLecturerId(lecturerId).stream()
						.map(this::assignmentPayload)
						.sorted((left, right) -> {
							boolean leftActive = "ACTIVE".equals(left.get("status"));
							boolean rightActive = "ACTIVE".equals(right.get("status"));
							if (leftActive != rightActive) {
								return leftActive ? -1 : 1;
							}
							LocalDate leftStart = (LocalDate) left.get("batchStartDate");
							LocalDate rightStart = (LocalDate) right.get("batchStartDate");
							if (leftStart == null && rightStart == null) {
								return 0;
							}
							if (leftStart == null) {
								return 1;
							}
							if (rightStart == null) {
								return -1;
							}
							return rightStart.compareTo(leftStart);
						})
						.toList();

		payload.put("assignments", assignments);
		return payload;
	}

	@Override
	@Transactional
	public String disassignLecturerFromBatchSubject(Long assignmentId) {
		LecturerBatchSubject assignment = lecturerBatchSubjectRepo.findById(assignmentId)
				.orElseThrow(() -> new UserException("Assignment not found with id: " + assignmentId));

		Lecturer lecturer = assignment.getLecturer();
		Batch batch = assignment.getBatch();

		assignment.setAccessActive(false);
		assignment.setAccessRemovedAt(LocalDateTime.now());
		lecturerBatchSubjectRepo.saveAndFlush(assignment);

		if (lecturer != null && batch != null
				&& lecturerBatchSubjectRepo.findActiveByLecturerIdAndBatchId(lecturer.getId(), batch.getId()).isEmpty()
				&& lecturer.getBatches() != null) {
			lecturer.getBatches().remove(batch);
			lecturerRepo.save(lecturer);
		}

		if (batch != null && lecturer != null && batch.getLecturers() != null
				&& lecturerBatchSubjectRepo.findActiveByLecturerIdAndBatchId(lecturer.getId(), batch.getId()).isEmpty()) {
			batch.getLecturers().remove(lecturer);
			batchRepo.save(batch);
		}

		return "Lecturer disassigned successfully";
	}

	private SubjectList resolveSubjectList(Long subjectId) {
		Subject subject = subjectRepo.findById(subjectId)
				.orElseThrow(() -> new UserException("Subject not found with id: " + subjectId));
		SubjectList subjectList = subjectListRepo.findByName(subject.getName());
		if (subjectList == null) {
			throw new UserException("Subject list entry not found for: " + subject.getName());
		}
		return subjectList;
	}

	private Map<String, Object> assignmentPayload(LecturerBatchSubject assignment) {
		Map<String, Object> payload = new HashMap<>();
		payload.put("assignmentId", assignment.getId());
		boolean accessActive = assignment.getAccessActive() == null || assignment.getAccessActive();
		payload.put("accessActive", accessActive);
		payload.put("accessRemovedAt", assignment.getAccessRemovedAt());

		Batch batch = assignment.getBatch();
		if (batch != null) {
			payload.put("batchId", batch.getId());
			payload.put("batchName", batch.getName());
			payload.put("batchStartDate", batch.getStartDate());
			payload.put("batchEndDate", calculateBatchEndDate(batch));
			payload.put("status", accessActive ? (isBatchActive(batch) ? "ACTIVE" : "COMPLETED") : "ACCESS_REMOVED");
			payload.put("courseName", batch.getCourse() == null ? null : batch.getCourse().getName());
		}

		SubjectList subject = assignment.getSubject();
		if (subject != null) {
			payload.put("subjectId", subject.getId());
			payload.put("subjectName", subject.getName());
		}

		Lecturer lecturer = assignment.getLecturer();
		if (lecturer != null) {
			payload.put("lecturerId", lecturer.getId());
			if (lecturer.getUser() != null) {
				payload.put("lecturerName", lecturer.getUser().getName());
				payload.put("lecturerEmail", lecturer.getUser().getEmail());
			}
		}

		return payload;
	}

	private LocalDate calculateBatchEndDate(Batch batch) {
		if (batch == null || batch.getStartDate() == null || batch.getCourse() == null) {
			return null;
		}

		return batch.getStartDate().plusMonths(batch.getCourse().getDuration());
	}

	private boolean isBatchActive(Batch batch) {
		LocalDate endDate = calculateBatchEndDate(batch);
		return endDate == null || !endDate.isBefore(LocalDate.now());
	}

	private void deleteS3Object(String fileUrl) {
		S3Location location = parseS3Location(fileUrl);
		if (location == null) {
			return;
		}

		try {
			s3Client.deleteObject(DeleteObjectRequest.builder()
					.bucket(location.bucket)
					.key(location.key)
					.build());
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	private void deleteS3Prefix(String playlistUrl) {
		S3Location location = parseS3Location(playlistUrl);
		if (location == null || !location.key.endsWith("index.m3u8")) {
			return;
		}

		String prefix = location.key.substring(0, location.key.lastIndexOf('/') + 1);
		try {
			s3Client.listObjectsV2(ListObjectsV2Request.builder()
							.bucket(location.bucket)
							.prefix(prefix)
							.build())
					.contents()
					.forEach(object -> s3Client.deleteObject(DeleteObjectRequest.builder()
							.bucket(location.bucket)
							.key(object.key())
							.build()));
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	private S3Location parseS3Location(String fileUrl) {
		if (fileUrl == null || fileUrl.isBlank()) {
			return null;
		}

		try {
			URI uri = URI.create(fileUrl);
			String host = uri.getHost();
			if (host == null || !host.contains(".s3.")) {
				return null;
			}

			String bucket = host.substring(0, host.indexOf(".s3."));
			String key = uri.getPath();
			if (key == null || key.length() <= 1) {
				return null;
			}

			return new S3Location(bucket, key.substring(1));
		} catch (Exception e) {
			return null;
		}
	}

	private static class S3Location {
		private final String bucket;
		private final String key;

		private S3Location(String bucket, String key) {
			this.bucket = bucket;
			this.key = key;
		}
	}
	

	@Override
	public Course addCourse(Course course,MultipartFile file){
		Course savedCourse = courseRepo.save(course);

		if (file == null || file.isEmpty()) {
			return savedCourse;
		}

		try {
			String originalFilename = file.getOriginalFilename();
			String cleanFileName = org.springframework.util.StringUtils.cleanPath(
					originalFilename == null ? "syllabus" : originalFilename
			);
			String fileExtension = "";
			int extensionIndex = cleanFileName.lastIndexOf(".");
			if (extensionIndex >= 0) {
				fileExtension = cleanFileName.substring(extensionIndex);
			}

			String courseName = savedCourse.getName() == null ? "course" : savedCourse.getName();
			String safeCourseName = courseName.trim().replaceAll("[^a-zA-Z0-9]", "_");
			String key = "syllabus/" + savedCourse.getId() + "/" + safeCourseName + fileExtension;
			String bucketName = environment.getRequiredProperty("aws.bucketName");
			String region = environment.getRequiredProperty("aws.region");
			String contentType = file.getContentType() == null ? "application/octet-stream" : file.getContentType();

			PutObjectRequest putObjectRequest = PutObjectRequest.builder()
					.bucket(bucketName)
					.key(key)
					.contentType(contentType)
					.contentDisposition("inline")
					.build();

			s3Client.putObject(
					putObjectRequest,
					RequestBody.fromInputStream(file.getInputStream(), file.getSize())
			);

			String fileUrl = "https://"
					+ bucketName
					+ ".s3."
					+ region
					+ ".amazonaws.com/"
					+ key;

			savedCourse.setSyllabusFilePath(fileUrl);
			return courseRepo.save(savedCourse);
		} catch (IOException e) {
			throw new RuntimeException("Failed to upload syllabus file", e);
		}
		
	}

	@Override
	@Transactional
	public Course updateCourse(Course course, MultipartFile file) {
		Course existing = courseRepo.findById(course.getId())
				.orElseThrow(() -> new UserException("Course not found with id: " + course.getId()));

		existing.setName(course.getName());
		existing.setDuration(course.getDuration());
		existing.setFee(course.getFee());

		if (existing.getSubjects() != null) {
			subjectRepo.deleteAll(new ArrayList<>(existing.getSubjects()));
			existing.getSubjects().clear();
		}

		Course savedCourse = courseRepo.save(existing);
		if (file == null || file.isEmpty()) {
			return savedCourse;
		}

		deleteS3Object(savedCourse.getSyllabusFilePath());
		return addCourse(savedCourse, file);
	}

	@Override
	public SubjectList addSubject(SubjectList subjectList){
		return subjectListRepo.save(subjectList);
	}

	@Override
	public SubjectList updateSubject(SubjectList subjectList){
		SubjectList existing = subjectListRepo.findById(subjectList.getId())
				.orElseThrow(() -> new UserException("Subject not found with id: " + subjectList.getId()));
		String previousName = existing.getName();
		existing.setName(subjectList.getName());
		SubjectList savedSubject = subjectListRepo.save(existing);
		for (Subject courseSubject : subjectRepo.findAllByName(previousName)) {
			courseSubject.setName(savedSubject.getName());
			subjectRepo.save(courseSubject);
		}
		return savedSubject;
	}
	
	@Override
	public Subject getSubjectByName(String name) {
		return subjectRepo.findByName(name);
	}
	@Override
	public List<SubjectList> findSubjectByIds(List<Long> ids){
		 List<SubjectList> allById = subjectListRepo.findAllById(ids);
		 return allById;
	}
	
	@Override
	public List<SubjectList> getAllSubjects(){
		 List<SubjectList> subs = subjectListRepo.findAll();
		 return subs;
	}
	
	public Page<Lecturer> getAllLecturers(int pageNumber,int pageSize){
		PageRequest page = PageRequest.of(pageNumber, pageSize);
		Page<Lecturer> lecturers = lecturerRepo.findAll(page);
		return lecturers;
	}
	
	public Page<Lecturer> searchLecturer(@RequestParam("key") String keyword,int pagenumber,int pageSize){
		 PageRequest page = PageRequest.of(pagenumber, pageSize);
		Page<Lecturer> lecturers;
		 if (keyword == null || keyword.trim().isEmpty()) {
			 lecturers= lecturerRepo.findAll(page);
	        }
		 else {
			
			 lecturers=lecturerRepo.findByUser_NameContainingIgnoreCase(keyword, page);
	        
		 }
		  
		 return lecturers;
	    }
	
	public Page<Student> searchStudents(@RequestParam("key") String keyword,int pagenumber,int pageSize){
		 PageRequest page = PageRequest.of(pagenumber, pageSize);
		Page<Student> students;
		 if (keyword == null || keyword.trim().isEmpty()) {
			 students=studentRepo.findVisibleStudents(page);
	        }
		 else {
			
			 students=studentRepo.findVisibleStudentsByName(keyword, page);
	        
		 }
		  
		 return students;
	    }
	
	
	public List<Lecturer> getBatchLecturer(@RequestParam Long batchId){
		  List<Lecturer> lecturers = lecturerRepo.findByBatchId(batchId);
		  return lecturers;
	}
	
	@Override
	public List<PurchaseOrder> getAllPos(){
	
		List<PurchaseOrder> pos = purchaseOrderRepo.findAll( Sort.by(Sort.Direction.DESC, "batch.startDate"));
		return pos;
	}
	
	
	public Page<Student> getStudents(int pageNumber,int pageSize){
		
		   PageRequest page = PageRequest.of(pageNumber, pageSize);
		   Page<Student> stds = studentRepo.findVisibleStudents(page);
		   return stds;
	}

	@Override
	public Map<String, Object> getStudentDetails(Long studentId) {
		Student student = studentRepo.findById(studentId)
				.orElseThrow(() -> new UserException("Student not found with id: " + studentId));
		return studentPayload(student, true);
	}

	@Override
	public Map<String, Object> getStudentsByBatch(Long batchId, int pageNumber, int pageSize) {
		Batch batch = batchRepo.findById(batchId)
				.orElseThrow(() -> new UserException("Batch not found with id: " + batchId));
		Page<Student> students = studentRepo.findActiveRecordsByBatchId(
				batchId,
				PageRequest.of(pageNumber, pageSize)
		);

		Map<String, Object> payload = new HashMap<>();
		payload.put("batch", batchPayload(batch));
		payload.put("content", students.getContent().stream().map(student -> studentPayload(student, false)).toList());
		payload.put("number", students.getNumber());
		payload.put("totalPages", students.getTotalPages());
		payload.put("totalElements", students.getTotalElements());
		return payload;
	}

	@Override
	public Map<String, Object> getBatchStudentOptions(String status, int pageNumber, int pageSize) {
		List<Map<String, Object>> batches = batchRepo.findAll().stream()
				.filter(batch -> {
					boolean active = isBatchActive(batch);
					if ("ACTIVE".equalsIgnoreCase(status)) {
						return active;
					}
					if ("COMPLETED".equalsIgnoreCase(status)) {
						return !active;
					}
					return true;
				})
				.sorted((left, right) -> {
					LocalDate leftStart = left.getStartDate();
					LocalDate rightStart = right.getStartDate();
					if (leftStart == null && rightStart == null) return 0;
					if (leftStart == null) return 1;
					if (rightStart == null) return -1;
					return rightStart.compareTo(leftStart);
				})
				.map(this::batchPayload)
				.toList();

		int safePageSize = Math.max(pageSize, 1);
		int safePage = Math.max(pageNumber, 0);
		int fromIndex = Math.min(safePage * safePageSize, batches.size());
		int toIndex = Math.min(fromIndex + safePageSize, batches.size());

		Map<String, Object> payload = new HashMap<>();
		payload.put("content", batches.subList(fromIndex, toIndex));
		payload.put("number", safePage);
		payload.put("totalPages", Math.max((int) Math.ceil((double) batches.size() / safePageSize), 1));
		payload.put("totalElements", batches.size());
		return payload;
	}

	@Override
	public String setStudentActive(Long studentId, boolean active) {
		Student student = studentRepo.findById(studentId)
				.orElseThrow(() -> new UserException("Student not found with id: " + studentId));
		student.setActive(active);
		student.setDeactivatedAt(active ? null : LocalDateTime.now());
		User user = student.getUser();
		if (user != null) {
			user.setActive(active);
			user.setDeactivatedAt(active ? null : LocalDateTime.now());
			userRepo.save(user);
		}
		studentRepo.save(student);
		sendStudentStatusEmail(student, active ? "Your APCLOTE account has been activated." : "Your APCLOTE account has been deactivated.");
		return active ? "Student activated successfully" : "Student deactivated successfully";
	}

	@Override
	@Transactional
	public String setStudentBatchActive(Long studentId, Long batchId, boolean active) {
		Student student = studentRepo.findById(studentId)
				.orElseThrow(() -> new UserException("Student not found with id: " + studentId));
		Batch batch = batchRepo.findById(batchId)
				.orElseThrow(() -> new UserException("Batch not found with id: " + batchId));

		if (active) {
			if (student.getBatchs() == null) {
				student.setBatchs(new ArrayList<>());
			}
			if (!student.getBatchs().contains(batch)) {
				student.getBatchs().add(batch);
			}
		} else if (student.getBatchs() != null) {
			student.getBatchs().remove(batch);
		}

		studentRepo.save(student);
		sendStudentStatusEmail(
				student,
				active
						? "Your access to batch " + batch.getName() + " has been activated."
						: "Your access to batch " + batch.getName() + " has been deactivated."
		);
		return active ? "Student batch access activated successfully" : "Student batch access deactivated successfully";
	}

	@Override
	public String softDeleteStudent(Long studentId) {
		Student student = studentRepo.findById(studentId)
				.orElseThrow(() -> new UserException("Student not found with id: " + studentId));
		student.setDeleted(true);
		student.setActive(false);
		student.setDeletedAt(LocalDateTime.now());
		student.setDeactivatedAt(LocalDateTime.now());
		User user = student.getUser();
		if (user != null) {
			user.setActive(false);
			user.setDeleted(true);
			user.setDeactivatedAt(LocalDateTime.now());
			userRepo.save(user);
		}
		studentRepo.save(student);
		sendStudentStatusEmail(student, "Your APCLOTE student profile has been deleted by admin.");
		return "Student deleted successfully";
	}

	private Map<String, Object> studentPayload(Student student, boolean includeDashboardLinks) {
		Map<String, Object> payload = new HashMap<>();
		payload.put("id", student.getId());
		payload.put("active", student.getActive() == null || student.getActive());
		payload.put("deleted", student.getDeleted() != null && student.getDeleted());
		payload.put("deactivatedAt", student.getDeactivatedAt());
		payload.put("deletedAt", student.getDeletedAt());
		payload.put("uniqueKey", student.getUniqueKey());

		if (student.getUser() != null) {
			Map<String, Object> user = new HashMap<>();
			user.put("id", student.getUser().getId());
			user.put("name", student.getUser().getName());
			user.put("email", student.getUser().getEmail());
			user.put("phone", student.getUser().getPhono());
			user.put("address", student.getUser().getAddress());
			user.put("role", student.getUser().getRole());
			user.put("memberSince", student.getUser().getCreatedAt());
			payload.put("user", user);
		}

		payload.put("batches", student.getBatchs() == null ? List.of() : student.getBatchs().stream().map(this::batchPayload).toList());
		payload.put("batchValidyDate", student.getBatchValidyDate());
		payload.put("purchaseOrders", student.getPurchaseOrder() == null ? List.of() : student.getPurchaseOrder().stream().map(this::purchaseOrderPayload).toList());
		payload.put("dashboardAvailable", includeDashboardLinks);
		return payload;
	}

	private Map<String, Object> batchPayload(Batch batch) {
		Map<String, Object> payload = new HashMap<>();
		payload.put("id", batch.getId());
		payload.put("name", batch.getName());
		payload.put("startDate", batch.getStartDate());
		payload.put("endDate", calculateBatchEndDate(batch));
		payload.put("status", isBatchActive(batch) ? "ACTIVE" : "COMPLETED");
		payload.put("courseName", batch.getCourse() == null ? null : batch.getCourse().getName());
		return payload;
	}

	private Map<String, Object> purchaseOrderPayload(PurchaseOrder purchaseOrder) {
		Map<String, Object> payload = new HashMap<>();
		payload.put("id", purchaseOrder.getId());
		payload.put("fee", purchaseOrder.getFee());
		payload.put("status", purchaseOrder.getStatus());
		payload.put("purchaseDate", purchaseOrder.getPurchaseDate());
		payload.put("batch", purchaseOrder.getBatch() == null ? null : batchPayload(purchaseOrder.getBatch()));
		return payload;
	}

	private void sendStudentStatusEmail(Student student, String message) {
		if (student == null || student.getUser() == null || student.getUser().getEmail() == null) {
			return;
		}

		try {
			emailService.sendEmail(
					student.getUser().getEmail(),
					"APCLOTE student account update",
					"Dear " + student.getUser().getName() + ",\n\n" + message + "\n\nRegards,\nAPCLOTE Admin Team"
			);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	
	
	
	
	
	
	
	
	public List<Course> getAllCourses(){
		return courseRepo.findAll(); 
	}

}


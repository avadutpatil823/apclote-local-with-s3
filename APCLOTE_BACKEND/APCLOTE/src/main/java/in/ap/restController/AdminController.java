package in.ap.restController;

import java.awt.PageAttributes.MediaType;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.introspect.TypeResolutionContext.Empty;

import in.ap.entity.AdminLog;
import in.ap.entity.Batch;
import in.ap.entity.ClassRoom;
import in.ap.entity.Course;
import in.ap.entity.DeleteRequest;
import in.ap.entity.Lecturer;
import in.ap.entity.PurchaseOrder;
import in.ap.entity.Student;
import in.ap.entity.Subject;
import in.ap.entity.SubjectList;
import in.ap.entity.User;
import in.ap.helper.EmailService;
import in.ap.helper.UserException;
import in.ap.repo.BatchRepo;
import in.ap.repo.AdminLogRepo;
import in.ap.repo.CourseRepo;
import in.ap.repo.SubjectListRepo;
import in.ap.repo.SubjectRepo;
import in.ap.repo.UserRepo;
import in.ap.service.AdminService;
import in.ap.service.LecturerService;
import in.ap.service.UserService;
import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/admin")
public class AdminController {
	private static final Logger monitorLog = LoggerFactory.getLogger("APCLOTE_MONITOR");
	private AdminService adminService;
	private LecturerService lecturerService;
	private UserService userService;
	private SubjectRepo subjectRepo;
	private BatchRepo batchRepo;
	private CourseRepo courseRepo;
	private SubjectListRepo subjectListRepo;
	private UserRepo userRepo;
	private AdminLogRepo adminLogRepo;
	private PasswordEncoder passwordEncoder;
	private EmailService emailService;

	
	
	@PostMapping(value="/createBatch", consumes = org.springframework.http.MediaType.APPLICATION_JSON_VALUE,
	        produces = org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<?> createbatch(@RequestBody Batch batch) {
		requireAdminAccess("CREATE", "BATCH");
		if (batchRepo.findByName(batch.getName()) != null) {
			throw new UserException("Batch already exists with this name: " + batch.getName(), HttpStatus.CONFLICT);
		}
		Batch savedBatch = adminService.createBatch(batch);
		writeAdminLog("CREATE", "BATCH", savedBatch.getName(), "Created batch");
		return new ResponseEntity(savedBatch, HttpStatus.CREATED);	
	}

	@PutMapping(value="/updateBatch", consumes = org.springframework.http.MediaType.APPLICATION_JSON_VALUE,
	        produces = org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<?> updateBatch(@RequestBody Batch batch) {
		requireAdminAccess("UPDATE", "BATCH");
		Batch existingBatch = batchRepo.findByName(batch.getName());
		if (existingBatch != null && !existingBatch.getId().equals(batch.getId())) {
			throw new UserException("Batch already exists with this name: " + batch.getName(), HttpStatus.CONFLICT);
		}
		Batch savedBatch = adminService.updateBatch(batch);
		writeAdminLog("UPDATE", "BATCH", savedBatch.getName(), "Updated batch");
		return new ResponseEntity<Batch>(savedBatch, HttpStatus.OK);
	}
	
	@PostMapping(value="/createLecturer", consumes = "application/json")
	public ResponseEntity<Lecturer> createLecturer(@RequestBody Lecturer lecturer,@RequestParam("userId")Long userId,@RequestParam(value = "sender", required = false)String senderKey) throws UserException{
		requireAdminAccess("CREATE", "LECTURER");
		Lecturer lecturer1 = adminService.createLecurer(lecturer, userId,senderKey);
		writeAdminLog("CREATE", "LECTURER", lecturer1.getUser() != null ? lecturer1.getUser().getEmail() : String.valueOf(lecturer1.getId()), "Created lecturer");
		return new ResponseEntity<Lecturer>(lecturer1, HttpStatus.CREATED);
	}
	
	@PostMapping(value="/updateLecturer", consumes = "application/json")
	public ResponseEntity<Lecturer> updateLecturer(@RequestBody Lecturer lecturer) throws UserException{
		requireRootOrFullAdmin();
		Lecturer lecturer1 = adminService.updateLecturer(lecturer);
		writeAdminLog("UPDATE", "LECTURER", lecturer1.getUser() != null ? lecturer1.getUser().getEmail() : String.valueOf(lecturer1.getId()), "Updated lecturer");
		return new ResponseEntity<Lecturer>(lecturer1, HttpStatus.CREATED);
	}
	
	@GetMapping(value="/deleteLecturer")
	public ResponseEntity<String> deleteLecturer(@RequestParam("lecturerId")Long lecturerId) throws UserException{
		requireAdminAccess("DELETE", "LECTURER");
		String msg = adminService.deleteLecturer(lecturerId);
		writeAdminLog("DELETE", "LECTURER", String.valueOf(lecturerId), msg);
		return new ResponseEntity<String>(msg, HttpStatus.CREATED);
	}

	@DeleteMapping("/deleteSubject")
	public ResponseEntity<String> deleteSubject(@RequestParam("subjectId") Long subjectId) {
		requireAdminAccess("DELETE", "SUBJECT");
		String msg = adminService.deleteSubject(subjectId);
		writeAdminLog("DELETE", "SUBJECT", String.valueOf(subjectId), msg);
		return new ResponseEntity<String>(msg, HttpStatus.OK);
	}

	@DeleteMapping("/deleteCourse")
	public ResponseEntity<String> deleteCourse(@RequestParam("courseId") Long courseId) {
		requireAdminAccess("DELETE", "COURSE");
		String msg = adminService.deleteCourse(courseId);
		writeAdminLog("DELETE", "COURSE", String.valueOf(courseId), msg);
		return new ResponseEntity<String>(msg, HttpStatus.OK);
	}

	@DeleteMapping("/deleteBatch")
	public ResponseEntity<String> deleteBatch(@RequestParam("batchId") Long batchId) {
		requireAdminAccess("DELETE", "BATCH");
		String msg = adminService.deleteBatch(batchId);
		writeAdminLog("DELETE", "BATCH", String.valueOf(batchId), msg);
		return new ResponseEntity<String>(msg, HttpStatus.OK);
	}

	@DeleteMapping("/deleteClassRoom")
	public ResponseEntity<String> deleteClassRoom(@RequestParam("classRoomId") Long classRoomId) {
		return new ResponseEntity<String>(adminService.deleteClassRoom(classRoomId), HttpStatus.OK);
	}

	@DeleteMapping("/deleteClass")
	public ResponseEntity<String> deleteClass(@RequestParam("classId") Long classId) {
		return new ResponseEntity<String>(adminService.deleteClass(classId), HttpStatus.OK);
	}

	@DeleteMapping("/deleteVideo")
	public ResponseEntity<String> deleteVideo(@RequestParam("videoId") Long videoId) {
		return new ResponseEntity<String>(adminService.deleteVideo(videoId), HttpStatus.OK);
	}

	@DeleteMapping("/deleteNotes")
	public ResponseEntity<String> deleteNotes(@RequestParam("notesId") Long notesId) {
		return new ResponseEntity<String>(adminService.deleteNotes(notesId), HttpStatus.OK);
	}

	@DeleteMapping("/deleteTest")
	public ResponseEntity<String> deleteTest(@RequestParam("testId") Long testId) {
		return new ResponseEntity<String>(adminService.deleteTest(testId), HttpStatus.OK);
	}

	@GetMapping("/deleteRequests")
	public ResponseEntity<Page<DeleteRequest>> getDeleteRequests(
			@RequestParam(defaultValue = "PENDING") String status,
			@RequestParam(defaultValue = "0") int pageNumber,
			@RequestParam(defaultValue = "10") int pageSize) {
		requireDeleteAdminAccess();
		return new ResponseEntity<Page<DeleteRequest>>(adminService.getDeleteRequests(status, pageNumber, pageSize), HttpStatus.OK);
	}

	@GetMapping("/deleteRequests/find")
	public ResponseEntity<DeleteRequest> getDeleteRequest(@RequestParam Long requestId) {
		requireDeleteAdminAccess();
		return new ResponseEntity<DeleteRequest>(adminService.getDeleteRequest(requestId), HttpStatus.OK);
	}

	@DeleteMapping("/deleteRequests/approve")
	public ResponseEntity<String> approveDeleteRequest(@RequestParam Long requestId) {
		DeleteRequest request = adminService.getDeleteRequest(requestId);
		requireAdminAccess("DELETE", String.valueOf(request.getResourceType()).toUpperCase());
		String msg = adminService.approveDeleteRequest(requestId);
		writeAdminLog("DELETE", "DELETE_REQUEST", String.valueOf(requestId), msg);
		return new ResponseEntity<String>(msg, HttpStatus.OK);
	}
	
	
	
	@GetMapping("/assign")
	private ResponseEntity<?> assignsBatchandSubjectToLecturer(@RequestParam("batchId")Long batchId,
			@RequestParam("subjectId")Long subjectId,@RequestParam("lecturerId")Long lecturerId){
		requireRootOrFullAdmin();
		Map<String, Object> conflict = adminService.getAssignmentConflict(batchId, subjectId);
		if (conflict != null) {
			conflict.put(
					"message",
					conflict.get("subjectName") + " subject in "
							+ conflict.get("batchName") + " batch is assigned to "
							+ conflict.get("lecturerName") + " lecturer"
			);
			throw new UserException(String.valueOf(conflict.get("message")), HttpStatus.CONFLICT);
		}
		String msg = adminService.assignBatchAndSubjects(batchId, subjectId, lecturerId);
		writeAdminLog("ASSIGN", "LECTURER", String.valueOf(lecturerId), "Assigned lecturer to batch " + batchId + " subject " + subjectId);
		return new ResponseEntity<String>(msg, HttpStatus.OK);
	}

	@GetMapping("/lecturerDetails")
	public ResponseEntity<Map<String, Object>> lecturerDetails(@RequestParam Long lecturerId) {
		return new ResponseEntity<Map<String, Object>>(adminService.getLecturerDetails(lecturerId), HttpStatus.OK);
	}

	@DeleteMapping("/disassignLecturer")
	public ResponseEntity<String> disassignLecturer(@RequestParam Long assignmentId) {
		return new ResponseEntity<String>(adminService.disassignLecturerFromBatchSubject(assignmentId), HttpStatus.OK);
	}
	
	@GetMapping("/getAllLecturers")
	public ResponseEntity<Page<Lecturer>> getAllLecturers(@RequestParam int pageNumber,@RequestParam int pageSize){
		requireRootOrFullAdmin();
		Page<Lecturer> alllecturers = adminService.getAllLecturers(pageNumber-1, pageSize);
		
			
		
		return new ResponseEntity<Page<Lecturer>>(alllecturers, HttpStatus.OK);
	}
	
	@GetMapping("/getSearchLecturers")
	public ResponseEntity<Page<Lecturer>> serachedLecturers(@RequestParam int pageNumber,@RequestParam int pageSize,@RequestParam String key){
		
		Page<Lecturer> alllecturers = adminService.searchLecturer(key,pageNumber-1, pageSize);
		return new ResponseEntity<Page<Lecturer>>(alllecturers, HttpStatus.OK);
	}
	
	@GetMapping("/getBatchLecturers")
	public ResponseEntity<List<Lecturer>> batchLecturers(@RequestParam Long batchId){
		
		List<Lecturer> alllecturers = adminService.getBatchLecturer(batchId);
		return new ResponseEntity<List<Lecturer>>(alllecturers, HttpStatus.OK);
	}
	
	@GetMapping("/getStudents")
	public ResponseEntity<Page<Student>> getStudents(@RequestParam int pageNumber,@RequestParam int pageSize){
		requireRootOrFullAdmin();
		
		Page<Student> stds = adminService.getStudents(pageNumber-1, pageSize);
		List<Student> updatedStudents=new ArrayList<>();
		for (Student student : stds.getContent()) {
			
			student.setBatchs(null);
			student.setPurchaseOrder(null);
			updatedStudents.add(student);
		}
		   Page secureStudents = new PageImpl(
			        updatedStudents,
			        stds.getPageable(),
			        stds.getTotalElements()
			    );
		return new ResponseEntity<Page<Student>>(secureStudents, HttpStatus.OK);
	}
	
	@GetMapping("/getSearchedStudents")
	public ResponseEntity<Page<Student>> getStudents(@RequestParam int pageNumber,@RequestParam int pageSize,@RequestParam String key){
		requireRootOrFullAdmin();
		
		Page<Student> stds = adminService.searchStudents(key,pageNumber-1, pageSize);
		List<Student> updatedStudents=new ArrayList<>();
		for (Student student : stds.getContent()) {
			
			student.setBatchs(null);
			student.setPurchaseOrder(null);
			updatedStudents.add(student);
		}
		   Page secureStudents = new PageImpl( updatedStudents, stds.getPageable(), stds.getTotalElements() );
		return new ResponseEntity<Page<Student>>(secureStudents, HttpStatus.OK);
	}

	@GetMapping("/studentDetails")
	public ResponseEntity<Map<String, Object>> studentDetails(@RequestParam Long studentId) {
		return new ResponseEntity<Map<String, Object>>(adminService.getStudentDetails(studentId), HttpStatus.OK);
	}

	@GetMapping("/studentBatchOptions")
	public ResponseEntity<Map<String, Object>> studentBatchOptions(
			@RequestParam(defaultValue = "ACTIVE") String status,
			@RequestParam int pageNumber,
			@RequestParam int pageSize) {
		return new ResponseEntity<Map<String, Object>>(
				adminService.getBatchStudentOptions(status, pageNumber - 1, pageSize),
				HttpStatus.OK
		);
	}

	@GetMapping("/studentsByBatch")
	public ResponseEntity<Map<String, Object>> studentsByBatch(
			@RequestParam Long batchId,
			@RequestParam int pageNumber,
			@RequestParam int pageSize) {
		return new ResponseEntity<Map<String, Object>>(
				adminService.getStudentsByBatch(batchId, pageNumber - 1, pageSize),
				HttpStatus.OK
		);
	}

	@PostMapping("/studentStatus")
	public ResponseEntity<String> studentStatus(@RequestParam Long studentId, @RequestParam boolean active) {
		return new ResponseEntity<String>(adminService.setStudentActive(studentId, active), HttpStatus.OK);
	}

	@PostMapping("/studentBatchStatus")
	public ResponseEntity<String> studentBatchStatus(
			@RequestParam Long studentId,
			@RequestParam Long batchId,
			@RequestParam boolean active) {
		return new ResponseEntity<String>(adminService.setStudentBatchActive(studentId, batchId, active), HttpStatus.OK);
	}

	@DeleteMapping("/softDeleteStudent")
	public ResponseEntity<String> softDeleteStudent(@RequestParam Long studentId) {
		return new ResponseEntity<String>(adminService.softDeleteStudent(studentId), HttpStatus.OK);
	}
	
	@GetMapping("/getAllUsers")
	public ResponseEntity<Page<User>> getAllUsers(
			@RequestParam(defaultValue = "1") int pageNumber,
			@RequestParam(defaultValue = "20") int pageSize){
		requireRootOrFullAdmin();
		Page<User> users = userRepo.findVisibleUsers(PageRequest.of(Math.max(pageNumber - 1, 0), pageSize, Sort.by(Sort.Direction.DESC, "createdAt")));
		return new ResponseEntity<Page<User>>(users, HttpStatus.OK);
	}

	@PostMapping("/userStatus")
	public ResponseEntity<String> userStatus(@RequestParam Long userId, @RequestParam boolean active) {
		requireRootOrFullAdmin();
		User target = userRepo.findById(userId).orElseThrow(() -> new UserException("User not found", HttpStatus.NOT_FOUND));
		target.setActive(active);
		target.setDeactivatedAt(active ? null : LocalDateTime.now());
		userRepo.save(target);
		writeAdminLog(active ? "ACTIVATE" : "DEACTIVATE", "USER", target.getEmail(), active ? "Activated user" : "Deactivated user");
		return new ResponseEntity<String>(active ? "User activated successfully" : "User deactivated successfully", HttpStatus.OK);
	}

	@DeleteMapping("/deleteUser")
	public ResponseEntity<String> deleteUser(@RequestParam Long userId) {
		requireRootOrFullAdmin();
		User target = userRepo.findById(userId).orElseThrow(() -> new UserException("User not found", HttpStatus.NOT_FOUND));
		target.setDeleted(true);
		target.setActive(false);
		target.setDeactivatedAt(LocalDateTime.now());
		userRepo.save(target);
		writeAdminLog("DELETE", "USER", target.getEmail(), "Soft deleted user");
		return new ResponseEntity<String>("User deleted successfully", HttpStatus.OK);
	}
	
	@GetMapping("/getAllCourses")
	public ResponseEntity<List<Course>> getAllCourses(){
		return new ResponseEntity<List<Course>>(adminService.getAllCourses(), HttpStatus.OK);
	}
	
	
//	@GetMapping("/getBatchs")
//	public ResponseEntity<List<Batch>> getAllBatchs(){
//		return new ResponseEntity<List<Batch>>(userService.getAllBatches(), HttpStatus.OK);
//	}
	
	@GetMapping("/getAllPos")
	public ResponseEntity<List<PurchaseOrder>> getAllPos(){
		return new ResponseEntity<List<PurchaseOrder>>(adminService.getAllPos(), HttpStatus.OK);
	}
	
	@PostMapping(value = "/createCourse",consumes = "multipart/form-data")
	public ResponseEntity<?> addCourse(@RequestPart("course") Course course,@RequestPart(value = "file", required = false) MultipartFile file) throws IOException{
		requireAdminAccess("CREATE", "COURSE");
		if (courseRepo.findByName(course.getName()) != null) {
			throw new UserException("Course already exists with this name: " + course.getName(), HttpStatus.CONFLICT);
		}
	      List<Long> ids=new ArrayList<>();
		for (Subject subject:course.getSubjects()) {
			   if(subject.getId()!=null) {
				   ids.add(subject.getId());
			   }
		}
		course.setSubjects(new ArrayList<>());
		Course course1 = adminService.addCourse(course,file);
		writeAdminLog("CREATE", "COURSE", course1.getName(), "Created course");
		List<SubjectList> subjects = adminService.findSubjectByIds(ids);
		
		for (SubjectList subjectList:subjects) {
			Subject subject = new Subject();
			   if(subjectList.getId()!=null) {
				  subject.setCourse(course1);
				  subject.setName(subjectList.getName());
				  Subject savedSubject = subjectRepo.save(subject);
				   
				  course1.getSubjects().add(savedSubject);
				  
			   }
		}
		
	  Course course2 = adminService.addCourse(course1,null);
	  //System.out.println(course2.getSubjects());
	  return new ResponseEntity<Course>(course2, HttpStatus.CREATED);
	
	}

	@PutMapping(value = "/updateCourse", consumes = "multipart/form-data")
	public ResponseEntity<?> updateCourse(@RequestPart("course") Course course,@RequestPart(value = "file", required = false) MultipartFile file) throws IOException{
		requireAdminAccess("UPDATE", "COURSE");
		Course existingCourse = courseRepo.findByName(course.getName());
		if (existingCourse != null && !existingCourse.getId().equals(course.getId())) {
			throw new UserException("Course already exists with this name: " + course.getName(), HttpStatus.CONFLICT);
		}
		List<Long> ids=new ArrayList<>();
		for (Subject subject:course.getSubjects()) {
			   if(subject.getId()!=null) {
				   ids.add(subject.getId());
			   }
		}
		course.setSubjects(new ArrayList<>());
		Course savedCourse = adminService.updateCourse(course,file);
		List<SubjectList> subjects = adminService.findSubjectByIds(ids);
		
		for (SubjectList subjectList:subjects) {
			Subject subject = new Subject();
			   if(subjectList.getId()!=null) {
				  subject.setCourse(savedCourse);
				  subject.setName(subjectList.getName());
				  Subject savedSubject = subjectRepo.save(subject);
				  savedCourse.getSubjects().add(savedSubject);
			   }
		}
		
		Course updatedCourse = adminService.addCourse(savedCourse,null);
		writeAdminLog("UPDATE", "COURSE", updatedCourse.getName(), "Updated course");
		return new ResponseEntity<Course>(updatedCourse, HttpStatus.OK);
	}

	@PostMapping("/addSubjectToList")
	public ResponseEntity<?> addSubject(@RequestBody SubjectList subjectList){
		requireAdminAccess("CREATE", "SUBJECT");
		if (subjectListRepo.findByName(subjectList.getName()) != null) {
			throw new UserException("Subject already exists with this name: " + subjectList.getName(), HttpStatus.CONFLICT);
		}
		
		SubjectList subject2 = adminService.addSubject(subjectList);
		writeAdminLog("CREATE", "SUBJECT", subject2.getName(), "Created subject");
		return new ResponseEntity<SubjectList>(subject2, HttpStatus.CREATED);
	}

	@PutMapping("/updateSubject")
	public ResponseEntity<?> updateSubject(@RequestBody SubjectList subjectList){
		requireAdminAccess("UPDATE", "SUBJECT");
		SubjectList existingSubject = subjectListRepo.findByName(subjectList.getName());
		if (existingSubject != null && !existingSubject.getId().equals(subjectList.getId())) {
			throw new UserException("Subject already exists with this name: " + subjectList.getName(), HttpStatus.CONFLICT);
		}
		SubjectList subject2 = adminService.updateSubject(subjectList);
		writeAdminLog("UPDATE", "SUBJECT", subject2.getName(), "Updated subject");
		return new ResponseEntity<SubjectList>(subject2, HttpStatus.OK);
	}

	@GetMapping("/getAllSubjects")
	public ResponseEntity<List<SubjectList>> getSubjects(){
		List<SubjectList> subjects = adminService.getAllSubjects();
		return new ResponseEntity<List<SubjectList>>(subjects, HttpStatus.ACCEPTED);
	}
	private User currentAdmin() {
		String email = SecurityContextHolder.getContext().getAuthentication().getName();
		User user = userRepo.findByEmail(email);
		if (user == null || !"ROLE_ADMIN".equals(user.getRole())) {
			throw new UserException("Admin access required", HttpStatus.FORBIDDEN);
		}
		return user;
	}

	private boolean isRootAdmin(User user) {
		return user != null && "ROLE_ADMIN".equals(user.getRole()) && !Boolean.TRUE.equals(user.getSubAdmin());
	}

	private boolean isFullAdmin(User user) {
		return isRootAdmin(user) || (Boolean.TRUE.equals(user.getSubAdmin()) && "FULL".equalsIgnoreCase(user.getAdminAction()) && adminResourceMatches(user.getAdminResourceType(), "ALL"));
	}

	private void requireRootAdmin() {
		if (!isRootAdmin(currentAdmin())) {
			throw new UserException("Only root admin can perform this action", HttpStatus.FORBIDDEN);
		}
	}

	private void requireRootOrFullAdmin() {
		if (!isFullAdmin(currentAdmin())) {
			throw new UserException("Full admin access required", HttpStatus.FORBIDDEN);
		}
	}

	private void requireAdminAccess(String action, String resourceType) {
		User admin = currentAdmin();
		if (isFullAdmin(admin)) {
			return;
		}

		if (!Boolean.TRUE.equals(admin.getSubAdmin())) {
			return;
		}

		boolean actionAllowed = action.equalsIgnoreCase(admin.getAdminAction())
				|| ("FULL".equalsIgnoreCase(admin.getAdminAction()) && ("CREATE".equalsIgnoreCase(action) || "UPDATE".equalsIgnoreCase(action) || "DELETE".equalsIgnoreCase(action)))
				|| ("CREATE".equalsIgnoreCase(admin.getAdminAction()) && "UPDATE".equalsIgnoreCase(action))
				|| ("READ".equalsIgnoreCase(action) && ("CREATE".equalsIgnoreCase(admin.getAdminAction()) || "DELETE".equalsIgnoreCase(admin.getAdminAction())));
		boolean resourceAllowed = adminResourceMatches(admin.getAdminResourceType(), resourceType);
		if (!actionAllowed || !resourceAllowed) {
			throw new UserException(action + " access required for " + resourceType, HttpStatus.FORBIDDEN);
		}
	}

	private boolean adminResourceMatches(String adminResourceType, String resourceType) {
		String normalizedType = String.valueOf(resourceType).trim().toUpperCase();
		return Arrays.stream(String.valueOf(adminResourceType == null ? "" : adminResourceType).split(","))
				.map(String::trim)
				.map(String::toUpperCase)
				.anyMatch(item -> "ALL".equals(item) || normalizedType.equals(item));
	}

	private String normalizeAdminResourceTypes(String value) {
		String normalized = String.valueOf(value == null || value.isBlank() ? "ALL" : value)
				.toUpperCase()
				.replaceAll("\\s+", "");
		return normalized.isBlank() ? "ALL" : normalized;
	}

	private void requireDeleteAdminAccess() {
		User admin = currentAdmin();
		if (isFullAdmin(admin)) {
			return;
		}
		if (!Boolean.TRUE.equals(admin.getSubAdmin()) || (!"DELETE".equalsIgnoreCase(admin.getAdminAction()) && !"FULL".equalsIgnoreCase(admin.getAdminAction()))) {
			throw new UserException("Delete admin access required", HttpStatus.FORBIDDEN);
		}
	}

	private void writeAdminLog(String action, String resourceType, String resourceName, String details) {
		try {
			User actor = currentAdmin();
			AdminLog log = new AdminLog();
			log.setActorId(actor.getId());
			log.setActorName(actor.getName());
			log.setActorEmail(actor.getEmail());
			log.setActorRole(Boolean.TRUE.equals(actor.getSubAdmin()) ? "SUB_ADMIN" : actor.getRole());
			log.setAction(action);
			log.setResourceType(resourceType);
			log.setResourceName(resourceName);
			log.setDetails(details);
			adminLogRepo.save(log);
			monitorLog.info("event=admin_action actorId={} actorName=\"{}\" actorEmail={} actorRole={} action={} resourceType={} resourceName=\"{}\" details=\"{}\"", actor.getId(), actor.getName(), actor.getEmail(), Boolean.TRUE.equals(actor.getSubAdmin()) ? "SUB_ADMIN" : actor.getRole(), action, resourceType, resourceName, details);
		} catch (Exception error) {
			monitorLog.warn("event=admin_action_log_failed action={} resourceType={} resourceName=\"{}\" reason=\"{}\"", action, resourceType, resourceName, error.getMessage());
		}
	}

	@PostMapping("/subAdmins")
	public ResponseEntity<User> createSubAdmin(@RequestBody User subAdmin) {
		requireRootAdmin();
		if (userRepo.findByEmail(subAdmin.getEmail()) != null) {
			throw new UserException("User already exists with this email: " + subAdmin.getEmail(), HttpStatus.CONFLICT);
		}
		User creator = currentAdmin();
		subAdmin.setRole("ROLE_ADMIN");
		subAdmin.setSubAdmin(true);
		subAdmin.setAdminAction(subAdmin.getAdminAction() == null ? "READ" : subAdmin.getAdminAction().toUpperCase());
		subAdmin.setAdminResourceType(normalizeAdminResourceTypes(subAdmin.getAdminResourceType()));
		subAdmin.setCreatedByAdminId(creator.getId());
		String rawPassword = subAdmin.getPassword();
		subAdmin.setPassword(passwordEncoder.encode(subAdmin.getPassword()));
		User saved = userRepo.save(subAdmin);
		sendSubAdminWelcomeEmail(saved, rawPassword);
		writeAdminLog("CREATE", "SUB_ADMIN", saved.getEmail(), "Created sub admin with " + saved.getAdminAction() + " access for " + saved.getAdminResourceType());
		return new ResponseEntity<User>(saved, HttpStatus.CREATED);
	}

	private void sendSubAdminWelcomeEmail(User subAdmin, String rawPassword) {
		try {
			String subject = "Your APCLOTE sub admin account is ready";
			String body = "Hello " + subAdmin.getName() + ",\n\n"
					+ "Your APCLOTE sub admin account has been created.\n\n"
					+ "Email: " + subAdmin.getEmail() + "\n"
					+ "Password: " + rawPassword + "\n"
					+ "Access: " + subAdmin.getAdminAction() + " for " + subAdmin.getAdminResourceType() + "\n\n"
					+ "Please sign in and change your password if needed.\n\n"
					+ "Regards,\nAPCLOTE";
			emailService.sendEmail(subAdmin.getEmail(), subject, body);
		} catch (Exception ignored) {
		}
	}

	@GetMapping("/subAdmins")
	public ResponseEntity<List<User>> getSubAdmins() {
		requireRootAdmin();
		return new ResponseEntity<List<User>>(userRepo.findByRoleAndSubAdmin("ROLE_ADMIN", true), HttpStatus.OK);
	}

	@PutMapping("/subAdmins")
	public ResponseEntity<User> updateSubAdmin(@RequestBody User updatedSubAdmin) {
		requireRootAdmin();
		Long userId = updatedSubAdmin.getId();
		User subAdmin = userRepo.findById(userId).orElseThrow(() -> new UserException("Sub admin not found", HttpStatus.NOT_FOUND));
		if (!Boolean.TRUE.equals(subAdmin.getSubAdmin())) {
			throw new UserException("Only sub admins can be updated here", HttpStatus.BAD_REQUEST);
		}

		subAdmin.setName(updatedSubAdmin.getName());
		subAdmin.setAdminAction(updatedSubAdmin.getAdminAction() == null ? subAdmin.getAdminAction() : updatedSubAdmin.getAdminAction().toUpperCase());
		subAdmin.setAdminResourceType(normalizeAdminResourceTypes(updatedSubAdmin.getAdminResourceType()));
		User saved = userRepo.save(subAdmin);
		writeAdminLog("UPDATE", "SUB_ADMIN", saved.getEmail(), "Updated sub admin with " + saved.getAdminAction() + " access for " + saved.getAdminResourceType());
		return new ResponseEntity<User>(saved, HttpStatus.OK);
	}

	@DeleteMapping("/subAdmins")
	public ResponseEntity<String> deleteSubAdmin(@RequestParam Long userId) {
		requireRootAdmin();
		User subAdmin = userRepo.findById(userId).orElseThrow(() -> new UserException("Sub admin not found", HttpStatus.NOT_FOUND));
		if (!Boolean.TRUE.equals(subAdmin.getSubAdmin())) {
			throw new UserException("Only sub admins can be deleted here", HttpStatus.BAD_REQUEST);
		}
		userRepo.delete(subAdmin);
		writeAdminLog("DELETE", "SUB_ADMIN", subAdmin.getEmail(), "Deleted sub admin");
		return new ResponseEntity<String>("Sub admin deleted successfully", HttpStatus.OK);
	}

	@GetMapping("/adminLogs")
	public ResponseEntity<Page<AdminLog>> getAdminLogs(@RequestParam(defaultValue = "0") int pageNumber, @RequestParam(defaultValue = "20") int pageSize) {
		requireRootAdmin();
		return new ResponseEntity<Page<AdminLog>>(adminLogRepo.findAllByOrderByCreatedAtDesc(PageRequest.of(Math.max(pageNumber, 0), pageSize, Sort.by(Sort.Direction.DESC, "createdAt"))), HttpStatus.OK);
	}
}








package in.ap.restController;

import java.io.IOException;
import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import in.ap.entity.AdminLog;
import in.ap.entity.Batch;
import in.ap.entity.BatchLecturerSubjectInter;
import in.ap.entity.Class;
import in.ap.entity.ClassNotesFile;
import in.ap.entity.ClassRoom;
import in.ap.entity.ClassVideo;
import in.ap.entity.LecturerBatchSubject;
import in.ap.entity.Test;
import in.ap.repo.AdminLogRepo;
import in.ap.repo.UserRepo;
import in.ap.entity.User;
import in.ap.helper.UserException;
import in.ap.service.AdminService;
import in.ap.service.LecturerService;
import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/lecturer")
public class LecturerController {
	private static final Logger monitorLog = LoggerFactory.getLogger("APCLOTE_MONITOR");
	private LecturerService lecturerService;
	private AdminService adminService;
	private AdminLogRepo adminLogRepo;
	private UserRepo userRepo;
	@PostMapping("/createClass")
	public ResponseEntity<?> createClass(@RequestBody Class class1,Principal principal)
	{
		try {
			Class class2 = lecturerService.createClass(class1,principal);
			writeActivityLog("CREATE", "CLASS", class2.getClassName(), "Lecturer created class");
			return new ResponseEntity<Class>(class2, HttpStatus.OK);
		} catch (UserException error) {
			throw error;
		} catch (RuntimeException error) {
			return new ResponseEntity<String>(error.getMessage(), HttpStatus.BAD_REQUEST);
		}
	}
	
	@GetMapping("/getLBS")
	public ResponseEntity<List<BatchLecturerSubjectInter>> createClass()
	{
		List<BatchLecturerSubjectInter> lbs = lecturerService.getlbsOfLecturer();
		return new ResponseEntity<List<BatchLecturerSubjectInter>>(lbs, HttpStatus.OK);
	}
	
	@PostMapping(value = "/uploadVideo", consumes = "multipart/form-data")
	public ResponseEntity<String> uploadClassVideo(
	        @RequestPart("file") MultipartFile file,
	        @RequestParam("title") String title,
	        @RequestParam("classId") Long classId,
	        @RequestParam("description") String description,
	        @RequestParam("transcript") String transcript
	) throws IOException {

	    ClassVideo classVideo = new ClassVideo();
	    classVideo.setTitle(title);
	    classVideo.setDescription(description);
	    classVideo.setTranscript(transcript);

	    String msg = lecturerService.uplpoadVideo(file, classVideo, classId);
	    writeActivityLog("UPLOAD", "VIDEO", title, "Lecturer uploaded class video");

	    return new ResponseEntity<>(msg, HttpStatus.ACCEPTED);
	}
	
	@PostMapping(value = "/uploadNotes" ,consumes = "multipart/form-data")
	public ResponseEntity<String> uploadClassNotes(@RequestPart("file")MultipartFile file,@RequestParam("title")String title,@RequestParam("classId") Long classId) throws IOException{
		ClassNotesFile classNotes = new ClassNotesFile();
		classNotes.setTitle(title);
	String msg = lecturerService.uploadNotes(file, classNotes, classId);
	writeActivityLog("UPLOAD", "NOTES", title, "Lecturer uploaded class notes");
		return new ResponseEntity<String>(msg, HttpStatus.ACCEPTED);
	}
	
	@GetMapping("/createClassRoom")
	public ResponseEntity<ClassRoom> createClassRoom(
			@RequestParam("name")String name,
			@RequestParam("batchId")Long batchId,
			@RequestParam("subjectId")Long subjectId){
		ClassRoom classRoom = new ClassRoom();
		classRoom.setName(name);
		String lecturerEmail = SecurityContextHolder.getContext().getAuthentication().getName();
		ClassRoom classroom2 = adminService.createClassroom(classRoom, batchId, subjectId, lecturerEmail);
		writeActivityLog("CREATE", "CLASSROOM", classroom2.getName(), "Lecturer created classroom");
		return new ResponseEntity<ClassRoom>(classroom2, HttpStatus.CREATED);
		
	}
	
	
	@GetMapping("/getMyBatchs")
	public ResponseEntity<List<Batch>> getBatchsOfLecturer(){
		String email = SecurityContextHolder.getContext().getAuthentication().getName();
		List<Batch> batchs = lecturerService.getBatchsOFLecturer(email);
		return new ResponseEntity<List<Batch>>(batchs, HttpStatus.OK);
	}
	@PostMapping("/crateTest")
	public ResponseEntity<Test> createTest(@RequestBody Test test,@RequestParam("classId") Long classId){
		Test test2 = lecturerService.createTest(test,classId);
		writeActivityLog("CREATE", "TEST", String.valueOf(test2.getId()), "Lecturer created test");
		return new ResponseEntity<Test>(test2, HttpStatus.CREATED);
	}

	@PostMapping("/requestDelete")
	public ResponseEntity<String> requestDelete(@RequestBody Map<String, Object> request){
		String msg = lecturerService.requestDelete(request);
		writeActivityLog("REQUEST_DELETE", String.valueOf(request.get("resourceType")), String.valueOf(request.get("resourceName")), "Lecturer requested deletion");
		return new ResponseEntity<String>(msg, HttpStatus.ACCEPTED);
	}
	private void writeActivityLog(String action, String resourceType, String resourceName, String details) {
		try {
			String email = SecurityContextHolder.getContext().getAuthentication().getName();
			User actor = userRepo.findByEmail(email);
			AdminLog log = new AdminLog();
			if (actor != null) {
				log.setActorId(actor.getId());
				log.setActorName(actor.getName());
				log.setActorEmail(actor.getEmail());
				log.setActorRole(actor.getRole());
			}
			log.setAction(action);
			log.setResourceType(resourceType);
			log.setResourceName(resourceName);
			log.setDetails(details);
			adminLogRepo.save(log);
			monitorLog.info("event=lecturer_action actorId={} actorName=\"{}\" actorEmail={} actorRole={} action={} resourceType={} resourceName=\"{}\" details=\"{}\"", actor != null ? actor.getId() : null, actor != null ? actor.getName() : null, email, actor != null ? actor.getRole() : null, action, resourceType, resourceName, details);
		} catch (Exception ignored) {
		}
	}
}






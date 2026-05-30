package in.ap.service;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import in.ap.entity.Batch;
import in.ap.entity.ClassRoom;
import in.ap.entity.Course;
import in.ap.entity.DeleteRequest;
import in.ap.entity.Lecturer;
import in.ap.entity.PurchaseOrder;
import in.ap.entity.Student;
import in.ap.entity.Subject;
import in.ap.entity.SubjectList;
import in.ap.helper.UserException;

@Service
public interface AdminService {

	
	        public Batch createBatch(Batch batch);
	        public Batch updateBatch(Batch batch);
			public Lecturer createLecurer(Lecturer lecturer,Long id,String pass) throws UserException;
			public ClassRoom createClassroom(ClassRoom classRoom, Long batchId, Long subjectId, String lecturerEmail);
			String assignBatchAndSubjects(Long batchId, Long subjectId, Long lecturerId);
			Map<String, Object> getLecturerDetails(Long lecturerId);
			Map<String, Object> getAssignmentConflict(Long batchId, Long subjectId);
			String disassignLecturerFromBatchSubject(Long assignmentId);
			public Course addCourse(Course course,MultipartFile file);
			public Course updateCourse(Course course,MultipartFile file);
			public SubjectList addSubject(SubjectList subjectList);
			public SubjectList updateSubject(SubjectList subjectList);
			public Subject getSubjectByName(String name);
			public List<SubjectList> findSubjectByIds(List<Long> ids);
			public List<Course> getAllCourses();
			public List<SubjectList> getAllSubjects();
			public Page<Lecturer> getAllLecturers(int pageNumber,int pageSize);
			public List<PurchaseOrder> getAllPos();
			public Lecturer updateLecturer(Lecturer lecturer);
			public String deleteLecturer(Long lecturerId);
			public String deleteSubject(Long subjectId);
			public String deleteCourse(Long courseId);
			public String deleteBatch(Long batchId);
			public String deleteClassRoom(Long classRoomId);
			public String deleteClass(Long classId);
			public String deleteVideo(Long videoId);
			public String deleteNotes(Long notesId);
			public String deleteTest(Long testId);
			public Page<DeleteRequest> getDeleteRequests(String status, int pageNumber, int pageSize);
			public DeleteRequest getDeleteRequest(Long requestId);
			public String approveDeleteRequest(Long requestId);
			public Page<Lecturer> searchLecturer(@RequestParam("key") String keyword,int pagenumber,int pageSize);
			public List<Lecturer> getBatchLecturer(@RequestParam Long batchId);
			public Page<Student> getStudents(int pageNumber,int pageSize);
			public Page<Student> searchStudents(@RequestParam("key") String keyword,int pagenumber,int pageSize);
			public Map<String, Object> getStudentDetails(Long studentId);
			public Map<String, Object> getStudentsByBatch(Long batchId, int pageNumber, int pageSize);
			public Map<String, Object> getBatchStudentOptions(String status, int pageNumber, int pageSize);
			public String setStudentActive(Long studentId, boolean active);
			public String setStudentBatchActive(Long studentId, Long batchId, boolean active);
			public String softDeleteStudent(Long studentId);
			
			
			
}

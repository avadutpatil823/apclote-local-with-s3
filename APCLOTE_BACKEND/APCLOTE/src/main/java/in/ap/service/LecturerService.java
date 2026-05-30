package in.ap.service;

import java.io.IOException;
import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import in.ap.entity.Batch;
import in.ap.entity.BatchLecturerSubjectInter;
import in.ap.entity.Class;
import in.ap.entity.ClassNotesFile;
import in.ap.entity.ClassRoom;
import in.ap.entity.ClassVideo;
import in.ap.entity.Lecturer;
import in.ap.entity.LecturerBatchSubject;
import in.ap.entity.Test;

@Service
public interface LecturerService {

	List<Batch> getBatchsOFLecturer(String email);
	String uplpoadVideo(MultipartFile file,ClassVideo classVideo,Long classId) throws IOException;
	String uploadNotes(MultipartFile file1,ClassNotesFile classNotesFile,Long classId);
	List<Lecturer> getAlllecturers();
	Class createClass(Class class1, Principal principal);
	 public Test createTest(Test test,Long ClassId);
	 public List<BatchLecturerSubjectInter> getlbsOfLecturer();
	 public String requestDelete(Map<String, Object> request);
}

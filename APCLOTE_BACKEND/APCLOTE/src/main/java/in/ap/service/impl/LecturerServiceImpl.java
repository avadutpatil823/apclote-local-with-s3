package in.ap.service.impl;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.file.CopyOption;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import in.ap.entity.Batch;
import in.ap.entity.BatchLecturerSubjectInter;
import in.ap.entity.Class;
import in.ap.entity.ClassNotesFile;
import in.ap.entity.ClassRoom;
import in.ap.entity.ClassVideo;
import in.ap.entity.DeleteRequest;
import in.ap.entity.Lecturer;
import in.ap.entity.LecturerBatchSubject;
import in.ap.entity.Question;
import in.ap.entity.Test;
import in.ap.entity.User;
import in.ap.helper.EmailService;
import in.ap.helper.UserException;
import in.ap.repo.BatchRepo;
import in.ap.repo.ClassNotesFileRepo;
import in.ap.repo.ClassRepo;
import in.ap.repo.ClassRoomRepo;
import in.ap.repo.ClassVideoRepo;
import in.ap.repo.DeleteRequestRepo;
import in.ap.repo.LecturerBatchSubjectRepo;
import in.ap.repo.LecturerRepo;
import in.ap.repo.QuestionRepo;
import in.ap.repo.TestRepo;
import in.ap.repo.UserRepo;
import in.ap.service.LecturerService;
import io.micrometer.common.util.StringUtils;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
@Service
public class LecturerServiceImpl implements LecturerService {
	
	@Autowired
	private LecturerRepo lecturerRepo;
	@Autowired
	private UserRepo userRepo;
	@Autowired
	private ClassRepo classRepo;
	@Autowired
	private BatchRepo batchRepo;
	@Autowired
	private ClassVideoRepo classVideoRepo;
	@Autowired
	private ClassNotesFileRepo classNotesFileRepo;
	@Autowired
	private TestRepo testRepo;
	@Autowired
	private ClassRoomRepo classRoomRepo;
	@Autowired
	private QuestionRepo questionRepo;
	@Autowired
	private LecturerBatchSubjectRepo lbsRepo;
	@Autowired
	private EmailService emailService;
	@Autowired
	private DeleteRequestRepo deleteRequestRepo;
	@Autowired
	private ClassNotificationService classNotificationService;
	 @Autowired
	 private S3Client s3Client;
	
//	private final String DIR="videos/";
//	private final String FILEDIR="Notes/";
    @Value("${aws.bucketName}")
	private String bucketName;
    
    @Value("${aws.region}")
    private String region;

    @Value("${app.frontend.dev-url:http://localhost:5173}")
    private String devFrontendUrl;

    @Value("${app.frontend.prod-url:https://apclote.in}")
    private String prodFrontendUrl;
    
   

	@Override
	public List<Batch> getBatchsOFLecturer(String email) {
		User user = userRepo.findByEmail(email);
		Lecturer lecturer = lecturerRepo.findByUser(user);
		List<Batch> batchs = batchRepo.findBatchesByLecturer(lecturer.getId());
		
		List<Batch> uniqueBatches = batchs.stream()
			    .collect(Collectors.collectingAndThen(
			        Collectors.toMap(Batch::getName, batch -> batch, (b1, b2) -> b1),
			        map -> new ArrayList<>(map.values())
			    ));
		Map<Long, Set<Long>> assignedSubjectsByBatch = lbsRepo.findSubjectAssignmentsByLecturerId(lecturer.getId()).stream()
				.collect(Collectors.groupingBy(
						BatchLecturerSubjectInter::getBatchId,
						Collectors.mapping(lbs -> lbs.getSubject().getId(), Collectors.toSet())
				));

		for (Batch batch : uniqueBatches) {
			if (batch.getClassRooms() == null) {
				continue;
			}

			batch.setClassRooms(
					batch.getClassRooms().stream()
							.filter(classRoom ->
									classRoom.getSubject() != null &&
									assignedSubjectsByBatch
											.getOrDefault(batch.getId(), Set.of())
											.contains(classRoom.getSubject().getId()))
							.collect(Collectors.toList())
			);
		}
		return uniqueBatches;
	}

	@Override
	public Class createClass(Class class1,Principal principal) {
		
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		String email = authentication.getName();
		User user = userRepo.findByEmail(email);
		Lecturer lecturer = lecturerRepo.findByUser(user);
		
		class1.setLecturer(lecturer);
		ClassRoom classRoom = classRoomRepo.findById(class1.getClassRoom().getId()).get();
		if (
				classRoom.getSubject() == null ||
				!lbsRepo.existsByBatchIdAndSubjectIdAndLecturerId(
						classRoom.getBatch().getId(),
						classRoom.getSubject().getId(),
						lecturer.getId()
				)
		) {
			throw new UserException("You are not assigned to this classroom subject");
		}
		validateClassScheduleAvailability(class1, classRoom, lecturer);
		class1.setClassRoom(classRoom);
		Class savedClass = classRepo.save(class1);
		classRoom.getClasses().add(savedClass);
		classRoomRepo.save(classRoom);
		classNotificationService.sendClassCreatedEmails(savedClass);
		
		
		return savedClass;
		
	}

	private void validateClassScheduleAvailability(Class class1, ClassRoom targetClassRoom, Lecturer lecturer) {
		if (class1.getDate() == null || class1.getStarttime() == null || class1.getEndTime() == null) {
			throw new UserException("Class date, start time and end time are required");
		}

		if (!class1.getEndTime().isAfter(class1.getStarttime())) {
			throw new UserException("Class end time must be after start time");
		}

		List<Class> lecturerClasses = classRepo.findByLecturer(lecturer);
		for (Class existingClass : lecturerClasses) {
			if (hasClassTimeConflict(class1, existingClass)) {
				throw new UserException(
						"You already have a class scheduled at this time: " + describeClassSlot(existingClass)
				);
			}
		}

		if (targetClassRoom.getBatch() == null) {
			return;
		}

		List<ClassRoom> batchClassRooms = classRoomRepo.findByBatch(targetClassRoom.getBatch());
		for (ClassRoom classRoom : batchClassRooms) {
			for (Class existingClass : classRepo.findByClassRoom(classRoom)) {
				if (hasClassTimeConflict(class1, existingClass)) {
					throw new UserException(
							"Batch students already have a class scheduled at this time: " + describeClassSlot(existingClass)
					);
				}
			}
		}
	}

	private boolean hasClassTimeConflict(Class requestedClass, Class existingClass) {
		if (existingClass == null || existingClass.getDate() == null || existingClass.getStarttime() == null || existingClass.getEndTime() == null) {
			return false;
		}

		return requestedClass.getDate().isEqual(existingClass.getDate()) &&
				timeRangesOverlap(
						requestedClass.getStarttime(),
						requestedClass.getEndTime(),
						existingClass.getStarttime(),
						existingClass.getEndTime()
				);
	}

	private boolean timeRangesOverlap(LocalTime firstStart, LocalTime firstEnd, LocalTime secondStart, LocalTime secondEnd) {
		return firstStart.isBefore(secondEnd) && firstEnd.isAfter(secondStart);
	}

	private String describeClassSlot(Class classItem) {
		String className = classItem.getClassName() == null ? "Class" : classItem.getClassName();
		String roomName = classItem.getClassRoom() == null ? "classroom" : classItem.getClassRoom().getName();
		String lecturerName = classItem.getLecturer() == null || classItem.getLecturer().getUser() == null
				? "lecturer"
				: classItem.getLecturer().getUser().getName();
		return className + " in " + roomName + " by " + lecturerName + " from " + classItem.getStarttime() + " to " + classItem.getEndTime();
	}
//	@Override
//	public String uplpoadVideo(MultipartFile file1, ClassVideo classVideo, Long classId) throws IOException {
//
//	    try {
//	        File dir = new File(DIR);
//	        if (!dir.exists()) {
//	            dir.mkdir();
//	        }
//
//	        Class class1 = classRepo.findById(classId).orElseThrow();
//	        classVideo.setClasss(class1);
//
//	        String originalFilename = file1.getOriginalFilename();
//	        String contentType = file1.getContentType();
//	        long size = file1.getSize();
//
//	        String fileName = org.springframework.util.StringUtils.cleanPath(originalFilename);
//	        String cleanDir = org.springframework.util.StringUtils.cleanPath(DIR);
//
//	        Path path = Paths.get(cleanDir, fileName);
//
//	        classVideo.setFilePath(path.toString());
//	        classVideo.setContentType(contentType);
//	        classVideo.setSize(size);
//
//	        // ✅ SAVE FILE
//	        InputStream inputStream = file1.getInputStream();
//	        Files.copy(inputStream, path, StandardCopyOption.REPLACE_EXISTING);
//
//	        // ✅ SAVE DB (includes description + transcript)
//	        classVideoRepo.save(classVideo);
//
//	        return "Video Uploaded Successfully";
//
//	    } catch (Exception e) {
//	        e.printStackTrace();
//	        return "Failed To Upload";
//	    }
//	}
	
	
	
//	@Override
//	public String uploadNotes(MultipartFile file1,ClassNotesFile classNotesFile,Long classId) {
//		try {
//			
//			File file = new File(FILEDIR);
//			if(!file.exists()) {
//				file.mkdir();
//			}
//			Class class1 = classRepo.findById(classId).get();
//		    classNotesFile.setClasss(class1);
//			
//			
//			String originalFilename = file1.getOriginalFilename();
//			String contentType = file1.getContentType();
//			Long size = file1.getSize();
//			
//			String fileName = org.springframework.util.StringUtils.cleanPath(originalFilename);
//			String cleanDir = org.springframework.util.StringUtils.cleanPath(FILEDIR);
//			Path path = Paths.get(cleanDir,fileName );
//			
//			classNotesFile.setContentType(contentType);
//			classNotesFile.setFilePath(path.toString());
//			classNotesFile.setSize(size);
//			
//			InputStream inputStream = file1.getInputStream();
//			Files.copy(inputStream, path, StandardCopyOption.REPLACE_EXISTING);
//			
//			classNotesFileRepo.save(classNotesFile);
//			
//			return "Notes Uploaded Sucessufully";
//			
//		} catch (Exception e) {
//			
//			return "Failed To upload Notes";
//		}
//		
//	}

	@Override
	public List<Lecturer> getAlllecturers() {
		
		return lecturerRepo.findAll();
	}

	@Override
	public Test createTest(Test test,Long ClassId) {
		
		Class classs = classRepo.findById(ClassId).get();
		test.setClasss(classs);
		test.setDate(LocalDate.now());
		Test savedTest = testRepo.save(test);
		List<Question> questions = new ArrayList<>();
		for (Question question : test.getQuestions()) {
			question.setTest(savedTest);
			Question savedQuestion = questionRepo.save(question);
			questions.add(savedQuestion);
			
		}
		savedTest.setQuestions(questions);
		Test savedTest2 = testRepo.save(savedTest);
		classs.getTests().add(savedTest2);
		classRepo.save(classs);
		return savedTest2;
		
	}
	
	
	public List<BatchLecturerSubjectInter> getlbsOfLecturer(){
		String name = SecurityContextHolder.getContext().getAuthentication().getName();
		User user = userRepo.findByEmail(name);
		Lecturer lecturer = lecturerRepo.findByUser(user);
		List<BatchLecturerSubjectInter> lbs = lbsRepo.findSubjectAssignmentsByLecturerId(lecturer.getId());
		return lbs;
	}
	
	
	
	@Override
	public String uplpoadVideo(
	        MultipartFile file1,
	        ClassVideo classVideo,
	        Long classId
	) throws IOException {

	    Path tempInputFile = null;
	    Path hlsOutputDir = null;

	    try {

	        Class class1 = classRepo.findById(classId)
	                .orElseThrow(() ->
	                        new UserException("Class Not Found"));

	        classVideo.setClasss(class1);

	        String originalFilename =
	                file1.getOriginalFilename();

	        String contentType =
	                file1.getContentType();

	        long size =
	                file1.getSize();

	        /*
	         * =====================================
	         * CLEAN FILE NAME
	         * =====================================
	         */

	        String cleanFileName =
	                org.springframework.util.StringUtils
	                        .cleanPath(originalFilename);

	        /*
	         * =====================================
	         * VIDEO TITLE
	         * =====================================
	         */

	        String videoTitle =
	                classVideo.getTitle()
	                        .trim()
	                        .replaceAll("[^a-zA-Z0-9]", "_");

	        /*
	         * =====================================
	         * FILE EXTENSION
	         * =====================================
	         */

	        String fileExtension =
	                cleanFileName.substring(
	                        cleanFileName.lastIndexOf(".")
	                );

	        /*
	         * =====================================
	         * FINAL FILE NAME
	         * =====================================
	         */

	        String fileName =
	                videoTitle + fileExtension;

	        /*
	         * =====================================
	         * ORIGINAL VIDEO PATH
	         * =====================================
	         */

	        String originalKey =
	                "videos/original/"
	                        + fileName;

	        PutObjectRequest originalPutRequest =
	                PutObjectRequest.builder()
	                        .bucket(bucketName)
	                        .key(originalKey)
	                        .contentType(contentType)
	                        .build();

	        s3Client.putObject(
	                originalPutRequest,
	                RequestBody.fromInputStream(
	                        file1.getInputStream(),
	                        file1.getSize()
	                )
	        );

	        String originalVideoUrl =
	                "https://"
	                        + bucketName
	                        + ".s3."
	                        + region
	                        + ".amazonaws.com/"
	                        + originalKey;

	        /*
	         * =====================================
	         * TEMP MP4 FILE
	         * =====================================
	         */

	        tempInputFile =
	                Files.createTempFile(
	                        "video-input-",
	                        ".mp4"
	                );

	        Files.copy(
	                file1.getInputStream(),
	                tempInputFile,
	                StandardCopyOption.REPLACE_EXISTING
	        );

	        /*
	         * =====================================
	         * HLS OUTPUT DIRECTORY
	         * =====================================
	         */

	        hlsOutputDir =
	                Files.createTempDirectory(
	                        "hls-output-"
	                );

	        String outputM3u8 =
	                hlsOutputDir.toString()
	                        + "/%v/index.m3u8";

	        /*
	         * =====================================
	         * MP4 -> HLS
	         * =====================================
	         */

	        ProcessBuilder processBuilder =
	                new ProcessBuilder(

	                        "ffmpeg",

	                        "-i",
	                        tempInputFile.toString(),

	                        "-filter_complex",
	                        "[0:v]split=3[v360][v480][v720];" +
	                        "[v360]scale=w=-2:h=360[v360out];" +
	                        "[v480]scale=w=-2:h=480[v480out];" +
	                        "[v720]scale=w=-2:h=720[v720out]",

	                        // 360p
	                        "-map",
	                        "[v360out]",
	                        "-map",
	                        "0:a?",

	                        // 480p
	                        "-map",
	                        "[v480out]",
	                        "-map",
	                        "0:a?",

	                        // 720p
	                        "-map",
	                        "[v720out]",
	                        "-map",
	                        "0:a?",

	                        "-c:v",
	                        "libx264",

	                        "-c:a",
	                        "aac",

	                        // 360p
	                        "-b:v:0",
	                        "600k",
	                        "-maxrate:v:0",
	                        "700k",
	                        "-bufsize:v:0",
	                        "1000k",
	                        "-b:a:0",
	                        "96k",

	                        // 480p
	                        "-b:v:1",
	                        "1100k",
	                        "-maxrate:v:1",
	                        "1300k",
	                        "-bufsize:v:1",
	                        "1800k",
	                        "-b:a:1",
	                        "128k",

	                        // 720p
	                        "-b:v:2",
	                        "2200k",
	                        "-maxrate:v:2",
	                        "2500k",
	                        "-bufsize:v:2",
	                        "3500k",
	                        "-b:a:2",
	                        "128k",

	                        // Better compression
	                        "-preset",
	                        "medium",

	                        // Better quality-size balance
	                        "-crf",
	                        "23",

	                        "-g",
	                        "48",

	                        "-sc_threshold",
	                        "0",

	                        "-hls_time",
	                        "10",

	                        "-hls_playlist_type",
	                        "vod",

	                        "-hls_list_size",
	                        "0",

	                        "-hls_segment_filename",
	                        hlsOutputDir.toString() + "/%v/segment_%03d.ts",

	                        "-master_pl_name",
	                        "index.m3u8",

	                        "-var_stream_map",
	                        "v:0,a:0,name:360p " +
	                        "v:1,a:1,name:480p " +
	                        "v:2,a:2,name:720p",

	                        "-f",
	                        "hls",

	                        outputM3u8
	                );

	        processBuilder.redirectErrorStream(true);

	        Process process =
	                processBuilder.start();

	        BufferedReader reader =
	                new BufferedReader(
	                        new InputStreamReader(
	                                process.getInputStream()
	                        )
	                );

	        String line;

	        while ((line = reader.readLine()) != null) {

	            System.out.println("FFMPEG => " + line);
	        }

	        int exitCode =
	                process.waitFor();

	        if (exitCode != 0) {

	            return "FFmpeg HLS Conversion Failed";
	        }

	        /*
	         * =====================================
	         * UPLOAD HLS FILES
	         * =====================================
	         */

	        final Path finalHlsOutputDir = hlsOutputDir;

	        Files.walk(finalHlsOutputDir)
	                .filter(Files::isRegularFile)
	                .forEach(path -> {

	                    try {

	                        String hlsKey =
	                                "videos/hls/"
	                                        + videoTitle
	                                        + "/"
	                                        + finalHlsOutputDir
	                                        .relativize(path)
	                                        .toString()
	                                        .replace("\\", "/");

	                        PutObjectRequest hlsPutRequest =
	                                PutObjectRequest.builder()
	                                        .bucket(bucketName)
	                                        .key(hlsKey)
	                                        .contentType(
	                                                getContentType(path)
	                                        )
	                                        .build();

	                        s3Client.putObject(
	                                hlsPutRequest,
	                                RequestBody.fromFile(path)
	                        );

	                    } catch (Exception e) {

	                        e.printStackTrace();
	                    }

	                });

	        /*
	         * =====================================
	         * HLS URL
	         * =====================================
	         */

	        String hlsUrl =
	                "https://"
	                        + bucketName
	                        + ".s3."
	                        + region
	                        + ".amazonaws.com/"
	                        + "videos/hls/"
	                        + videoTitle
	                        + "/index.m3u8";

	        /*
	         * =====================================
	         * SAVE DATABASE
	         * =====================================
	         */

	        classVideo.setOriginalVideoUrl(
	                originalVideoUrl
	        );

	        classVideo.setHlsUrl(
	                hlsUrl
	        );

	        classVideo.setFilePath(
	                hlsUrl
	        );

	        classVideo.setContentType(
	                "application/x-mpegURL"
	        );

	        classVideo.setSize(
	                size
	        );

	        classVideoRepo.save(
	                classVideo
	        );

	        return hlsUrl;

	    } catch (Exception e) {

	        e.printStackTrace();

	        return "Video Upload Failed";

	    } finally {

	        try {

	            /*
	             * =====================================
	             * DELETE TEMP INPUT FILE
	             * =====================================
	             */

	            if (tempInputFile != null) {

	                Files.deleteIfExists(
	                        tempInputFile
	                );
	            }

	            /*
	             * =====================================
	             * DELETE HLS OUTPUT DIRECTORY
	             * =====================================
	             */

	            if (hlsOutputDir != null) {

	                Files.walk(hlsOutputDir)
	                        .sorted((a, b) -> b.compareTo(a))
	                        .forEach(path -> {

	                            try {

	                                Files.deleteIfExists(path);

	                            } catch (Exception ex) {

	                                ex.printStackTrace();
	                            }
	                        });
	            }

	        } catch (Exception cleanupException) {

	            cleanupException.printStackTrace();
	        }
	    }
	}
	
	@Override
	public String uploadNotes(
	        MultipartFile file1,
	        ClassNotesFile classNotesFile,
	        Long classId
	) {

	    try {

	        Class class1 =
	                classRepo.findById(classId)
	                        .orElseThrow(() ->
	                                new UserException("Class Not Found"));

	        classNotesFile.setClasss(class1);

	        String originalFilename =
	                file1.getOriginalFilename();

	        String contentType =
	                file1.getContentType();

	        long size =
	                file1.getSize();

	        /*
	         * =====================================
	         * NOTES TITLE
	         * =====================================
	         */

	        String notesTitle =
	                classNotesFile.getTitle()
	                        .trim()
	                        .replaceAll("[^a-zA-Z0-9]", "_");

	        /*
	         * =====================================
	         * FILE EXTENSION
	         * =====================================
	         */

	        String cleanFileName =
	                org.springframework.util.StringUtils
	                        .cleanPath(originalFilename);

	        String fileExtension =
	                cleanFileName.substring(
	                        cleanFileName.lastIndexOf(".")
	                );

	        /*
	         * =====================================
	         * FINAL FILE NAME
	         * =====================================
	         */

	        String fileName =
	                notesTitle + fileExtension;

	        /*
	         * =====================================
	         * NOTES PATH
	         * =====================================
	         */

	        String key =
	                "notes/"
	                        + fileName;

	        PutObjectRequest putObjectRequest =
	                PutObjectRequest.builder()
	                        .bucket(bucketName)
	                        .key(key)
	                        .contentType(contentType)

	                        // prevent force download
	                        .contentDisposition("inline")

	                        .build();

	        s3Client.putObject(
	                putObjectRequest,
	                RequestBody.fromInputStream(
	                        file1.getInputStream(),
	                        file1.getSize()
	                )
	        );

	        String fileUrl =
	                "https://"
	                        + bucketName
	                        + ".s3."
	                        + region
	                        + ".amazonaws.com/"
	                        + key;

	        classNotesFile.setContentType(
	                contentType
	        );

	        classNotesFile.setFilePath(
	                fileUrl
	        );

	        classNotesFile.setSize(
	                size
	        );

	        classNotesFile.setCanDownload(
	                false
	        );

	        classNotesFileRepo.save(
	                classNotesFile
	        );

	        return fileUrl;

	    } catch (Exception e) {

	        e.printStackTrace();

	        return "Failed To Upload Notes";
	    }
	}
	
	private String getContentType(Path path) {

	    String fileName =
	            path.getFileName().toString();

	    if (fileName.endsWith(".m3u8")) {

	        return "application/x-mpegURL";
	    }

	    if (fileName.endsWith(".ts")) {

	        return "video/mp2t";
	    }

	    return "application/octet-stream";
	}

	@Override
	public String requestDelete(Map<String, Object> request) {
		String email = SecurityContextHolder.getContext().getAuthentication().getName();
		User user = userRepo.findByEmail(email);
		Lecturer lecturer = lecturerRepo.findByUser(user);

		String reason = value(request, "reason");
		if (reason == null || reason.trim().length() < 8) {
			throw new UserException("Reason must be at least 8 characters");
		}

		String resourceType = value(request, "resourceType");
		String resourceId = value(request, "resourceId");
		String resourceName = value(request, "resourceName");
		String directLink = value(request, "directLink");
		List<User> admins = pickDeleteRequestAdmins();
		User admin = admins.get(0);

		DeleteRequest deleteRequest = new DeleteRequest();
		deleteRequest.setResourceType(resourceType);
		deleteRequest.setResourceId(parseLong(resourceId));
		deleteRequest.setResourceName(resourceName);
		deleteRequest.setReason(reason.trim());
		deleteRequest.setResourceLink(directLink);
		deleteRequest.setLecturerId(lecturer != null ? lecturer.getId() : null);
		deleteRequest.setLecturerName(user != null ? user.getName() : null);
		deleteRequest.setLecturerEmail(email);
		deleteRequest.setAssignedAdminId(admin.getId());
		deleteRequest.setAssignedAdminEmail(admin.getEmail());
		DeleteRequest savedRequest = deleteRequestRepo.save(deleteRequest);

		String adminLink = buildAdminDeleteRequestLink(directLink, savedRequest.getId());
		String subject = "APCLOTE delete request from lecturer";
		String body = "A lecturer requested admin deletion.\n\n"
				+ "Lecturer Name: " + safe(user != null ? user.getName() : null) + "\n"
				+ "Lecturer Email: " + safe(email) + "\n"
				+ "Lecturer Id: " + safe(lecturer != null ? String.valueOf(lecturer.getId()) : null) + "\n\n"
				+ "Resource Type: " + safe(resourceType) + "\n"
				+ "Resource Id: " + safe(resourceId) + "\n"
				+ "Resource Name: " + safe(resourceName) + "\n"
				+ "Requested Resource Link: " + safe(directLink) + "\n"
				+ "Admin Request Link: " + adminLink + "\n\n"
				+ "Reason:\n" + reason.trim();

		try {
			for (User recipient : admins) {
				emailService.sendEmail(recipient.getEmail(), subject, body);
			}
		} catch (Exception e) {
			throw new RuntimeException("Failed to send delete request email", e);
		}

		return "Delete request sent to admin";
	}

	private List<User> pickDeleteRequestAdmins() {
		List<User> admins = userRepo.findByRole("ROLE_ADMIN");
		if (admins == null || admins.isEmpty()) {
			throw new UserException("No admin user found to receive delete request");
		}

		List<User> recipients = new ArrayList<>();
		for (User admin : admins) {
			if (!Boolean.TRUE.equals(admin.getSubAdmin())) {
				recipients.add(admin);
			}
		}

		for (User admin : admins) {
			if (Boolean.TRUE.equals(admin.getSubAdmin()) && "DELETE".equalsIgnoreCase(admin.getAdminAction())) {
				recipients.add(admin);
			}
		}

		if (recipients.isEmpty()) {
			recipients.add(admins.get(ThreadLocalRandom.current().nextInt(admins.size())));
		}

		return recipients;
	}

	private Long parseLong(String value) {
		try {
			return value == null ? null : Long.valueOf(value);
		} catch (NumberFormatException e) {
			return null;
		}
	}

	private String buildAdminDeleteRequestLink(String directLink, Long requestId) {
		String baseUrl = directLink != null && directLink.startsWith(devFrontendUrl) ? devFrontendUrl : prodFrontendUrl;
		return baseUrl + "/deleteRequests?requestId=" + requestId;
	}

	private String value(Map<String, Object> request, String key) {
		Object value = request.get(key);
		return value == null ? null : String.valueOf(value);
	}

	private String safe(String value) {
		return value == null || value.isBlank() ? "N/A" : value;
	}
	

}





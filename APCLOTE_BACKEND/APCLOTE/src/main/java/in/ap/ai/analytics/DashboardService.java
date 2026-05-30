package in.ap.ai.analytics;

import java.sql.Date;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import in.ap.ai.activity.VideoTracking;
import in.ap.ai.activity.VideoTrackingRepository;
import in.ap.ai.activity.StudentResourceCompletion;
import in.ap.ai.activity.StudentResourceCompletionRepository;
import in.ap.entity.Batch;
import in.ap.entity.BatchValidyDate;
import in.ap.entity.Class;
import in.ap.entity.ClassNotesFile;
import in.ap.entity.ClassRoom;
import in.ap.entity.ClassVideo;
import in.ap.entity.Course;
import in.ap.entity.PurchaseOrder;
import in.ap.entity.Question;
import in.ap.entity.Student;
import in.ap.entity.Test;
import in.ap.entity.User;
import in.ap.entity.UserTestAnswer;
import in.ap.repo.PurchaseOrderRepo;
import in.ap.repo.StudentRepo;
import in.ap.repo.UserRepo;
import in.ap.repo.UserTestAnsRepo;
import in.ap.security.JwtProvider;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class DashboardService {

    private final CourseProgressRepository courseProgressRepository;
    private final UserRepo userRepo;
    private final StudentRepo studentRepo;
    private final PurchaseOrderRepo purchaseOrderRepo;
    private final VideoTrackingRepository videoTrackingRepository;
    private final StudentResourceCompletionRepository studentResourceCompletionRepository;
    private final UserTestAnsRepo userTestAnsRepo;
    private final JwtProvider jwtProvider;
    private final JdbcTemplate jdbcTemplate;

    @Transactional
    public Map<String, Object> getCurrentStudentDashboard(String authorizationHeader) {
        String email = null;
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            email = SecurityContextHolder.getContext().getAuthentication().getName();
        }

        if (email == null || email.isBlank() || "anonymousUser".equalsIgnoreCase(email)) {
            email = extractEmailFromHeader(authorizationHeader);
        }

        if (email == null || email.isBlank() || "anonymousUser".equalsIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please log in to view the dashboard.");
        }

        User user = userRepo.findByEmail(email);
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found.");
        }

        Student student = studentRepo.findByUser(user);
        if (student != null && (Boolean.FALSE.equals(student.getActive()) || Boolean.TRUE.equals(student.getDeleted()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Your student access is not active.");
        }

        return buildDashboard(user);
    }

    @Transactional
    public Map<String, Object> getStudentDashboardForAdmin(Long studentId) {
        Student student = studentRepo.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found."));
        if (student.getUser() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student user not found.");
        }
        return buildDashboard(student.getUser());
    }

    private String extractEmailFromHeader(String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isBlank() || !authorizationHeader.startsWith("Bearer ")) {
            return null;
        }

        try {
            return jwtProvider.getEmailFromToken(authorizationHeader);
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid dashboard token.");
        }
    }

    @Transactional
    public Map<String, Object> buildDashboard(User user) {
        LocalDateTime now = LocalDateTime.now();
        Student student = studentRepo.findByUser(user);
        List<PurchaseOrder> purchaseOrders = sortPurchaseOrders(purchaseOrderRepo.findByUser(user));
        List<UserTestAnswer> userTestAnswers = userTestAnsRepo.findByUser(user);
        List<VideoTracking> trackingRows = videoTrackingRepository.findByUserId(user.getId());
        List<StudentResourceCompletion> completionRows = studentResourceCompletionRepository.findByUserId(user.getId());

        Map<Long, VideoTracking> trackingByVideoId = trackingRows.stream()
                .filter(tracking -> tracking.getVideoId() != null)
                .collect(Collectors.toMap(
                        VideoTracking::getVideoId,
                        Function.identity(),
                        this::pickLatestTracking,
                        LinkedHashMap::new
                ));

        Map<Long, UserTestAnswer> answersByTestId = userTestAnswers.stream()
                .filter(answer -> answer.getTest() != null && answer.getTest().getId() != null)
                .collect(Collectors.toMap(
                        answer -> answer.getTest().getId(),
                        Function.identity(),
                        this::pickLatestAnswer,
                        LinkedHashMap::new
                ));

        Set<Long> completedNotes = completionRows.stream()
                .filter(completion -> "NOTE".equalsIgnoreCase(completion.getResourceType()) || "NOTES".equalsIgnoreCase(completion.getResourceType()))
                .map(StudentResourceCompletion::getResourceId)
                .collect(Collectors.toSet());

        Map<String, LocalDate> validityByBatchName = new HashMap<>();
        List<Batch> enrolledBatches = new ArrayList<>();

        if (student != null) {
            if (student.getBatchValidyDate() != null) {
                for (BatchValidyDate validity : student.getBatchValidyDate()) {
                    if (validity.getBatchName() != null) {
                        validityByBatchName.put(validity.getBatchName(), validity.getValidityDate());
                    }
                }
            }

            if (student.getBatchs() != null) {
                enrolledBatches.addAll(student.getBatchs());
            }
        }

        Map<Long, PurchaseOrder> latestOrderByBatchId = purchaseOrders.stream()
                .filter(order -> order.getBatch() != null && order.getBatch().getId() != null)
                .collect(Collectors.toMap(
                        order -> order.getBatch().getId(),
                        Function.identity(),
                        (existing, replacement) -> existing,
                        LinkedHashMap::new
                ));

        Map<Long, Batch> batchesById = new LinkedHashMap<>();
        for (Batch batch : enrolledBatches) {
            if (batch != null && batch.getId() != null) {
                batchesById.put(batch.getId(), batch);
            }
        }
        for (PurchaseOrder order : purchaseOrders) {
            if (order.getBatch() != null && order.getBatch().getId() != null) {
                batchesById.putIfAbsent(order.getBatch().getId(), order.getBatch());
            }
        }

        List<CourseProgress> existingSnapshots = courseProgressRepository.findByUserId(user.getId());
        Map<Long, CourseProgress> snapshotByBatchId = existingSnapshots.stream()
                .filter(snapshot -> snapshot.getBatchId() != null)
                .collect(Collectors.toMap(
                        CourseProgress::getBatchId,
                        Function.identity(),
                        (left, right) -> left,
                        LinkedHashMap::new
                ));

        List<CourseDashboardRow> rows = new ArrayList<>();
        Set<Long> activeBatchIds = new LinkedHashSet<>();

        for (Batch batch : batchesById.values()) {
            activeBatchIds.add(batch.getId());

            PurchaseOrder order = latestOrderByBatchId.get(batch.getId());
            LocalDate validUntil = validityByBatchName.get(batch.getName());
            BatchMetrics metrics = collectMetrics(batch, trackingByVideoId, answersByTestId, completedNotes, order, validUntil, now);
            CourseProgress snapshot = saveSnapshot(snapshotByBatchId.get(batch.getId()), user, student, batch, order, validUntil, metrics, now);

            CourseDashboardRow row = new CourseDashboardRow();
            row.snapshot = snapshot;
            row.payload = toCoursePayload(batch, order, validUntil, metrics);
            rows.add(row);
        }

        for (CourseProgress snapshot : existingSnapshots) {
            if (snapshot.getBatchId() != null && !activeBatchIds.contains(snapshot.getBatchId())) {
                courseProgressRepository.delete(snapshot);
            }
        }

        rows.sort(Comparator
                .comparingInt((CourseDashboardRow row) -> statusRank(row.snapshot.getStatus()))
                .thenComparing((CourseDashboardRow row) -> row.snapshot.getLastActivityAt(),
                        Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing((CourseDashboardRow row) -> row.snapshot.getNextClassDate(),
                        Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(
                        row -> row.snapshot.getBatchName(),
                        Comparator.nullsLast((left, right) -> left.compareToIgnoreCase(right))
                ));

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("student", buildStudentPayload(user, student, rows));
        response.put("summary", buildSummaryPayload(rows, now));
        response.put("courses", rows.stream().map(row -> row.payload).toList());
        response.put("recentActivity", buildRecentActivity(rows));
        response.put("upcomingClasses", buildUpcomingClasses(rows, now));
        response.put("recommendations", buildRecommendations(rows));
        response.put("generatedAt", now);
        return response;
    }

    private List<PurchaseOrder> sortPurchaseOrders(List<PurchaseOrder> purchaseOrders) {
        return purchaseOrders.stream()
                .sorted(Comparator
                        .comparing(PurchaseOrder::getPurchaseDate, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(PurchaseOrder::getId, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    private VideoTracking pickLatestTracking(VideoTracking first, VideoTracking second) {
        LocalDateTime firstUpdated = first.getLastUpdated();
        LocalDateTime secondUpdated = second.getLastUpdated();
        if (secondUpdated == null) {
            return first;
        }
        if (firstUpdated == null || secondUpdated.isAfter(firstUpdated)) {
            return second;
        }
        return first;
    }

    private UserTestAnswer pickLatestAnswer(UserTestAnswer first, UserTestAnswer second) {
        LocalDate firstDate = first.getDate();
        LocalDate secondDate = second.getDate();
        if (secondDate == null) {
            return first;
        }
        if (firstDate == null || secondDate.isAfter(firstDate)) {
            return second;
        }
        return first;
    }

    private BatchMetrics collectMetrics(Batch batch,
                                        Map<Long, VideoTracking> trackingByVideoId,
                                        Map<Long, UserTestAnswer> answersByTestId,
                                        Set<Long> completedNotes,
                                        PurchaseOrder order,
                                        LocalDate validUntil,
                                        LocalDateTime now) {
        BatchMetrics metrics = new BatchMetrics();

        List<ClassRoom> classRooms = batch.getClassRooms() == null ? List.of() : batch.getClassRooms();
        metrics.totalClassRooms = classRooms.size();

        double totalScore = 0;
        int scoredTests = 0;
        List<Map<String, Object>> recentTestResults = new ArrayList<>();

        for (ClassRoom classRoom : classRooms) {
            Map<String, Object> classRoomPayload = new LinkedHashMap<>();
            classRoomPayload.put("id", classRoom.getId());
            classRoomPayload.put("name", classRoom.getName());

            List<Map<String, Object>> classPayloads = new ArrayList<>();
            List<Class> classes = classRoom.getClasses() == null ? List.of() : classRoom.getClasses();
            double classRoomCompletionTotal = 0;

            for (Class classEntity : classes) {
                int totalClassItems = 0;
                int completedClassItems = 0;
                metrics.totalClasses++;
                LocalDateTime scheduledAt = toDateTime(classEntity.getDate(), classEntity.getStarttime());
                if (scheduledAt != null && scheduledAt.isAfter(now)) {
                    if (metrics.nextClassDate == null || scheduledAt.isBefore(metrics.nextClassDate)) {
                        metrics.nextClassDate = scheduledAt;
                    }
                }

                Map<String, Object> classPayload = new LinkedHashMap<>();
                classPayload.put("id", classEntity.getId());
                classPayload.put("className", classEntity.getClassName());
                classPayload.put("date", classEntity.getDate());
                classPayload.put("starttime", classEntity.getStarttime());
                classPayload.put("endTime", classEntity.getEndTime());

                List<Map<String, Object>> videosPayload = new ArrayList<>();
                List<ClassVideo> videos = classEntity.getVideos() == null ? List.of() : classEntity.getVideos();
                for (ClassVideo video : videos) {
                    metrics.totalVideos++;
                    VideoTracking tracking = trackingByVideoId.get(video.getId());
                    double videoCompletion = resolveVideoCompletion(video, tracking);
                    if (tracking != null) {
                        if (hasStartedVideo(tracking)) {
                            metrics.videosStarted++;
                        }
                        if (videoCompletion >= 0.9) {
                            metrics.completedVideos++;
                        }
                        if (tracking.getCurrentTime() != null && tracking.getCurrentTime() > 0) {
                            metrics.totalWatchSeconds += tracking.getCurrentTime();
                        }
                        metrics.lastActivityAt = max(metrics.lastActivityAt, tracking.getLastUpdated());
                        metrics.lastActivityAt = max(metrics.lastActivityAt, tracking.getFirstActionTime());
                    }
                    totalClassItems++;
                    if (videoCompletion >= 0.9) {
                        completedClassItems++;
                    }
                    videosPayload.add(toVideoPayload(video, videoCompletion));
                }
                classPayload.put("videos", videosPayload);

                List<Map<String, Object>> notesPayload = new ArrayList<>();
                List<ClassNotesFile> notes = classEntity.getNotes() == null ? List.of() : classEntity.getNotes();
                for (ClassNotesFile note : notes) {
                    metrics.totalNotes++;
                    boolean completed = note.getId() != null && completedNotes.contains(note.getId());
                    if (completed) {
                        metrics.completedNotes++;
                    }
                    totalClassItems++;
                    if (completed) {
                        completedClassItems++;
                    }
                    notesPayload.add(toNotePayload(note, completed));
                }
                classPayload.put("notes", notesPayload);

                List<Map<String, Object>> testsPayload = new ArrayList<>();
                List<Test> tests = classEntity.getTests() == null ? List.of() : classEntity.getTests();
                for (Test test : tests) {
                    metrics.totalTests++;

                    UserTestAnswer answer = answersByTestId.get(test.getId());
                    if (answer != null) {
                        metrics.testsAttempted++;
                        metrics.lastActivityAt = max(metrics.lastActivityAt, toDateTime(answer.getDate(), LocalTime.NOON));

                        int questionCount = test.getQuestions() == null ? 0 : test.getQuestions().size();
                        if (questionCount > 0) {
                            double scorePercentage = roundOneDecimal((answer.getCorrectAns() * 100.0) / questionCount);
                            totalScore += scorePercentage;
                            scoredTests++;
                            recentTestResults.add(toAttemptedTestPayload(test, answer, scorePercentage, classEntity));
                        }
                    }

                    totalClassItems++;
                    if (answer != null) {
                        completedClassItems++;
                    }
                    testsPayload.add(toTestPayload(test, answer != null));
                }
                classPayload.put("tests", testsPayload);
                double classCompletion = calculateCompletion(completedClassItems, totalClassItems);
                classPayload.put("completionPercentage", classCompletion);
                classPayload.put("completedItems", completedClassItems);
                classPayload.put("totalItems", totalClassItems);
                classRoomCompletionTotal += classCompletion;
                classPayloads.add(classPayload);
            }

            classRoomPayload.put("classes", classPayloads);
            classRoomPayload.put("completionPercentage", classes.isEmpty() ? 0 : roundOneDecimal(classRoomCompletionTotal / classes.size()));
            metrics.classRooms.add(classRoomPayload);
        }

        metrics.averageTestScore = scoredTests == 0 ? 0 : roundOneDecimal(totalScore / scoredTests);
        metrics.progressPercentage = calculateBatchCompletion(metrics.classRooms, isOrderCompleted(order));
        metrics.status = resolveStatus(order, validUntil, metrics.progressPercentage, metrics.videosStarted, metrics.testsAttempted, metrics.nextClassDate, now);
        recentTestResults.sort(Comparator.comparing(
                result -> (LocalDate) result.get("attemptedDate"),
                Comparator.nullsLast(Comparator.reverseOrder())
        ));
        metrics.recentTestResults.addAll(recentTestResults.stream().limit(5).toList());
        return metrics;
    }

    private boolean hasStartedVideo(VideoTracking tracking) {
        return tracking.getFirstActionTime() != null
                || tracking.getLastUpdated() != null
                || (tracking.getCurrentTime() != null && tracking.getCurrentTime() >= 0);
    }

    private Map<String, Object> toVideoPayload(ClassVideo video, double completion) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("id", video.getId());
        payload.put("title", video.getTitle());
        payload.put("filePath", video.getFilePath());
        payload.put("contentType", video.getContentType());
        payload.put("size", video.getSize());
        payload.put("description", video.getDescription());
        payload.put("transcript", video.getTranscript());
        payload.put("durationSeconds", video.getDurationSeconds());
        payload.put("completionPercentage", roundOneDecimal(completion * 100));
        payload.put("completed", completion >= 0.9);
        return payload;
    }

    private Map<String, Object> toNotePayload(ClassNotesFile note, boolean completed) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("id", note.getId());
        payload.put("title", note.getTitle());
        payload.put("filePath", note.getFilePath());
        payload.put("contentType", note.getContentType());
        payload.put("size", note.getSize());
        payload.put("completed", completed);
        return payload;
    }

    private Map<String, Object> toTestPayload(Test test, boolean completed) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("id", test.getId());
        payload.put("name", test.getName());
        payload.put("date", test.getDate());
        payload.put("completed", completed);

        List<Map<String, Object>> questions = new ArrayList<>();
        if (test.getQuestions() != null) {
            for (Question question : test.getQuestions()) {
                Map<String, Object> questionPayload = new LinkedHashMap<>();
                questionPayload.put("id", question.getId());
                questionPayload.put("questionText", question.getQuestionText());
                questionPayload.put("opt1", question.getOpt1());
                questionPayload.put("opt2", question.getOpt2());
                questionPayload.put("opt3", question.getOpt3());
                questionPayload.put("opt4", question.getOpt4());
                questions.add(questionPayload);
            }
        }
        payload.put("questions", questions);
        return payload;
    }

    private Map<String, Object> toAttemptedTestPayload(Test test,
                                                       UserTestAnswer answer,
                                                       double scorePercentage,
                                                       Class classEntity) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("testId", test.getId());
        payload.put("testName", test.getName());
        payload.put("attemptedDate", answer.getDate());
        payload.put("correctAns", answer.getCorrectAns());
        payload.put("wrongAns", answer.getWrongAns());
        payload.put("scorePercentage", scorePercentage);
        payload.put("totalQuestions", test.getQuestions() == null ? 0 : test.getQuestions().size());
        payload.put("classId", classEntity.getId());
        payload.put("className", classEntity.getClassName());
        return payload;
    }

    private CourseProgress saveSnapshot(CourseProgress existing,
                                        User user,
                                        Student student,
                                        Batch batch,
                                        PurchaseOrder order,
                                        LocalDate validUntil,
                                        BatchMetrics metrics,
                                        LocalDateTime now) {
        CourseProgress snapshot = existing == null ? new CourseProgress() : existing;
        Course course = batch.getCourse();

        snapshot.setUserId(user.getId());
        snapshot.setStudentId(student == null ? null : student.getId());
        snapshot.setBatchId(batch.getId());
        snapshot.setBatchName(batch.getName());
        snapshot.setCourseId(course == null ? null : course.getId());
        snapshot.setCourseName(course == null ? null : course.getName());
        snapshot.setCourseFee(course == null ? null : course.getFee());
        snapshot.setPurchaseOrderId(order == null ? null : order.getId());
        snapshot.setOrderStatus(order == null ? "NOT_PURCHASED" : normalizeOrderStatus(order.getStatus()));
        snapshot.setValidUntil(validUntil);
        snapshot.setBatchStartDate(batch.getStartDate());
        snapshot.setTotalClassRooms(metrics.totalClassRooms);
        snapshot.setTotalClasses(metrics.totalClasses);
        snapshot.setTotalVideos(metrics.totalVideos);
        snapshot.setCompletedVideos(metrics.completedVideos);
        snapshot.setVideosStarted(metrics.videosStarted);
        snapshot.setTotalNotes(metrics.totalNotes);
        snapshot.setTotalTests(metrics.totalTests);
        snapshot.setTestsAttempted(metrics.testsAttempted);
        snapshot.setAverageTestScore(metrics.averageTestScore);
        snapshot.setTotalWatchSeconds(metrics.totalWatchSeconds);
        snapshot.setProgressPercentage(metrics.progressPercentage);
        snapshot.setStatus(metrics.status);
        snapshot.setPurchaseDate(order != null && order.getPurchaseDate() != null ? order.getPurchaseDate().atStartOfDay() : null);
        snapshot.setLastActivityAt(metrics.lastActivityAt);
        snapshot.setNextClassDate(metrics.nextClassDate);
        snapshot.setUpdatedAt(now);

        int updatedRows = updateSnapshotRow(snapshot);
        if (updatedRows == 0) {
            insertSnapshotWithExplicitId(snapshot);
        }

        return courseProgressRepository.findByUserIdAndBatchId(user.getId(), batch.getId())
                .orElse(snapshot);
    }

    private void insertSnapshotWithExplicitId(CourseProgress snapshot) {
        Long nextId = jdbcTemplate.queryForObject(
                "select coalesce(max(id), 0) + 1 from course_progress",
                Long.class
        );

        if (nextId == null) {
            nextId = 1L;
        }

        snapshot.setId(nextId);

        jdbcTemplate.update(
                """
                insert into course_progress (
                    id,
                    average_test_score,
                    batch_id,
                    batch_name,
                    batch_start_date,
                    completed_videos,
                    course_fee,
                    course_id,
                    course_name,
                    last_activity_at,
                    next_class_date,
                    order_status,
                    progress_percentage,
                    purchase_date,
                    purchase_order_id,
                    status,
                    student_id,
                    tests_attempted,
                    total_class_rooms,
                    total_classes,
                    total_notes,
                    total_tests,
                    total_videos,
                    total_watch_seconds,
                    updated_at,
                    user_id,
                    valid_until,
                    videos_started
                ) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                """,
                snapshot.getId(),
                snapshot.getAverageTestScore(),
                snapshot.getBatchId(),
                snapshot.getBatchName(),
                toSqlDate(snapshot.getBatchStartDate()),
                snapshot.getCompletedVideos(),
                snapshot.getCourseFee(),
                snapshot.getCourseId(),
                snapshot.getCourseName(),
                toSqlTimestamp(snapshot.getLastActivityAt()),
                toSqlTimestamp(snapshot.getNextClassDate()),
                snapshot.getOrderStatus(),
                snapshot.getProgressPercentage(),
                toSqlTimestamp(snapshot.getPurchaseDate()),
                snapshot.getPurchaseOrderId(),
                snapshot.getStatus(),
                snapshot.getStudentId(),
                snapshot.getTestsAttempted(),
                snapshot.getTotalClassRooms(),
                snapshot.getTotalClasses(),
                snapshot.getTotalNotes(),
                snapshot.getTotalTests(),
                snapshot.getTotalVideos(),
                snapshot.getTotalWatchSeconds(),
                toSqlTimestamp(snapshot.getUpdatedAt()),
                snapshot.getUserId(),
                toSqlDate(snapshot.getValidUntil()),
                snapshot.getVideosStarted()
        );
    }

    private int updateSnapshotRow(CourseProgress snapshot) {
        return jdbcTemplate.update(
                """
                update course_progress
                set
                    average_test_score = ?,
                    batch_name = ?,
                    batch_start_date = ?,
                    completed_videos = ?,
                    course_fee = ?,
                    course_id = ?,
                    course_name = ?,
                    last_activity_at = ?,
                    next_class_date = ?,
                    order_status = ?,
                    progress_percentage = ?,
                    purchase_date = ?,
                    purchase_order_id = ?,
                    status = ?,
                    student_id = ?,
                    tests_attempted = ?,
                    total_class_rooms = ?,
                    total_classes = ?,
                    total_notes = ?,
                    total_tests = ?,
                    total_videos = ?,
                    total_watch_seconds = ?,
                    updated_at = ?,
                    valid_until = ?,
                    videos_started = ?
                where user_id = ? and batch_id = ?
                """,
                snapshot.getAverageTestScore(),
                snapshot.getBatchName(),
                toSqlDate(snapshot.getBatchStartDate()),
                snapshot.getCompletedVideos(),
                snapshot.getCourseFee(),
                snapshot.getCourseId(),
                snapshot.getCourseName(),
                toSqlTimestamp(snapshot.getLastActivityAt()),
                toSqlTimestamp(snapshot.getNextClassDate()),
                snapshot.getOrderStatus(),
                snapshot.getProgressPercentage(),
                toSqlTimestamp(snapshot.getPurchaseDate()),
                snapshot.getPurchaseOrderId(),
                snapshot.getStatus(),
                snapshot.getStudentId(),
                snapshot.getTestsAttempted(),
                snapshot.getTotalClassRooms(),
                snapshot.getTotalClasses(),
                snapshot.getTotalNotes(),
                snapshot.getTotalTests(),
                snapshot.getTotalVideos(),
                snapshot.getTotalWatchSeconds(),
                toSqlTimestamp(snapshot.getUpdatedAt()),
                toSqlDate(snapshot.getValidUntil()),
                snapshot.getVideosStarted(),
                snapshot.getUserId(),
                snapshot.getBatchId()
        );
    }

    private Date toSqlDate(LocalDate value) {
        return value == null ? null : Date.valueOf(value);
    }

    private Timestamp toSqlTimestamp(LocalDateTime value) {
        return value == null ? null : Timestamp.valueOf(value);
    }

    private Map<String, Object> toCoursePayload(Batch batch,
                                                PurchaseOrder order,
                                                LocalDate validUntil,
                                                BatchMetrics metrics) {
        Course course = batch.getCourse();
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("batchId", batch.getId());
        payload.put("batchName", batch.getName());
        payload.put("courseId", course == null ? null : course.getId());
        payload.put("courseName", course == null ? null : course.getName());
        payload.put("courseFee", course == null ? null : course.getFee());
        payload.put("courseDuration", course == null ? null : course.getDuration());
        payload.put("purchaseOrderId", order == null ? null : order.getId());
        payload.put("orderStatus", order == null ? "NOT_PURCHASED" : normalizeOrderStatus(order.getStatus()));
        payload.put("purchaseDate", order == null ? null : order.getPurchaseDate());
        payload.put("validUntil", validUntil);
        payload.put("batchStartDate", batch.getStartDate());
        payload.put("startTime", batch.getStart_time());
        payload.put("endTime", batch.getEnd_time());
        payload.put("status", metrics.status);
        payload.put("progressPercentage", metrics.progressPercentage);
        payload.put("averageTestScore", metrics.averageTestScore);
        payload.put("totalWatchHours", roundOneDecimal(metrics.totalWatchSeconds / 3600.0));
        payload.put("totalWatchSeconds", metrics.totalWatchSeconds);
        payload.put("lastActivityAt", metrics.lastActivityAt);
        payload.put("nextClassDate", metrics.nextClassDate);
        payload.put("totalClassRooms", metrics.totalClassRooms);
        payload.put("totalClasses", metrics.totalClasses);
        payload.put("totalVideos", metrics.totalVideos);
        payload.put("completedVideos", metrics.completedVideos);
        payload.put("videosStarted", metrics.videosStarted);
        payload.put("totalNotes", metrics.totalNotes);
        payload.put("completedNotes", metrics.completedNotes);
        payload.put("totalTests", metrics.totalTests);
        payload.put("testsAttempted", metrics.testsAttempted);
        payload.put("recentTestResults", metrics.recentTestResults);
        payload.put("classRooms", metrics.classRooms);
        return payload;
    }

    private Map<String, Object> buildStudentPayload(User user, Student student, List<CourseDashboardRow> rows) {
        long completedCourses = rows.stream()
                .filter(row -> "Completed".equalsIgnoreCase(row.snapshot.getStatus()))
                .count();
        long activeCourses = rows.stream()
                .filter(row -> isActiveStatus(row.snapshot.getStatus()))
                .count();
        long pendingPayments = rows.stream()
                .filter(row -> isPendingOrderStatus(row.snapshot.getOrderStatus()))
                .count();

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("userId", user.getId());
        payload.put("studentId", student == null ? null : student.getId());
        payload.put("name", user.getName());
        payload.put("email", user.getEmail());
        payload.put("phone", user.getPhono());
        payload.put("address", user.getAddress());
        payload.put("role", user.getRole());
        payload.put("memberSince", user.getCreatedAt());
        payload.put("enrolledCourses", rows.size());
        payload.put("activeCourses", activeCourses);
        payload.put("completedCourses", completedCourses);
        payload.put("pendingPayments", pendingPayments);
        return payload;
    }

    private Map<String, Object> buildSummaryPayload(List<CourseDashboardRow> rows, LocalDateTime now) {
        double averageProgress = rows.stream()
                .mapToDouble(row -> row.snapshot.getProgressPercentage())
                .average()
                .orElse(0);

        double totalWatchHours = rows.stream()
                .mapToLong(row -> row.snapshot.getTotalWatchSeconds())
                .sum() / 3600.0;

        int testsAttempted = rows.stream()
                .mapToInt(row -> row.snapshot.getTestsAttempted())
                .sum();

        double averageScore = rows.stream()
                .map(row -> row.snapshot)
                .filter(snapshot -> snapshot.getTestsAttempted() > 0)
                .mapToDouble(CourseProgress::getAverageTestScore)
                .average()
                .orElse(0);

        long completedCourses = rows.stream()
                .filter(row -> "Completed".equalsIgnoreCase(row.snapshot.getStatus()))
                .count();

        long upcomingClasses = rows.stream()
                .map(row -> row.snapshot)
                .filter(snapshot -> snapshot.getNextClassDate() != null && snapshot.getNextClassDate().isAfter(now))
                .count();

        long pendingPayments = rows.stream()
                .map(row -> row.snapshot)
                .filter(snapshot -> isPendingOrderStatus(snapshot.getOrderStatus()))
                .count();

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("averageProgress", roundOneDecimal(averageProgress));
        payload.put("totalWatchHours", roundOneDecimal(totalWatchHours));
        payload.put("testsAttempted", testsAttempted);
        payload.put("averageTestScore", roundOneDecimal(averageScore));
        payload.put("completedCourses", completedCourses);
        payload.put("upcomingClasses", upcomingClasses);
        payload.put("pendingPayments", pendingPayments);
        payload.put("totalCourses", rows.size());
        return payload;
    }

    private List<Map<String, Object>> buildRecentActivity(List<CourseDashboardRow> rows) {
        return rows.stream()
                .map(row -> row.snapshot)
                .filter(snapshot -> snapshot.getLastActivityAt() != null || snapshot.getPurchaseDate() != null)
                .sorted(Comparator.comparing(this::activityTime, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(6)
                .map(snapshot -> {
                    Map<String, Object> activity = new LinkedHashMap<>();
                    activity.put("batchId", snapshot.getBatchId());
                    activity.put("batchName", snapshot.getBatchName());
                    activity.put("courseName", snapshot.getCourseName());
                    activity.put("status", snapshot.getStatus());
                    activity.put("occurredAt", activityTime(snapshot));
                    activity.put("type", snapshot.getLastActivityAt() != null ? "Learning activity" : "Enrollment");
                    activity.put("message", snapshot.getLastActivityAt() != null
                            ? "Worked on course content recently."
                            : "Joined the course and unlocked access.");
                    return activity;
                })
                .toList();
    }

    private List<Map<String, Object>> buildUpcomingClasses(List<CourseDashboardRow> rows, LocalDateTime now) {
        return rows.stream()
                .map(row -> row.snapshot)
                .filter(snapshot -> snapshot.getNextClassDate() != null && snapshot.getNextClassDate().isAfter(now))
                .sorted(Comparator.comparing(CourseProgress::getNextClassDate))
                .limit(5)
                .map(snapshot -> {
                    Map<String, Object> upcoming = new LinkedHashMap<>();
                    upcoming.put("batchId", snapshot.getBatchId());
                    upcoming.put("batchName", snapshot.getBatchName());
                    upcoming.put("courseName", snapshot.getCourseName());
                    upcoming.put("scheduledAt", snapshot.getNextClassDate());
                    upcoming.put("status", snapshot.getStatus());
                    return upcoming;
                })
                .toList();
    }

    private List<String> buildRecommendations(List<CourseDashboardRow> rows) {
        List<String> recommendations = new ArrayList<>();

        boolean hasPendingPayments = rows.stream()
                .map(row -> row.snapshot)
                .anyMatch(snapshot -> isPendingOrderStatus(snapshot.getOrderStatus()));
        if (hasPendingPayments) {
            recommendations.add("Complete pending payments to unlock all enrolled course content.");
        }

        boolean hasReadyCourse = rows.stream()
                .map(row -> row.snapshot)
                .anyMatch(snapshot -> "Ready to Start".equalsIgnoreCase(snapshot.getStatus()) || "Upcoming".equalsIgnoreCase(snapshot.getStatus()));
        if (hasReadyCourse) {
            recommendations.add("Start the next scheduled class early so your progress begins moving immediately.");
        }

        boolean hasLowScore = rows.stream()
                .map(row -> row.snapshot)
                .anyMatch(snapshot -> snapshot.getTestsAttempted() > 0 && snapshot.getAverageTestScore() < 60);
        if (hasLowScore) {
            recommendations.add("Review notes and retry recent topics where test performance is still below 60%.");
        }

        boolean hasDormantCourse = rows.stream()
                .map(row -> row.snapshot)
                .anyMatch(snapshot -> snapshot.getLastActivityAt() == null && isOrderCompleted(snapshot.getOrderStatus()));
        if (hasDormantCourse) {
            recommendations.add("You already have access to at least one course that has not been started yet.");
        }

        if (recommendations.isEmpty()) {
            recommendations.add("Your dashboard is healthy. Keep a steady pace and continue the current learning streak.");
        }

        return recommendations.stream().limit(4).toList();
    }

    private boolean isOrderCompleted(PurchaseOrder order) {
        return order != null && isOrderCompleted(order.getStatus());
    }

    private boolean isOrderCompleted(String orderStatus) {
        return "COMPLETED".equals(normalizeOrderStatus(orderStatus));
    }

    private boolean isPendingOrderStatus(String orderStatus) {
        return "PENDING".equals(normalizeOrderStatus(orderStatus));
    }

    private boolean isActiveStatus(String status) {
        return "In Progress".equalsIgnoreCase(status)
                || "Ready to Start".equalsIgnoreCase(status)
                || "Upcoming".equalsIgnoreCase(status);
    }

    private String normalizeOrderStatus(String status) {
        if (status == null || status.isBlank()) {
            return "NOT_PURCHASED";
        }
        if ("COMPLITED".equalsIgnoreCase(status)) {
            return "COMPLETED";
        }
        return status.trim().toUpperCase();
    }

    private double calculateProgress(int totalVideos,
                                     int videosStarted,
                                     int totalTests,
                                     int testsAttempted,
                                     double watchedVideoCompletion,
                                     boolean hasPaidAccess) {
        double weightedScore = 0;
        double totalWeight = 0;

        if (totalVideos > 0) {
            double videoProgress = watchedVideoCompletion > 0
                    ? (watchedVideoCompletion * 100.0) / totalVideos
                    : (videosStarted * 100.0) / totalVideos;
            weightedScore += videoProgress * 0.7;
            totalWeight += 0.7;
        }

        if (totalTests > 0) {
            weightedScore += ((testsAttempted * 100.0) / totalTests) * 0.3;
            totalWeight += 0.3;
        }

        if (totalWeight == 0) {
            return hasPaidAccess ? 5.0 : 0.0;
        }

        return roundOneDecimal(weightedScore / totalWeight);
    }

    private double calculateCompletion(int completedItems, int totalItems) {
        if (totalItems <= 0) {
            return 0;
        }

        return roundOneDecimal((completedItems * 100.0) / totalItems);
    }

    private double calculateBatchCompletion(List<Map<String, Object>> classRooms, boolean hasPaidAccess) {
        if (classRooms.isEmpty()) {
            return hasPaidAccess ? 5.0 : 0.0;
        }

        double completionTotal = classRooms.stream()
                .mapToDouble(classRoom -> ((Number) classRoom.getOrDefault("completionPercentage", 0)).doubleValue())
                .sum();

        return roundOneDecimal(completionTotal / classRooms.size());
    }

    private double resolveVideoCompletion(ClassVideo video, VideoTracking tracking) {
        if (tracking == null) {
            return 0;
        }

        if (Boolean.TRUE.equals(tracking.getCompleted())) {
            return 1.0;
        }

        Long currentTime = tracking.getCurrentTime();
        Long durationSeconds = video.getDurationSeconds();

        if (durationSeconds == null || durationSeconds <= 0) {
            return hasStartedVideo(tracking) ? 1.0 : 0.0;
        }

        if (currentTime == null || currentTime <= 0) {
            return hasStartedVideo(tracking) ? 0.05 : 0.0;
        }

        if (durationSeconds - currentTime <= 600) {
            return 1.0;
        }

        return Math.min(1.0, currentTime.doubleValue() / durationSeconds.doubleValue());
    }

    private String resolveStatus(PurchaseOrder order,
                                 LocalDate validUntil,
                                 double progressPercentage,
                                 int videosStarted,
                                 int testsAttempted,
                                 LocalDateTime nextClassDate,
                                 LocalDateTime now) {
        String orderStatus = order == null ? "NOT_PURCHASED" : normalizeOrderStatus(order.getStatus());

        if ("PENDING".equals(orderStatus)) {
            return "Payment Pending";
        }
        if ("FAILED".equals(orderStatus)) {
            return "Payment Failed";
        }
        if (!"COMPLETED".equals(orderStatus)) {
            return "Not Purchased";
        }
        if (validUntil != null && validUntil.isBefore(LocalDate.now())) {
            return "Expired";
        }
        if (progressPercentage >= 95 || (videosStarted > 0 && progressPercentage >= 85 && testsAttempted > 0)) {
            return "Completed";
        }
        if (videosStarted > 0 || testsAttempted > 0) {
            return "In Progress";
        }
        if (nextClassDate != null && nextClassDate.isAfter(now)) {
            return "Upcoming";
        }
        return "Ready to Start";
    }

    private int statusRank(String status) {
        if (status == null) {
            return 99;
        }
        return switch (status) {
            case "In Progress" -> 0;
            case "Upcoming" -> 1;
            case "Ready to Start" -> 2;
            case "Payment Pending" -> 3;
            case "Completed" -> 4;
            case "Expired" -> 5;
            case "Payment Failed" -> 6;
            default -> 7;
        };
    }

    private LocalDateTime activityTime(CourseProgress snapshot) {
        return snapshot.getLastActivityAt() != null ? snapshot.getLastActivityAt() : snapshot.getPurchaseDate();
    }

    private LocalDateTime toDateTime(LocalDate date, LocalTime time) {
        if (date == null) {
            return null;
        }
        return LocalDateTime.of(date, time == null ? LocalTime.MIDNIGHT : time);
    }

    private LocalDateTime max(LocalDateTime first, LocalDateTime second) {
        if (first == null) {
            return second;
        }
        if (second == null) {
            return first;
        }
        return second.isAfter(first) ? second : first;
    }

    private double roundOneDecimal(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private static class BatchMetrics {
        private int totalClassRooms;
        private int totalClasses;
        private int totalVideos;
        private int completedVideos;
        private int videosStarted;
        private int totalNotes;
        private int completedNotes;
        private int totalTests;
        private int testsAttempted;
        private double averageTestScore;
        private long totalWatchSeconds;
        private double progressPercentage;
        private String status;
        private LocalDateTime lastActivityAt;
        private LocalDateTime nextClassDate;
        private final List<Map<String, Object>> classRooms = new ArrayList<>();
        private final List<Map<String, Object>> recentTestResults = new ArrayList<>();
    }

    private static class CourseDashboardRow {
        private CourseProgress snapshot;
        private Map<String, Object> payload;
    }
}

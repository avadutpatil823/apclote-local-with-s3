package in.ap.service.impl;

import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import in.ap.entity.Batch;
import in.ap.entity.Class;
import in.ap.entity.ClassRoom;
import in.ap.entity.Student;
import in.ap.helper.EmailService;
import in.ap.repo.StudentRepo;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class ClassNotificationService {

	private StudentRepo studentRepo;
	private EmailService emailService;

	@Async
	public void sendClassCreatedEmails(Class savedClass) {
		try {
			ClassRoom classRoom = savedClass.getClassRoom();
			Batch batch = classRoom == null ? null : classRoom.getBatch();
			if (batch == null || batch.getId() == null) {
				return;
			}

			String subject = "New class scheduled: " + safe(savedClass.getClassName());
			String body = "Hello,\n\n"
					+ "A new class has been scheduled for your batch.\n\n"
					+ "Class: " + safe(savedClass.getClassName()) + "\n"
					+ "Batch: " + safe(batch.getName()) + "\n"
					+ "Classroom: " + safe(classRoom.getName()) + "\n"
					+ "Date: " + safe(savedClass.getDate()) + "\n"
					+ "Time: " + safe(savedClass.getStarttime()) + " - " + safe(savedClass.getEndTime()) + "\n"
					+ "Meeting Link: " + safe(savedClass.getZoomlink()) + "\n\n"
					+ "Regards,\nAPCLOTE";

			for (Student student : studentRepo.findActiveRecordsByBatchId(batch.getId(), Pageable.unpaged()).getContent()) {
				if (student.getUser() != null && student.getUser().getEmail() != null) {
					emailService.sendEmail(student.getUser().getEmail(), subject, body);
				}
			}
		} catch (Exception ignored) {
		}
	}

	private String safe(Object value) {
		return value == null ? "Not available" : String.valueOf(value);
	}
}

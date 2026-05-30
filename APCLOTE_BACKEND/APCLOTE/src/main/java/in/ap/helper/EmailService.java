package in.ap.helper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
@Service
public class EmailService {

	
	 @Autowired
	 private JavaMailSender mailSender;
	 
	

	    public String sendEmail(String toEmail, String subject, String body) throws UserException {
	    	
	    	try {
	        SimpleMailMessage message = new SimpleMailMessage();
	        message.setFrom("avadutpatil64@gmail.com");
	        message.setTo(toEmail);
	        message.setSubject(subject);
	        message.setText(body);

	        mailSender.send(message);

	        return "Email Sent Successfully";
	    	}
	    	catch (Exception e) {
				
	    		e.printStackTrace();
	    		return null;
	    	}
	    }
}

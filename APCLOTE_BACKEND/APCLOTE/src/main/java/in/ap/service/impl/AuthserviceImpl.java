package in.ap.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import in.ap.entity.OtpVerification;
import in.ap.entity.User;
import in.ap.helper.EmailService;
import in.ap.helper.JwtResponse;
import in.ap.helper.UserException;
import in.ap.repo.OtpVerificationRepo;
import in.ap.repo.UserRepo;
import in.ap.security.JwtProvider;
import in.ap.service.AuthService;
import lombok.AllArgsConstructor;

@AllArgsConstructor
@Service
public class AuthserviceImpl implements AuthService {
	private static final Logger monitorLog = LoggerFactory.getLogger("APCLOTE_MONITOR");
	private UserRepo userRepo;
	  private OtpVerificationRepo otpRepo;
	private EmailService emailService;
	private PasswordEncoder encoder;
	
	

	@Override
	public User register(User u) throws Exception {
		User savedUser=new User();
		
		User isExist = userRepo.findByEmail(u.getEmail());
		if(isExist!=null) {
			throw new UserException("User With This Email is Allready Exist Please Enter Another Eamil");
		}
		   savedUser = userRepo.save(u);
		  String subject="Welcome to APCLOTE – Your Learning Journey Starts Here!";
		  String body="Hi "+savedUser.getName()+",\r\n"
		  		+ "\r\n"
		  		+ "Thank you for registering with APCLOTE – your trusted partner in online coaching and career growth!\r\n"
		  		+ "\r\n"
		  		+ "Your account has been successfully created. You can now:\r\n"
		  		+ "\r\n"
		  		+ "Access personalized learning content\r\n"
		  		+ "\r\n"
		  		+ "Take practice quizzes and mock tests\r\n"
		  		+ "\r\n"
		  		+ "Track your progress and performance\r\n"
		  		+ "\r\n"
		  		+ "Get expert guidance anytime, anywhere\r\n"
		  		+ "\r\n"
		  		+ "We're excited to be part of your journey. 🚀\r\n"
		  		+ "\r\n"
		  		+ "🧠 Start learning now: Login to APCLOTE\r\n"
		  		+ "\r\n"
		  		+ "If you have any questions or need support, feel free to reply to this email or contact us at support@apclote.com.\r\n"
		  		+ "\r\n"
		  		+ "Welcome aboard,\r\n"
		  		+ "Team APCLOTE\r\n"
		  		+ "Learn. Practice. Grow.";
		  String sendEmail = emailService.sendEmail(savedUser.getEmail(), subject, body);
		  if(sendEmail==null) {
			monitorLog.warn("event=user_register_failed email={} reason=email_not_delivered", savedUser.getEmail());
			throw new UserException("Email is Doesn't Exist Please Enter Valid Eamil");
				
		  }
		
		monitorLog.info("event=user_register userId={} name=\"{}\" email={} role={}", savedUser.getId(), savedUser.getName(), savedUser.getEmail(), savedUser.getRole());
		return savedUser;
	}

	@Override
	public JwtResponse login(User u) throws UserException {
	 User checkuser = userRepo.findByEmail(u.getEmail());
	 JwtResponse response = new JwtResponse();
	 if(checkuser==null) {
		 monitorLog.warn("event=user_login_failed email={} reason=user_not_found", u.getEmail());
		 response.setMessage("..No User Found With This Email");
		
	 }
	 else if(Boolean.TRUE.equals(checkuser.getDeleted()) || Boolean.FALSE.equals(checkuser.getActive())) {
		 monitorLog.warn("event=user_login_failed userId={} name=\"{}\" email={} reason=inactive_or_deleted", checkuser.getId(), checkuser.getName(), checkuser.getEmail());
		 response.setMessage("Your account is deactivated. Please contact admin.");
	 }
	   
	 else if(!encoder.matches(u.getPassword(), checkuser.getPassword())) {
		 monitorLog.warn("event=user_login_failed userId={} name=\"{}\" email={} reason=wrong_credentials", checkuser.getId(), checkuser.getName(), checkuser.getEmail());
		 response.setMessage("..Wrong Creditials");
	 }
	 else {
		      List<GrantedAuthority> authorityList = AuthorityUtils.commaSeparatedStringToAuthorityList(checkuser.getRole());
		    UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(checkuser.getEmail(), checkuser.getPassword(),authorityList);
		     JwtProvider provider = new JwtProvider();
		   String token = provider.generateToken(authenticationToken);
		   response.setMessage("Login Successfully");
		   response.setToken(token);
		   
		   String subject="Login Successful - Welcome Back to APCLOTE!";
		   String body="Dear "+checkuser.getName()+",\r\n"
		   		+ "\r\n"
		   		+ "You have successfully logged into your APCLOTE account.\r\n"
		   		+ "\r\n"
		   		+ "We're glad to have you back! Continue your learning journey with expert-led courses, live sessions, and personalized progress tracking on our online coaching platform.\r\n"
		   		+ "\r\n"
		   		+ "If this login wasn't you, please reset your password immediately or contact our support team.\r\n"
		   		+ "\r\n"
		   		+ "Happy Learning,  \r\n"
		   		+ "The APCLOTE Team  \r\n"
		   		+ "support@apclote.com  ";
		   emailService.sendEmail(u.getEmail(), subject, body);
		   monitorLog.info("event=user_login userId={} name=\"{}\" email={} role={}", checkuser.getId(), checkuser.getName(), checkuser.getEmail(), checkuser.getRole());
		  
		  
	 }
	 return response;
		
	}
	
	
	
	

}




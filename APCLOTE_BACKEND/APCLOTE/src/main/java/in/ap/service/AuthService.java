package in.ap.service;

import org.springframework.stereotype.Service;

import in.ap.entity.User;
import in.ap.helper.JwtResponse;
import in.ap.helper.UserException;

@Service
public interface AuthService {

	public User register(User u) throws Exception;

	JwtResponse login(User u) throws UserException;
	
	


}

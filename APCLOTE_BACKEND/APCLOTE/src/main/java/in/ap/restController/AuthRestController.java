package in.ap.restController;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import in.ap.entity.User;
import in.ap.helper.JwtResponse;
import in.ap.helper.UserException;
import in.ap.service.AuthService;
import in.ap.service.UserService;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/auth")
@AllArgsConstructor
public class AuthRestController {

	private AuthService authService;
	private PasswordEncoder passwordEncoder;
	
	
	@GetMapping("/welcome")
	public String welcome() {
		return "Welcome to APCLOTE";
	}
	
	@PostMapping("/register")
	public ResponseEntity<User> register(@RequestBody User user) throws Exception{
		
		//user.setRole("user");
		user.setPassword(passwordEncoder.encode(user.getPassword()));
		User saveUser = authService.register(user);
		saveUser.setPassword(null);
		return new ResponseEntity<User>(saveUser, HttpStatus.CREATED);
	}
	
	@PostMapping("/login")
	public ResponseEntity<JwtResponse> login(@RequestBody User user) throws UserException {
		
		JwtResponse jwtToken = authService.login(user);
		return new ResponseEntity<JwtResponse>(jwtToken, HttpStatus.CREATED);
		
	}
	
	@GetMapping("/oauth2/success")
	public ResponseEntity<Map<String, String>> oauthSuccess(@RequestParam String token) {
	    return ResponseEntity.ok(Map.of("message", "Login successful", "token", token));
	}

	@GetMapping("/oauth2/failure")
	public ResponseEntity<Map<String, String>> oauthFailure() {
	    return ResponseEntity.status(401).body(Map.of("error", "OAuth2 login failed"));
	}


	
	
	
}

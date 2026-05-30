package in.ap;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

import in.ap.repo.CourseRepo;

@SpringBootApplication
@EnableAsync
public class ApcloteApplication {

	
	
	public static void main(String[] args) {
		SpringApplication.run(ApcloteApplication.class, args);
		
		
		
	}
	
	
	
	

}

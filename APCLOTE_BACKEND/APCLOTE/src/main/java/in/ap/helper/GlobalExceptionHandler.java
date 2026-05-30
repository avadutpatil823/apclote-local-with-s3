package in.ap.helper;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

	private static final Logger monitorLog = LoggerFactory.getLogger("APCLOTE_MONITOR");
	@ExceptionHandler(UserException.class)
	public ResponseEntity<Map<String, Object>> handleUserException(UserException exception) {
		monitorLog.warn("event=intentional_exception exception={} message=\"{}\" class={} method={} line={}", exception.getClass().getSimpleName(), exception.getMessage(), exception.getSourceClass(), exception.getSourceMethod(), exception.getSourceLine());
		return ResponseEntity.status(exception.getStatus()).body(Map.of(
				"exception", exception.getClass().getSimpleName(),
				"message", exception.getMessage(),
				"className", exception.getSourceClass(),
				"methodName", exception.getSourceMethod(),
				"lineNumber", exception.getSourceLine()
		));
	}
}



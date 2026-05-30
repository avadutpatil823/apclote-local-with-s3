package in.ap.helper;

import org.springframework.http.HttpStatus;

public class UserException extends RuntimeException {
	private final String sourceClass;
	private final String sourceMethod;
	private final int sourceLine;
	private final HttpStatus status;

	public UserException(String message) {
		super(message);
		this.status = HttpStatus.BAD_REQUEST;
		StackTraceElement source = findSource();
		this.sourceClass = source.getClassName();
		this.sourceMethod = source.getMethodName();
		this.sourceLine = source.getLineNumber();
	}

	public UserException(String message, HttpStatus status) {
		super(message);
		this.status = status == null ? HttpStatus.BAD_REQUEST : status;
		StackTraceElement source = findSource();
		this.sourceClass = source.getClassName();
		this.sourceMethod = source.getMethodName();
		this.sourceLine = source.getLineNumber();
	}
	
	public String getSourceClass() {
		return sourceClass;
	}

	public String getSourceMethod() {
		return sourceMethod;
	}

	public int getSourceLine() {
		return sourceLine;
	}

	public HttpStatus getStatus() {
		return status;
	}

	private StackTraceElement findSource() {
		for (StackTraceElement element : getStackTrace()) {
			if (!element.getClassName().equals(UserException.class.getName())) {
				return element;
			}
		}

		return getStackTrace().length > 0 ? getStackTrace()[0] : new StackTraceElement("Unknown", "unknown", "Unknown.java", -1);
	}
}

package in.ap.helper;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
@Order(Ordered.LOWEST_PRECEDENCE)
public class RequestMonitoringFilter extends OncePerRequestFilter {

	private static final Logger monitorLog = LoggerFactory.getLogger("APCLOTE_MONITOR");

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		long startedAt = System.currentTimeMillis();
		try {
			filterChain.doFilter(request, response);
		} finally {
			long durationMs = System.currentTimeMillis() - startedAt;
			Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
			String actor = authentication != null && authentication.isAuthenticated() ? authentication.getName() : "anonymous";
			monitorLog.info(
					"event=http_request method={} path={} status={} durationMs={} actor={} remoteAddr={}",
					request.getMethod(),
					request.getRequestURI(),
					response.getStatus(),
					durationMs,
					actor,
					request.getRemoteAddr()
			);
		}
	}
}

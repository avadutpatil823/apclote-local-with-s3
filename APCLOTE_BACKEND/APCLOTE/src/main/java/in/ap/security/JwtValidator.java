package in.ap.security;

import java.io.IOException;
import java.util.List;

import javax.crypto.SecretKey;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import in.ap.entity.User;
import in.ap.repo.UserRepo;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtValidator extends OncePerRequestFilter {

	private final UserRepo userRepo;

	public JwtValidator(UserRepo userRepo) {
		this.userRepo = userRepo;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		
		String jwt = request.getHeader(JwtConstant.JWT_HEADER);
		if(jwt!=null)
		{
			jwt = jwt.substring(7);
			try {
				
				SecretKey secretKey = Keys.hmacShaKeyFor(JwtConstant.SECRETE_KEY.getBytes());
				
				Claims claims = Jwts.parserBuilder().setSigningKey(secretKey).build().parseClaimsJws(jwt).getBody();
				
				String email=String.valueOf(claims.get("email"));
				User user = userRepo.findByEmail(email);
				if (user == null || Boolean.TRUE.equals(user.getDeleted()) || Boolean.FALSE.equals(user.getActive())) {
					response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
					response.setContentType("application/json");
					response.getWriter().write("{\"error\":\"ACCOUNT_INACTIVE\",\"message\":\"Your account is deactivated or deleted. Please login with an active account.\"}");
					return;
				}

				List<String> roles = claims.get("authorities", List.class);
				List<SimpleGrantedAuthority> auths = roles.stream()
				        .map(SimpleGrantedAuthority::new)   // e.g. "ROLE_ADMIN"
				        .toList();
				
				
				 Authentication authentication=new UsernamePasswordAuthenticationToken(email, null, auths);
				
				 SecurityContextHolder.getContext().setAuthentication(authentication);
				
			} catch (Exception e) {
				throw new BadCredentialsException("Invalid Token... From Jwt Validator");
			}
			
			
			
			
		}
		
		filterChain.doFilter(request, response);
		
	}

}

package in.ap.security;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.crypto.SecretKey;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Service
@NoArgsConstructor
public class JwtProvider {

	
	
	public String generateToken(Authentication auth) {
		
		SecretKey key = Keys.hmacShaKeyFor(JwtConstant.SECRETE_KEY.getBytes());
		
		String jwt=Jwts.builder()
				       .setIssuedAt(new Date())
				       .setExpiration(new Date(new Date().getTime()+846000000))
				       .claim("email", auth.getName())
				       .claim("authorities",
				    	       auth.getAuthorities().stream()
				    	           .map(GrantedAuthority::getAuthority) // "ROLE_ADMIN"
				    	           .toList())
				       .signWith(key)
				       .compact();
		
		return jwt;
		
	}
	
	
	
	public String getEmailFromToken(String jwt) {
		
		SecretKey key = Keys.hmacShaKeyFor(JwtConstant.SECRETE_KEY.getBytes());
		jwt=jwt.substring(7);
		
		Claims claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(jwt).getBody();
		
		
		String email=String.valueOf(claims.get("email"));
		
		return email;
		
	}
	
	
	
	
	
	
	
}

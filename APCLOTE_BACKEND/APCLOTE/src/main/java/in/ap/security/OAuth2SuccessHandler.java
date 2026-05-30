package in.ap.security;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.util.UriComponentsBuilder;

import in.ap.entity.User;
import in.ap.helper.JwtResponse;
import in.ap.repo.UserRepo;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements org.springframework.security.web.authentication.AuthenticationSuccessHandler {

    private static final Logger monitorLog = LoggerFactory.getLogger("APCLOTE_MONITOR");

private final UserRepo userRepo;
    private final JwtProvider jwtProvider;
    private PasswordEncoder encoder=new BCryptPasswordEncoder();

    @Value("${app.frontend.url:https://apclote.in}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException, ServletException {

        OAuth2User oAuthUser = (OAuth2User) authentication.getPrincipal();

        // Extract fields — depends on provider
        String email = oAuthUser.getAttribute("email");
        String name = oAuthUser.getAttribute("name");
        String picture = oAuthUser.getAttribute("picture"); // optional (for Google)
        
        if (email == null) {
            // Some providers (like GitHub) may not provide email if it's private
            email = oAuthUser.getAttribute("login") + "@github.com";
        }

        // Check if user exists
        User existingUser = userRepo.findByEmail(email);
        if (existingUser == null) {
            existingUser = new User();
            existingUser.setEmail(email);
            
            existingUser.setName(name != null ? name : email.substring(0, 8));
            existingUser.setPassword(encoder.encode(email)); // dummy password
            existingUser.setRole("ROLE_USER");
            existingUser = userRepo.save(existingUser);
            monitorLog.info("event=oauth_user_register provider_user=google userId={} name=\"{}\" email={} role={}", existingUser.getId(), existingUser.getName(), existingUser.getEmail(), existingUser.getRole());
        }
        if (Boolean.TRUE.equals(existingUser.getDeleted()) || Boolean.FALSE.equals(existingUser.getActive())) {
            monitorLog.warn("event=oauth_login_failed userId={} name=\"{}\" email={} reason=inactive_or_deleted", existingUser.getId(), existingUser.getName(), existingUser.getEmail());
            response.sendRedirect(buildFrontendRedirect("/login", Map.of("account", "inactive")));
            return;
        }
                  List<GrantedAuthority> auths = AuthorityUtils.commaSeparatedStringToAuthorityList(existingUser.getRole());
                UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(email, existingUser.getPassword(), auths);
        
        String token = jwtProvider.generateToken(authenticationToken);
        monitorLog.info("event=oauth_login userId={} name=\"{}\" email={} role={}", existingUser.getId(), existingUser.getName(), existingUser.getEmail(), existingUser.getRole());
        
        response.sendRedirect(buildFrontendRedirect("/oauth", Map.of("token", token)));


    }

    private String buildFrontendRedirect(String path, Map<String, String> queryParams) {
        UriComponentsBuilder builder = UriComponentsBuilder
                .fromUriString(frontendUrl)
                .path(path);

        queryParams.forEach(builder::queryParam);
        return builder.build().encode().toUriString();
    }
}



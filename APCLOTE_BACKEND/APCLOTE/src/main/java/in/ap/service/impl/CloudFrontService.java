package in.ap.service.impl;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import software.amazon.awssdk.services.cloudfront.CloudFrontUtilities;
import software.amazon.awssdk.services.cloudfront.model.CannedSignerRequest;
import software.amazon.awssdk.services.cloudfront.url.SignedUrl;

@Service
public class CloudFrontService {

    @Value("${cloudfront.domain}")
    private String distributionDomain;

    @Value("${cloudfront.key-pair-id}")
    private String keyPairId;

//    @Value("${cloudfront.private-key-path}")
//    private String privateKeyPath;

    public String generateSignedUrl(String videoKey) throws Exception {

        String resourceUrl = distributionDomain.replaceAll("/+$", "") + "/" + normalizeKey(videoKey);

        // 2. Load private key from file system (EC2 / local)
       // String privateKeyPem = Files.readString(Paths.get(privateKeyPath)).trim();
        String privateKeyPem = new String(
                new ClassPathResource("private_key.pem")
                        .getInputStream()
                        .readAllBytes(),
                StandardCharsets.UTF_8
        ).trim();

        // 3. Convert PEM → PrivateKey object
        PrivateKey privateKey = getPrivateKeyFromPem(privateKeyPem);

        // 4. Set expiration time (1 hour validity)
        Instant expiration = Instant.now().plus(1, ChronoUnit.HOURS);

        // 5. Create signed URL using CloudFront utilities
        SignedUrl signedUrl = CloudFrontUtilities.create()
                .getSignedUrlWithCannedPolicy(
                        CannedSignerRequest.builder()
                                .resourceUrl(resourceUrl)
                                .privateKey(privateKey)
                                .keyPairId(keyPairId)
                                .expirationDate(expiration)
                                .build()
                );

        // 6. Return final signed URL
        return signedUrl.url();
    }

    public String normalizeKey(String resource) {

        if (resource == null) {
            return "";
        }

        String value = resource.trim().replace("\\", "/");

        if (value.startsWith("http://") || value.startsWith("https://")) {
            try {
                java.net.URI uri = java.net.URI.create(value);
                String path = uri.getPath();
                return path == null ? "" : path.replaceFirst("^/+", "");
            } catch (Exception ignored) {
                return value.replaceFirst("^/+", "");
            }
        }

        return value.replaceFirst("^/+", "");
    }

    /**
     * Convert PEM formatted private key into Java PrivateKey object
     */
    private PrivateKey getPrivateKeyFromPem(String pem) throws Exception {

        String privateKeyPEM = pem
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s+", "");

        byte[] decoded = Base64.getDecoder().decode(privateKeyPEM);

        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(decoded);

        KeyFactory keyFactory = KeyFactory.getInstance("RSA");

        return keyFactory.generatePrivate(keySpec);
    }
    
//    public String loadPrivateKey() {
//        try {
//            ClassPathResource resource = new ClassPathResource("keys/private_key.pem");
//            return new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
//        } catch (Exception e) {
//            throw new RuntimeException("Unable to load private key", e);
//        }
//    }
}

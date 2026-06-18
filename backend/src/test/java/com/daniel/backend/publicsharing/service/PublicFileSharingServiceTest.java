package com.daniel.backend.publicsharing.service;

import com.daniel.backend.audit.repository.AuditLogRepo;
import com.daniel.backend.audit.service.AuditLogService;
import com.daniel.backend.auth.entity.Users;
import com.daniel.backend.file.entity.Files;
import com.daniel.backend.file.repo.FileRepo;
import com.daniel.backend.file.service.StorageService;
import com.daniel.backend.publicsharing.entity.PublicFileAccessToken;
import com.daniel.backend.publicsharing.repo.PublicFileAccessTokenRepo;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.lang.reflect.Proxy;
import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PublicFileSharingServiceTest {

    private final Map<Long, Files> files = new HashMap<>();
    private final List<PublicFileAccessToken> tokens = new ArrayList<>();
    private final List<String> auditActions = new ArrayList<>();

    private PublicFileSharingService service;

    @BeforeEach
    void setUp() throws Exception {
        service = new PublicFileSharingService();
        setField(service, "fileRepo", fileRepo());
        setField(service, "publicTokenRepo", tokenRepo());
        setField(service, "storageService", new StorageService(null, null, null, auditLogService(), tokenRepo()));
        setField(service, "auditLogService", auditLogService());
        setField(service, "maxPreviewSize", 5L * 1024L * 1024L);
    }

    @Test
    void generatePublicLinkReturnsPreviewAndDownloadLinksForSmallFiles() throws Exception {
        Users owner = user("owner@example.com");
        Files file = file(10L, owner, 1024L);
        files.put(file.getId(), file);
        HttpServletRequest request = request("https", "example.com", 443);

        Map<String, String> result = service.generatePublicLink(file.getId(), owner.getEmail(), request);

        assertEquals(2, result.size());
        assertTrue(result.get("downloadLink").startsWith("https://example.com/share/public/access/"));
        assertEquals(result.get("downloadLink") + "?preview=true", result.get("previewLink"));
        assertEquals(1, tokens.size());
        assertTrue(tokens.get(0).isActive());
        assertEquals(file, tokens.get(0).getFile());
        assertNotNull(tokens.get(0).getToken());
        assertTrue(tokens.get(0).getExpiresAt().isAfter(LocalDateTime.now().plusHours(23)));
        assertEquals(List.of("PUBLIC_LINK_GENERATION"), auditActions);
    }

    @Test
    void generatePublicLinkOmitsPreviewForLargeFilesAndIncludesPortWhenNeeded() throws Exception {
        Users owner = user("owner@example.com");
        Files file = file(10L, owner, 6L * 1024L * 1024L);
        files.put(file.getId(), file);
        HttpServletRequest request = request("http", "localhost", 8080);

        Map<String, String> result = service.generatePublicLink(file.getId(), " OWNER@example.com ", request);

        assertFalse(result.containsKey("previewLink"));
        assertTrue(result.get("downloadLink").startsWith("http://localhost:8080/share/public/access/"));
        assertEquals("Preview disabled for files larger than 5MB", result.get("message"));
        assertEquals(1, tokens.size());
    }

    @Test
    void generatePublicLinkRequiresFileOwner() {
        Users owner = user("owner@example.com");
        Files file = file(10L, owner, 1024L);
        files.put(file.getId(), file);

        assertThrows(
                AccessDeniedException.class,
                () -> service.generatePublicLink(file.getId(), "intruder@example.com", request("https", "example.com", 443))
        );

        assertTrue(tokens.isEmpty());
        assertTrue(auditActions.isEmpty());
    }

    @Test
    void revokeTokenMarksActiveTokenInactiveForOwner() throws Exception {
        Users owner = user("owner@example.com");
        PublicFileAccessToken token = token("abc", file(10L, owner, 1024L), LocalDateTime.now().plusHours(1), true);
        tokens.add(token);

        service.revokeToken("abc", " OWNER@example.com ");

        assertFalse(token.isActive());
        assertEquals(List.of("PUBLIC_LINK_REVOCATION"), auditActions);
    }

    @Test
    void revokeTokenRejectsNonOwner() {
        Users owner = user("owner@example.com");
        tokens.add(token("abc", file(10L, owner, 1024L), LocalDateTime.now().plusHours(1), true));

        assertThrows(
                AccessDeniedException.class,
                () -> service.revokeToken("abc", "intruder@example.com")
        );

        assertTrue(tokens.get(0).isActive());
        assertTrue(auditActions.isEmpty());
    }

    @Test
    void revokeTokenExpiresOldTokenBeforeThrowing() {
        Users owner = user("owner@example.com");
        PublicFileAccessToken expired = token("abc", file(10L, owner, 1024L), LocalDateTime.now().minusMinutes(1), true);
        tokens.add(expired);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> service.revokeToken("abc", owner.getEmail()));

        assertEquals("This link has expired.", ex.getMessage());
        assertFalse(expired.isActive());
        assertTrue(auditActions.isEmpty());
    }

    private FileRepo fileRepo() {
        return proxy(FileRepo.class, (method, args) -> switch (method) {
            case "findById" -> Optional.ofNullable(files.get((Long) args[0]));
            default -> unsupported(method);
        });
    }

    private PublicFileAccessTokenRepo tokenRepo() {
        return proxy(PublicFileAccessTokenRepo.class, (method, args) -> switch (method) {
            case "findByTokenAndActiveTrue" -> tokens.stream()
                    .filter(token -> token.isActive())
                    .filter(token -> token.getToken().equals(args[0]))
                    .findFirst();
            case "findAllByFileOwnerEmailAndActiveTrue" -> tokens.stream()
                    .filter(token -> token.isActive())
                    .filter(token -> token.getFile().getOwner().getEmail().equals(args[0]))
                    .toList();
            case "save" -> {
                PublicFileAccessToken token = (PublicFileAccessToken) args[0];
                if (!tokens.contains(token)) {
                    tokens.add(token);
                }
                yield token;
            }
            default -> unsupported(method);
        });
    }

    private AuditLogService auditLogService() {
        AuditLogRepo repo = proxy(AuditLogRepo.class, (method, args) -> switch (method) {
            case "save" -> args[0];
            case "countByPerformedBy" -> 0L;
            default -> unsupported(method);
        });

        return new AuditLogService(repo) {
            @Override
            public void log(String action, String performedBy, Files file, String description) {
                auditActions.add(action);
            }
        };
    }

    private HttpServletRequest request(String scheme, String serverName, int serverPort) {
        return proxy(HttpServletRequest.class, (method, args) -> switch (method) {
            case "getScheme" -> scheme;
            case "getServerName" -> serverName;
            case "getServerPort" -> serverPort;
            default -> unsupported(method);
        });
    }

    private Users user(String email) {
        Users user = new Users();
        user.setEmail(email);
        user.setPassword("password");
        return user;
    }

    private Files file(Long id, Users owner, long size) {
        return Files.builder()
                .id(id)
                .owner(owner)
                .displayName("shared.pdf")
                .s3Key("shared.pdf")
                .size(size)
                .build();
    }

    private PublicFileAccessToken token(String token, Files file, LocalDateTime expiresAt, boolean active) {
        return PublicFileAccessToken.builder()
                .token(token)
                .file(file)
                .expiresAt(expiresAt)
                .active(active)
                .build();
    }

    private void setField(Object target, String name, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(name);
        field.setAccessible(true);
        field.set(target, value);
    }

    private Object unsupported(String method) {
        throw new UnsupportedOperationException("Unexpected method call: " + method);
    }

    @SuppressWarnings("unchecked")
    private <T> T proxy(Class<T> type, MethodCall call) {
        return (T) Proxy.newProxyInstance(
                type.getClassLoader(),
                new Class<?>[]{type},
                (proxy, method, args) -> {
                    if (method.getDeclaringClass() == Object.class) {
                        return switch (method.getName()) {
                            case "toString" -> type.getSimpleName() + "Proxy";
                            case "hashCode" -> System.identityHashCode(proxy);
                            case "equals" -> proxy == args[0];
                            default -> unsupported(method.getName());
                        };
                    }
                    return call.invoke(method.getName(), args == null ? new Object[0] : args);
                }
        );
    }

    @FunctionalInterface
    private interface MethodCall {
        Object invoke(String method, Object[] args);
    }
}

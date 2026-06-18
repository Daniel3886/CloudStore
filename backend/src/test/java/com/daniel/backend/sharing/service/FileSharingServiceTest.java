package com.daniel.backend.sharing.service;

import com.daniel.backend.audit.repository.AuditLogRepo;
import com.daniel.backend.audit.service.AuditLogService;
import com.daniel.backend.auth.entity.Users;
import com.daniel.backend.auth.repository.UserRepo;
import com.daniel.backend.file.entity.Files;
import com.daniel.backend.file.repo.FileRepo;
import com.daniel.backend.sharing.dto.ShareFileRequestDto;
import com.daniel.backend.sharing.dto.ShareStatus;
import com.daniel.backend.sharing.dto.SharedFileDto;
import com.daniel.backend.sharing.entity.FilePermission;
import com.daniel.backend.sharing.repository.FilePermissionRepo;
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
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class FileSharingServiceTest {

    private final Map<Long, Files> files = new HashMap<>();
    private final Map<Long, Users> usersById = new HashMap<>();
    private final Map<String, Users> usersByEmail = new HashMap<>();
    private final List<FilePermission> permissions = new ArrayList<>();
    private final List<String> auditActions = new ArrayList<>();

    private FileSharingService service;

    @BeforeEach
    void setUp() throws Exception {
        service = new FileSharingService();
        setField(service, "fileRepo", fileRepo());
        setField(service, "userRepo", userRepo());
        setField(service, "filePermissionRepo", filePermissionRepo());
        setField(service, "auditLogService", auditLogService());
    }

    @Test
    void shareFileCreatesPendingPermissionForAnotherUser() throws Exception {
        Users owner = user(1L, "owner@example.com");
        Users recipient = user(2L, "recipient@example.com");
        Files file = file(10L, owner);
        addUsers(owner, recipient);
        files.put(file.getId(), file);

        ShareFileRequestDto request = shareRequest(file.getId(), recipient.getEmail(), "Please review");

        service.shareFile(request, owner.getEmail());

        assertEquals(1, permissions.size());
        FilePermission saved = permissions.get(0);
        assertSame(file, saved.getFile());
        assertSame(recipient, saved.getSharedWith());
        assertEquals("Please review", saved.getMessage());
        assertEquals(ShareStatus.PENDING, saved.getStatus());
        assertNotNull(saved.getSharedAt());
        assertNotNull(saved.getStatusChangedAt());
        assertEquals(List.of("SHARE_FILE"), auditActions);
    }

    @Test
    void shareFileRejectsSharingWithSelf() {
        Users owner = user(1L, "owner@example.com");
        Files file = file(10L, owner);
        addUsers(owner);
        files.put(file.getId(), file);

        ShareFileRequestDto request = shareRequest(file.getId(), owner.getEmail(), "Self share");

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> service.shareFile(request, owner.getEmail())
        );

        assertEquals("You cannot share a file with yourself.", ex.getMessage());
        assertTrue(permissions.isEmpty());
        assertTrue(auditActions.isEmpty());
    }

    @Test
    void shareFileRejectsDuplicatePendingPermission() {
        Users owner = user(1L, "owner@example.com");
        Users recipient = user(2L, "recipient@example.com");
        Files file = file(10L, owner);
        addUsers(owner, recipient);
        files.put(file.getId(), file);
        permissions.add(permission(20L, file, recipient, ShareStatus.PENDING, "Already sent"));

        ShareFileRequestDto request = shareRequest(file.getId(), recipient.getEmail(), "Again");

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> service.shareFile(request, owner.getEmail())
        );

        assertEquals("A share request is already pending for this user.", ex.getMessage());
        assertEquals(1, permissions.size());
        assertEquals("Already sent", permissions.get(0).getMessage());
        assertTrue(auditActions.isEmpty());
    }

    @Test
    void shareFileTurnsDeclinedPermissionBackIntoPendingRequest() throws Exception {
        Users owner = user(1L, "owner@example.com");
        Users recipient = user(2L, "recipient@example.com");
        Files file = file(10L, owner);
        addUsers(owner, recipient);
        files.put(file.getId(), file);
        FilePermission declined = permission(20L, file, recipient, ShareStatus.DECLINED, "Old");
        permissions.add(declined);

        service.shareFile(shareRequest(file.getId(), recipient.getEmail(), "New message"), owner.getEmail());

        assertEquals(1, permissions.size());
        assertSame(declined, permissions.get(0));
        assertEquals(ShareStatus.PENDING, declined.getStatus());
        assertEquals("New message", declined.getMessage());
        assertNotNull(declined.getStatusChangedAt());
        assertEquals(List.of("RESHARE_FILE"), auditActions);
    }

    @Test
    void getFilesSharedWithUserReturnsOnlyPendingAndAcceptedShares() {
        Users owner = user(1L, "owner@example.com");
        Users recipient = user(2L, "recipient@example.com");
        addUsers(owner, recipient);
        Files pendingFile = file(10L, owner);
        pendingFile.setDisplayName("pending.pdf");
        Files acceptedFile = file(11L, owner);
        acceptedFile.setDisplayName("accepted.pdf");
        Files declinedFile = file(12L, owner);
        declinedFile.setDisplayName("declined.pdf");
        permissions.add(permission(20L, pendingFile, recipient, ShareStatus.PENDING, "Pending"));
        permissions.add(permission(21L, acceptedFile, recipient, ShareStatus.ACCEPTED, "Accepted"));
        permissions.add(permission(22L, declinedFile, recipient, ShareStatus.DECLINED, "Declined"));

        List<SharedFileDto> result = service.getFilesSharedWithUser(recipient.getEmail());

        assertEquals(2, result.size());
        assertEquals(List.of(ShareStatus.PENDING, ShareStatus.ACCEPTED),
                result.stream().map(SharedFileDto::getShareStatus).toList());
        assertFalse(result.stream().anyMatch(dto -> "declined.pdf".equals(dto.getDisplayName())));
    }

    @Test
    void acceptShareRequiresCurrentUserToBeRecipient() {
        Users owner = user(1L, "owner@example.com");
        Users recipient = user(2L, "recipient@example.com");
        Users stranger = user(3L, "stranger@example.com");
        FilePermission permission = permission(20L, file(10L, owner), recipient, ShareStatus.PENDING, "Read this");
        permissions.add(permission);

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> service.acceptShare(permission.getId(), stranger.getEmail())
        );

        assertEquals("You are not authorized to accept this share", ex.getMessage());
        assertEquals(ShareStatus.PENDING, permission.getStatus());
        assertTrue(auditActions.isEmpty());
    }

    @Test
    void acceptShareChangesStatusAndWritesBothAuditEntries() {
        Users owner = user(1L, "owner@example.com");
        Users recipient = user(2L, "recipient@example.com");
        FilePermission permission = permission(20L, file(10L, owner), recipient, ShareStatus.PENDING, "Read this");
        permissions.add(permission);

        service.acceptShare(permission.getId(), recipient.getEmail());

        assertEquals(ShareStatus.ACCEPTED, permission.getStatus());
        assertNotNull(permission.getStatusChangedAt());
        assertEquals(List.of("ACCEPT_SHARE", "SHARE_ACCEPTED"), auditActions);
    }

    @Test
    void revokeAccessRequiresOwnerEmailIgnoringCaseAndWhitespace() throws Exception {
        Users owner = user(1L, "owner@example.com");
        Users recipient = user(2L, "recipient@example.com");
        Files file = file(10L, owner);
        files.put(file.getId(), file);
        permissions.add(permission(20L, file, recipient, ShareStatus.ACCEPTED, null));

        service.revokeAccess(file.getId(), recipient.getEmail(), " OWNER@example.com ");

        assertTrue(permissions.isEmpty());
        assertEquals(List.of("REVOKE_ACCESS"), auditActions);
    }

    @Test
    void updateMessageRequiresFileOwner() {
        Users owner = user(1L, "owner@example.com");
        Users recipient = user(2L, "recipient@example.com");
        Files file = file(10L, owner);
        addUsers(owner, recipient);
        files.put(file.getId(), file);
        permissions.add(permission(20L, file, recipient, ShareStatus.ACCEPTED, "Old"));

        assertThrows(
                AccessDeniedException.class,
                () -> service.updateMessage(file.getId(), recipient.getId(), recipient.getEmail(), "New")
        );

        assertEquals("Old", permissions.get(0).getMessage());
        assertTrue(auditActions.isEmpty());
    }

    @Test
    void removeMessageAllowsReceiverToClearOwnShareMessage() throws Exception {
        Users owner = user(1L, "owner@example.com");
        Users recipient = user(2L, "recipient@example.com");
        Files file = file(10L, owner);
        addUsers(owner, recipient);
        files.put(file.getId(), file);
        permissions.add(permission(20L, file, recipient, ShareStatus.ACCEPTED, "Remove me"));

        service.removeMessage(file.getId(), recipient.getEmail(), recipient.getEmail());

        assertNull(permissions.get(0).getMessage());
        assertEquals(List.of("REMOVE_MESSAGE"), auditActions);
    }

    private FileRepo fileRepo() {
        return proxy(FileRepo.class, (method, args) -> switch (method) {
            case "findById" -> Optional.ofNullable(files.get((Long) args[0]));
            case "findAll" -> new ArrayList<>(files.values());
            case "save" -> {
                Files file = (Files) args[0];
                files.put(file.getId(), file);
                yield file;
            }
            default -> unsupported(method);
        });
    }

    private UserRepo userRepo() {
        return proxy(UserRepo.class, (method, args) -> switch (method) {
            case "findByEmail" -> Optional.ofNullable(usersByEmail.get((String) args[0]));
            case "findById" -> Optional.ofNullable(usersById.get((Long) args[0]));
            default -> unsupported(method);
        });
    }

    private FilePermissionRepo filePermissionRepo() {
        return proxy(FilePermissionRepo.class, (method, args) -> switch (method) {
            case "findById" -> permissions.stream()
                    .filter(permission -> permission.getId().equals((Long) args[0]))
                    .findFirst();
            case "findBySharedWithEmail" -> permissions.stream()
                    .filter(permission -> permission.getSharedWith().getEmail().equals(args[0]))
                    .toList();
            case "findByFileId" -> permissions.stream()
                    .filter(permission -> permission.getFile().getId().equals((Long) args[0]))
                    .toList();
            case "findAllByFileIdAndSharedWithEmail" -> permissions.stream()
                    .filter(permission -> permission.getFile().getId().equals((Long) args[0]))
                    .filter(permission -> permission.getSharedWith().getEmail().equals(args[1]))
                    .toList();
            case "findByFileAndSharedWith" -> permissions.stream()
                    .filter(permission -> permission.getFile() == args[0])
                    .filter(permission -> permission.getSharedWith() == args[1])
                    .findFirst();
            case "save" -> {
                FilePermission permission = (FilePermission) args[0];
                if (!permissions.contains(permission)) {
                    permissions.add(permission);
                }
                yield permission;
            }
            case "deleteAll" -> {
                permissions.removeAll((List<?>) args[0]);
                yield null;
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

    private ShareFileRequestDto shareRequest(Long fileId, String targetEmail, String message) {
        ShareFileRequestDto dto = new ShareFileRequestDto();
        dto.setFileId(fileId);
        dto.setTargetUserEmail(targetEmail);
        dto.setMessage(message);
        return dto;
    }

    private void addUsers(Users... users) {
        for (Users user : users) {
            usersById.put(user.getId(), user);
            usersByEmail.put(user.getEmail(), user);
        }
    }

    private Users user(Long id, String email) {
        Users user = new Users();
        user.setId(id);
        user.setEmail(email);
        user.setPassword("password");
        user.setUsername(email.substring(0, email.indexOf('@')));
        return user;
    }

    private Files file(Long id, Users owner) {
        return Files.builder()
                .id(id)
                .owner(owner)
                .displayName("report.pdf")
                .s3Key("report.pdf")
                .size(100L)
                .build();
    }

    private FilePermission permission(Long id, Files file, Users recipient, ShareStatus status, String message) {
        return FilePermission.builder()
                .id(id)
                .file(file)
                .sharedWith(recipient)
                .status(status)
                .message(message)
                .sharedAt(LocalDateTime.now().minusDays(1))
                .statusChangedAt(LocalDateTime.now().minusDays(1))
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

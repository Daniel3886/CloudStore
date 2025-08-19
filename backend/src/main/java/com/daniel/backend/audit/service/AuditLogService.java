package com.daniel.backend.audit.service;

import com.daniel.backend.audit.dto.AuditLogDto;
import com.daniel.backend.audit.entity.AuditLog;
import com.daniel.backend.audit.repository.AuditLogRepo;
import com.daniel.backend.file.entity.Files;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepo repo;

    public void log(String action, String performedBy, Files fileId, String description) {
        AuditLog log = AuditLog.builder()
                .action(action)
                .performedBy(performedBy)
                .file(fileId)
                .description(description)
                .timestamp(LocalDateTime.now())
                .build();
        repo.save(log);
    }

    public List<AuditLogDto> getAllLogsForUser(String email) {
        return repo.findByPerformedByOrderByTimestampDesc(email)
                .stream()
                .map(log -> new AuditLogDto(
                        log.getAction(),
                        log.getPerformedBy(),
                        log.getDescription(),
                        log.getTimestamp(),
                        log.getFile() != null ? log.getFile().getDisplayName() : null
                ))
                .toList();
    }

    public List<AuditLogDto> getLogsForPeriod(String email, int days) {
        LocalDateTime from = LocalDateTime.now().minusDays(days);
        return repo.findRecentActions(email, from)
                .stream()
                .map(log -> new AuditLogDto(
                        log.getAction(),
                        log.getPerformedBy(),
                        log.getDescription(),
                        log.getTimestamp(),
                        log.getFile() != null ? log.getFile().getDisplayName() : null
                ))
                .toList();
    }
}

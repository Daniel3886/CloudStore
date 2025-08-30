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
    private static final int MAX_LOGS_PER_USER = 100;

    public void log(String action, String performedBy, Files file, String description) {
        AuditLog log = AuditLog.builder()
                .action(action)
                .performedBy(performedBy)
                .fileId(file != null ? file.getId() : null)
                .fileName(file != null ? file.getDisplayName() : null)
                .description(description)
                .timestamp(LocalDateTime.now())
                .build();
        repo.save(log);

        long count = repo.countByPerformedBy(performedBy);

        if (count > MAX_LOGS_PER_USER) {
            long excess = count - MAX_LOGS_PER_USER;
            List<AuditLog> oldestLogs = repo.findOldestLogsForUser(performedBy, (int) excess);
            repo.deleteAll(oldestLogs);
        }
    }

    public List<AuditLogDto> getAllLogsForUser(String email) {
        return repo.findByPerformedByOrderByTimestampDesc(email)
                .stream()
                .map(log -> new AuditLogDto(
                        log.getAction(),
                        log.getPerformedBy(),
                        log.getDescription(),
                        log.getTimestamp(),
                        log.getFileName()
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
                        log.getFileName()
                ))
                .toList();
    }
}

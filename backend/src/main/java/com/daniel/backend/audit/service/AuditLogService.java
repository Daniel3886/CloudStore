package com.daniel.backend.audit.service;

import com.daniel.backend.audit.entity.AuditLog;
import com.daniel.backend.audit.repository.AuditLogRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepo repo;

    public void log(String action, String performedBy, String fileId, String description) {
        AuditLog log = AuditLog.builder()
                .action(action)
                .performedBy(performedBy)
                .fileId(fileId)
                .description(description)
                .timestamp(LocalDateTime.now())
                .build();
        repo.save(log);
    }

    public List<AuditLog> getAllLogsForUser(String email) {
        return repo.findByPerformedByOrderByTimestampDesc(email);
    }

    public List<AuditLog> getLogsForPeriod(String email, int days) {
        LocalDateTime from = LocalDateTime.now().minusDays(days);
        return repo.findRecentActions(email, from);
    }

}

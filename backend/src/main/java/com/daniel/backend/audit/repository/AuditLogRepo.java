package com.daniel.backend.audit.repository;

import com.daniel.backend.audit.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface AuditLogRepo extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByPerformedByOrderByTimestampDesc(String performedBy);

    @Query("SELECT action FROM AuditLog action WHERE action.performedBy = :email AND action.timestamp >= :from")
    List<AuditLog> findRecentActions(String email, LocalDateTime from);
}

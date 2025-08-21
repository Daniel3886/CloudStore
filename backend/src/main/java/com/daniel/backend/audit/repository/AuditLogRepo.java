package com.daniel.backend.audit.repository;

import com.daniel.backend.audit.entity.AuditLog;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AuditLogRepo extends JpaRepository<AuditLog, Long> {

    long countByPerformedBy(String performedBy);

    List<AuditLog> findByPerformedByOrderByTimestampDesc(String performedBy);

    @Query("SELECT a FROM AuditLog a WHERE a.performedBy = :user ORDER BY a.timestamp ASC")
    List<AuditLog> findOldestLogsForUser(@Param("user") String user, Pageable pageable);

    default List<AuditLog> findOldestLogsForUser(String user, int limit) {
        return findOldestLogsForUser(user, PageRequest.of(0, limit));
    }

    @Query("SELECT a FROM AuditLog a WHERE a.performedBy = :user AND a.timestamp >= :from ORDER BY a.timestamp DESC")
    List<AuditLog> findRecentActions(@Param("user") String user, @Param("from") LocalDateTime from);
}


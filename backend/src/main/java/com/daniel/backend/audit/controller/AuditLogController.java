package com.daniel.backend.audit.controller;

import com.daniel.backend.audit.dto.AuditLogDto;
import com.daniel.backend.audit.entity.AuditLog;
import com.daniel.backend.audit.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/activity")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping("/all")
    public List<AuditLogDto> getAllLogs(HttpServletRequest request) {
        String email = request.getUserPrincipal().getName();
        return auditLogService.getAllLogsForUser(email);
    }

    @GetMapping
    public List<AuditLogDto> getLogsByPeriod(
            @RequestParam(defaultValue = "30") int days,
            HttpServletRequest request
    ) {
        String email = request.getUserPrincipal().getName();
        return auditLogService.getLogsForPeriod(email, days);
    }

}

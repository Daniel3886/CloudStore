    package com.daniel.backend.audit.entity;
    
    import com.daniel.backend.file.entity.Files;
    import jakarta.persistence.*;
    import lombok.*;
    import java.time.LocalDateTime;
    
    @Entity
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public class AuditLog {
    
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(name = "file_id")
        private Long fileId;

        @Column(name = "file_name")
        private String fileName;
    
        private String action;
    
        private String description;
    
        private String performedBy;
    
        private LocalDateTime timestamp;
    }

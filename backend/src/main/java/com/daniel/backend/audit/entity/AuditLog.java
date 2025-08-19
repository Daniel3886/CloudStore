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
    
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "file_id", referencedColumnName = "id")
        private Files file;
    
        private String action;
    
        private String description;
    
        private String performedBy;
    
        private LocalDateTime timestamp;
    }

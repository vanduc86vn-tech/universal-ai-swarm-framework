-- ============================================================================
-- HDD SWARM GOVERNANCE - FULL DATABASE DDL SPECIFICATION
-- Source Database: hdd_swarm_governance (31.220.60.199:3306)
-- Generated At: 2026-11-01T10:58:34.457Z
-- System: HDD-AI-ERP & HDD-CLOUD Enterprise Governance Hub
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `hdd_swarm_governance` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `hdd_swarm_governance`;

SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------
-- SECTION 1: BASE TABLES (29 TABLES: PROJECTS, WBS, TASKS, AUDIT, METRICS)
-- ----------------------------------------------------------------------------

-- Table: ActivityLogs
CREATE TABLE `ActivityLogs` (
  `LogID` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `TableName` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `RecordID` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `OldData` text COLLATE utf8mb4_unicode_ci,
  `NewData` text COLLATE utf8mb4_unicode_ci,
  `PerformedBy` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Timestamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`LogID`),
  KEY `idx_activity_table` (`TableName`,`RecordID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: Governance_Admin_Users
CREATE TABLE `Governance_Admin_Users` (
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã định danh duy nhất (UUID/USR-XXX)',
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên đăng nhập duy nhất (aroot, sep, ceo, auditor, admin)',
  `full_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Họ tên người dùng / Chức danh quản trị',
  `role_code` enum('CHIEF_EXECUTIVE','SUPER_AUDITOR','SECURITY_ADMIN','DEV_LEAD') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SUPER_AUDITOR' COMMENT 'Vai trò RBAC điều hành',
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mật khẩu băm an toàn Salted SHA-256 hoặc Bcrypt/Argon2',
  `password_salt` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Chuỗi muối ngẫu nhiên (Cryptographic Salt) chống Rainbow Table',
  `hash_algorithm` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SALTED_SHA256' COMMENT 'Thuật toán băm: SALTED_SHA256, BCRYPT, ARGON2ID',
  `linked_employee_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Khóa ngoại logic liên kết hdd_appsheet.Employees (EMP001, EMP002, ...)',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1: Hoạt động, 0: Khóa tài khoản',
  `failed_login_attempts` tinyint NOT NULL DEFAULT '0' COMMENT 'Số lần đăng nhập sai liên tiếp (Khóa sau 5 lần)',
  `locked_until` datetime DEFAULT NULL COMMENT 'Thời hạn tự động mở khóa sau khi bị lock tạm thời',
  `last_login_at` datetime DEFAULT NULL COMMENT 'Thời điểm đăng nhập thành công gần nhất',
  `last_login_ip` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Địa chỉ IP đăng nhập gần nhất (Hỗ trợ IPv4/IPv6)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uk_gau_username` (`username`),
  KEY `idx_gau_role` (`role_code`),
  KEY `idx_gau_active_status` (`is_active`,`locked_until`),
  KEY `idx_gau_linked_emp` (`linked_employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng quản trị tài khoản xác thực Admin và Kiểm toán độc lập cho Cổng Audit Portal';

-- Table: Governance_Safety_Rules_16
CREATE TABLE `Governance_Safety_Rules_16` (
  `rule_id` int NOT NULL AUTO_INCREMENT,
  `rule_group` enum('A - Trí nhớ nằm trong file & CSDL','B - Kiểm chứng, không tin lời','C - Chống xả việc khi hạn mức phục hồi','D - Chạy gọn cho gói Pro') COLLATE utf8mb4_unicode_ci NOT NULL,
  `measure_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên biện pháp',
  `prevents_risk` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Chống được gì',
  `core_principles` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nguyên tắc bảo mật / kiến trúc (CIA, SOLID, Microservices)',
  `status` enum('XONG','ĐANG_ÁP_DỤNG','MỘT_PHẦN','CÓ_LUẬT_CHƯA_THỬ','CHƯA_CHẠY') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ĐANG_ÁP_DỤNG',
  `evidence_or_missing` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Bằng chứng vật lý / Còn thiếu',
  `ssot_verification_view` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'vw_Project_Runtime_MasterPlan_SSOT',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`rule_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='16 Biện Pháp Quản Trị Phòng Ngừa Rủi Ro Toàn Swarm (UASOF V4.4)';

-- Table: Project_AuditAccessLogs
CREATE TABLE `Project_AuditAccessLogs` (
  `LogID` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'LOGIN, VIEW_PROGRESS, DOWNLOAD_BACKUP, EXECUTE_QUERY',
  `ClientIP` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `UserAgent` text COLLATE utf8mb4_unicode_ci,
  `AccessGranted` tinyint(1) NOT NULL DEFAULT '1',
  `DenialReason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Timestamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`LogID`),
  KEY `idx_access_time` (`Timestamp`,`Username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Nhật ký truy vết bảo mật 100% ABAC/RBAC';

-- Table: Project_AuditAccounts
CREATE TABLE `Project_AuditAccounts` (
  `AccountID` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã tài khoản (UUID hoặc username)',
  `Username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên đăng nhập kiểm chứng',
  `PasswordHash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mật khẩu băm an toàn (bcrypt)',
  `FullName` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Họ tên người kiểm chứng',
  `Role` enum('SUPER_AUDITOR','CHIEF_EXECUTIVE','SYSTEM_ADMIN','SECURITY_OFFICER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SUPER_AUDITOR',
  `AllowedIPs` text COLLATE utf8mb4_unicode_ci COMMENT 'ABAC: Danh sách IP được phép truy cập (NULL: mọi IP)',
  `IsActive` tinyint(1) NOT NULL DEFAULT '1',
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`AccountID`),
  UNIQUE KEY `uk_audit_username` (`Username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tài khoản truy cập Cổng Kiểm Chứng & Backup Bảo Mật';

-- Table: Project_AuditLogs
CREATE TABLE `Project_AuditLogs` (
  `AuditLogID` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'M?? bi??n b???n (UUID)',
  `project_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'HDD-CLOUD',
  `TaskID` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'M?? t??c v??? ???????c th???m ?????nh',
  `AuditorRole` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'AI-AUDIT-QA' COMMENT 'T??c nh??n th???m ?????nh',
  `AuditorConversationID` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'UUID phi??n chat QA',
  `Verdict` enum('PASSED','FAILED','WARNING') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Ph??n quy???t',
  `Findings` json NOT NULL COMMENT 'Chi ti???t c??c ti??u ch?? ki???m th??? (C?? ph??p, An to??n, 3NF, API Test)',
  `ViolationsFound` text COLLATE utf8mb4_unicode_ci COMMENT 'C??c l???i ho???c r???i ro ph??t hi???n',
  `Recommendations` text COLLATE utf8mb4_unicode_ci COMMENT 'Khuy???n ngh??? kh???c ph???c',
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`AuditLogID`),
  KEY `idx_audit_task_verdict` (`TaskID`,`Verdict`,`CreatedAt`),
  KEY `fk_auditlog_project` (`project_id`),
  CONSTRAINT `fk_auditlog_project` FOREIGN KEY (`project_id`) REFERENCES `Projects` (`project_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_auditlog_task` FOREIGN KEY (`TaskID`) REFERENCES `Project_Tasks` (`TaskID`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Nh???t k?? th???m tra ?????c l???p Zero-Trust c???a QA';

-- Table: Project_BackupArchives
CREATE TABLE `Project_BackupArchives` (
  `BackupID` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã bản sao lưu',
  `project_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'HDD-CLOUD',
  `BackupName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên file sao lưu vật lý trên máy chủ',
  `FilePath` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Đường dẫn an toàn trên VPS (/var/backups/...)',
  `FileSizeBytes` bigint NOT NULL COMMENT 'Kích thước file (bytes)',
  `ChecksumSHA256` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Mã băm kiểm tra tính toàn vẹn',
  `DatabaseTarget` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hdd_swarm_governance',
  `BackupType` enum('AUTO_CRON_2H','MANUAL_TRIGGER','PRE_MIGRATION','NIGHTLY_FULL') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'AUTO_CRON_2H',
  `CreatedBy` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SYSTEM_CRON',
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`BackupID`),
  KEY `idx_backup_type_time` (`BackupType`,`CreatedAt`),
  KEY `fk_backup_project` (`project_id`),
  CONSTRAINT `fk_backup_project` FOREIGN KEY (`project_id`) REFERENCES `Projects` (`project_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Danh mục các bản snapshot sao lưu CSDL vật lý';

-- Table: Project_DeployLogs
CREATE TABLE `Project_DeployLogs` (
  `DeployID` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'M?? phi??n tri???n khai (UUID)',
  `project_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'HDD-CLOUD',
  `PlanID` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'K??? ho???ch tri???n khai',
  `Environment` enum('DEV','STAGING','PRODUCTION') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DEV' COMMENT 'M??i tr?????ng ????ch',
  `ScriptFile` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'File migration ??p d???ng',
  `ExecutedBy` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'T??c nh??n th???c hi???n',
  `ExecutionStatus` enum('SUCCESS','FAILED','ROLLED_BACK') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'K???t qu??? ch???y script',
  `ErrorMessage` text COLLATE utf8mb4_unicode_ci COMMENT 'Th??ng b??o l???i chi ti???t n???u th???t b???i',
  `ExecutionTimeMs` int DEFAULT NULL COMMENT 'Th???i gian th???c thi (mili-gi??y)',
  `AppliedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`DeployID`),
  KEY `fk_deploylog_plan` (`PlanID`),
  KEY `idx_deploy_env_status` (`Environment`,`ExecutionStatus`,`AppliedAt`),
  KEY `fk_deploylog_project` (`project_id`),
  CONSTRAINT `fk_deploylog_plan` FOREIGN KEY (`PlanID`) REFERENCES `Project_MasterPlans` (`PlanID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_deploylog_project` FOREIGN KEY (`project_id`) REFERENCES `Projects` (`project_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Nh???t k?? tri???n khai migration v?? c???p nh???t h??? t???ng VPS';

-- Table: Project_MasterPlans
CREATE TABLE `Project_MasterPlans` (
  `PlanID` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'M?? k??? ho???ch t???ng th??? (VD: MP-INTEGRATION-DEV-20261027)',
  `project_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'HDD-CLOUD',
  `PlanName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'T??n chi???n d???ch / K??? ho???ch t???ng th???',
  `Description` text COLLATE utf8mb4_unicode_ci COMMENT 'M?? t??? m???c ti??u chi???n l?????c v?? ph???m vi tri???n khai',
  `TargetDatabase` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hdd_appsheet' COMMENT 'CSDL m???c ti??u',
  `Status` enum('DRAFT','ACTIVE','PAUSED','COMPLETED','ARCHIVED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT' COMMENT 'Tr???ng th??i v??ng ?????i k??? ho???ch',
  `StartedAt` datetime DEFAULT NULL COMMENT 'Th???i ??i???m b???t ?????u th???c thi',
  `CompletedAt` datetime DEFAULT NULL COMMENT 'Th???i ??i???m nghi???m thu ho??n t???t',
  `DeadlineAt` datetime DEFAULT NULL,
  `CreatedBy` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'AI-LEAD&BA' COMMENT 'T??c nh??n kh???i t???o',
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`PlanID`),
  KEY `idx_masterplan_status` (`Status`,`TargetDatabase`),
  KEY `fk_mp_project` (`project_id`),
  CONSTRAINT `fk_mp_project` FOREIGN KEY (`project_id`) REFERENCES `Projects` (`project_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='K??? ho???ch t???ng th??? Master Plan qu???n tr??? d??? ??n';

-- Table: Project_SubPlans
CREATE TABLE `Project_SubPlans` (
  `SubPlanID` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'M?? ph??n h??? (VD: SUB_01, SUB_02, ..., SUB_09)',
  `PlanID` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Kh??a ngo???i tr??? v??? Project_MasterPlans',
  `SubPlanName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'T??n ph??n h??? (VD: Ph??n H??? B??n H??ng & POS)',
  `DocumentationFile` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '???????ng d???n t??i li???u quy chi???u (docs/sub_plans/...)',
  `Status` enum('PENDING','IN_PROGRESS','READY_FOR_AUDIT','AUDITED','COMPLETED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING' COMMENT 'Tr???ng th??i ph??n h???',
  `LeadArchitect` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'AI-LEAD&BA' COMMENT 'Ki???n tr??c s?? ph??? tr??ch',
  `WeightPercentage` decimal(5,2) NOT NULL DEFAULT '11.11' COMMENT 'T??? tr???ng ho??n th??nh (%)',
  `DeadlineAt` datetime DEFAULT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`SubPlanID`),
  KEY `fk_subplan_masterplan` (`PlanID`),
  KEY `idx_subplan_status` (`Status`,`PlanID`),
  CONSTRAINT `fk_subplan_masterplan` FOREIGN KEY (`PlanID`) REFERENCES `Project_MasterPlans` (`PlanID`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Danh m???c 9 Sub-Plans ch???c n??ng c???a h??? th???ng';

-- Table: Project_Tasks
CREATE TABLE `Project_Tasks` (
  `TaskID` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'M?? t??c v??? duy nh???t (VD: TASK-DB-006, TASK-BE-001)',
  `project_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'HDD-CLOUD',
  `TaskSeq` int NOT NULL AUTO_INCREMENT,
  `SubPlanID` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'B???t bu???c thu???c m???t SubPlan (Kh??a ngo???i c???ng)',
  `AssignedWorker` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Worker ???????c ch??? ?????nh thi c??ng',
  `AssignedConversationID` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'UUID phi??n chat c???a Worker',
  `Title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Ti??u ????? t??c v???',
  `Description` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '?????c t??? y??u c???u chi ti???t',
  `Status` enum('OPEN','ASSIGNED','IN_PROGRESS','READY_FOR_AUDIT','AUDIT_FAILED','AUDIT_PASSED','COMPLETED','BLOCKED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OPEN' COMMENT 'V??ng ?????i t??c v???',
  `AuditVerdict` enum('NONE','PASSED','FAILED','WARNING') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NONE' COMMENT 'K???t lu???n th???m tra ?????c l???p c???a QA',
  `AuditNotes` text COLLATE utf8mb4_unicode_ci COMMENT 'Bi??n b???n ghi ch?? c???a AI-AUDIT-QA',
  `AuditedBy` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ki???m to??n vi??n th??? l?? (b???t bu???c AI-AUDIT-QA)',
  `AuditedAt` datetime DEFAULT NULL COMMENT 'Th???i ??i???m ki???m to??n',
  `ResultSummary` text COLLATE utf8mb4_unicode_ci COMMENT 'T??m t???t k???t qu??? th???c thi c???a Worker',
  `Deliverables` json DEFAULT NULL COMMENT 'Danh s??ch file b??n giao (m???ng JSON c??c file path)',
  `StartedAt` datetime DEFAULT NULL COMMENT 'Th???i ??i???m b???t ?????u l??m',
  `CompletedAt` datetime DEFAULT NULL COMMENT 'Th???i ??i???m ho??n th??nh th???c t???',
  `DeadlineAt` datetime DEFAULT NULL,
  `EstimatedHours` decimal(5,2) DEFAULT NULL,
  `IsOverdue` tinyint(1) DEFAULT '0',
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`TaskID`),
  UNIQUE KEY `TaskSeq` (`TaskSeq`),
  KEY `fk_task_subplan` (`SubPlanID`),
  KEY `idx_task_lifecycle` (`Status`,`AssignedWorker`,`SubPlanID`),
  KEY `fk_tasks_project` (`project_id`),
  KEY `fk_task_worker` (`AssignedWorker`,`project_id`),
  CONSTRAINT `fk_task_subplan` FOREIGN KEY (`SubPlanID`) REFERENCES `Project_SubPlans` (`SubPlanID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_task_worker` FOREIGN KEY (`AssignedWorker`, `project_id`) REFERENCES `Project_Workers` (`WorkerRole`, `project_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_tasks_project` FOREIGN KEY (`project_id`) REFERENCES `Projects` (`project_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=367 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='B???ng qu???n tr??? t??c v??? chi ti???t v?? tr???ng th??i ki???m so??t';

-- Table: Project_User_Grants
CREATE TABLE `Project_User_Grants` (
  `grant_id` int NOT NULL AUTO_INCREMENT,
  `project_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `system_username` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Linux user sở hữu/thao tác (dev_nam, dev_hung...)',
  `role_in_project` enum('CHIEF','LEADER','DEVELOPER','AUDITOR') COLLATE utf8mb4_unicode_ci DEFAULT 'DEVELOPER',
  `assigned_port` int DEFAULT NULL COMMENT 'Port Remote Control Safari iPhone riêng cho user',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`grant_id`),
  UNIQUE KEY `uk_project_user` (`project_id`,`system_username`),
  CONSTRAINT `fk_pug_project` FOREIGN KEY (`project_id`) REFERENCES `Projects` (`project_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Cấp quyền truy cập Đa tài khoản cho từng dự án';

-- Table: Project_Workers
CREATE TABLE `Project_Workers` (
  `WorkerRole` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'T??n vai tr?? (VD: AI-DATABASE-RESEARCHER, AI-BACKEND, AI-AUDIT-QA)',
  `project_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'HDD-CLOUD',
  `owner_username` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'aroot',
  `CurrentConversationID` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'UUID phi??n chat Antigravity ??ang g???n k???t',
  `DedicatedModule` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ph??n h??? chuy??n tr??ch',
  `IsActive` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1: ??ang tr???c chi???n; 0: T???m d???ng',
  `LastHeartbeatAt` datetime DEFAULT NULL COMMENT 'Th???i ??i???m Watcher g???i t??n hi???u g???n nh???t',
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`WorkerRole`,`project_id`),
  KEY `idx_worker_convo` (`CurrentConversationID`,`IsActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='?????nh danh v?? tr???ng th??i c??c AI Worker trong Swarm';

-- Table: Projects
CREATE TABLE `Projects` (
  `project_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã dự án chuẩn hóa (VD: HDD-CLOUD, HDD-ERP)',
  `project_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên hiển thị dự án',
  `git_repository_url` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'URL Git Repository',
  `root_workspace_path` varchar(512) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Đường dẫn thư mục dự án trên VPS',
  `status` enum('ACTIVE','ARCHIVED','PAUSED') COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVE',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Thực thể quản lý các dự án vật lý toàn Swarm';

-- Table: Swarm_AI_Entities
CREATE TABLE `Swarm_AI_Entities` (
  `slot_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `physical_display_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `conversation_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_tier` enum('STRATEGIC_HIGH_LEVEL','EXECUTION_WORKER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'EXECUTION_WORKER',
  `current_model` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Gemini 3.8 Flash (Low)',
  `model_tier` enum('HIGH_REASONING','FAST_EXECUTION') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'FAST_EXECUTION',
  `token_status` enum('ACTIVE','QUOTA_EXHAUSTED','BUSY_HEAVY_TASK','OFFLINE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `operational_state` enum('ACTIVE_DUTY','STANDBY_REST','SUSPENDED_FOR_REFACTOR') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'STANDBY_REST',
  `quality_score` decimal(5,2) NOT NULL DEFAULT '100.00',
  `last_heartbeat` datetime DEFAULT CURRENT_TIMESTAMP,
  `exclusive_boundaries` json DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_code`),
  UNIQUE KEY `uk_slot_id` (`slot_id`),
  KEY `idx_token_status` (`token_status`,`current_model`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Danh bạ động 11+ thực thể AI vật lý, Model hiện tại và Trạng thái Token';

-- Table: Swarm_Constitution_Audit_Log
CREATE TABLE `Swarm_Constitution_Audit_Log` (
  `audit_id` int NOT NULL AUTO_INCREMENT,
  `role_code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `version_from` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `version_to` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `previous_prompt_snapshot` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `new_prompt_snapshot` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `refactor_reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `zero_hardcode_verified` tinyint(1) NOT NULL DEFAULT '1',
  `kpi_score_before` decimal(5,2) DEFAULT '80.00',
  `kpi_score_after` decimal(5,2) DEFAULT '95.00',
  `proposed_by_pm` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'AI-PROJECT-MANAGER',
  `approved_by_chief_of_staff` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '[[ BOSS-EXECUTIVE-CHIEF ]]',
  `status` enum('ACTIVE','ROLLED_BACK','PENDING_APPROVAL') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`audit_id`),
  KEY `idx_role_code` (`role_code`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: Swarm_Executive_Decision_Matrix
CREATE TABLE `Swarm_Executive_Decision_Matrix` (
  `measure_id` int NOT NULL,
  `group_code` enum('A','B','C','D') COLLATE utf8mb4_unicode_ci NOT NULL,
  `group_title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `measure_title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `measure_subtitle` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `risk_mitigated` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `engineering_principles` json NOT NULL,
  `status_label` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Xong',
  `status_category` enum('DONE','UNVERIFIED_RULE','GAP_OR_PARTIAL') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DONE',
  `proof_or_missing` text COLLATE utf8mb4_unicode_ci,
  `is_approved` tinyint(1) NOT NULL DEFAULT '1',
  `approved_by` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'aroot (Default Opt-In)',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`measure_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: Swarm_Knowledge_Base
CREATE TABLE `Swarm_Knowledge_Base` (
  `DocID` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã tài liệu tri thức (VD: KB-DOC-001, KB-PROC-001)',
  `ModuleCode` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SYSTEM' COMMENT 'Phân hệ: CORE_AUTH, MRP, WMS, SALES, FIN, HR, CRM, PORTAL, GOV',
  `DocType` enum('STORED_PROCEDURE','TRIGGER','VIEW','AUDIT_REPORT','ARCHITECTURE_DECISION','LESSON_LEARNED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `Title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tiêu đề tri thức / Tên Routine',
  `SummaryExtract` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tóm tắt nghiệp vụ cô đọng (<100 từ) phục vụ prompt token siêu gọn',
  `TechnicalSignature` text COLLATE utf8mb4_unicode_ci COMMENT 'Chữ ký hàm / DDL parameters / Tables tác động',
  `PhysicalFilePath` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Đường dẫn file vật lý nguồn',
  `Tags` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tags tìm kiếm: #auth #salt #sha256 #procedure',
  `ReusabilityScore` int NOT NULL DEFAULT '100' COMMENT 'Điểm tái sử dụng (0 - 100)',
  `CreatedBy` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'AI-ARCHITECT',
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`DocID`),
  KEY `idx_module_doctype` (`ModuleCode`,`DocType`),
  FULLTEXT KEY `ft_knowledge_search` (`Title`,`SummaryExtract`,`Tags`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Kho tri thức số hóa tối ưu hóa Token cho AI Swarm tra cứu siêu tốc';

-- Table: Swarm_Lessons_Learned
CREATE TABLE `Swarm_Lessons_Learned` (
  `lesson_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_role` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Role cụ thể hoặc ALL_SWARM',
  `boss_directive` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Lời nhắc nhở / răn đe trực tiếp của Sếp',
  `prevention_rule` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Thuốc đặc trị vật lý bắt buộc tuân thủ',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`lesson_id`),
  KEY `idx_lesson_target_role` (`target_role`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Cẩm nang các bài học xương máu Sếp nhắc nhở cho từng vai trò';

-- Table: Swarm_Role_Constitutions
CREATE TABLE `Swarm_Role_Constitutions` (
  `role_code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `constitution_version` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '1.0.0-PROD',
  `core_rules_summary` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Hiến pháp tinh túy dưới 500 chữ của riêng từng vai trò',
  `locked_by_boss` tinyint(1) NOT NULL DEFAULT '1',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_code`),
  CONSTRAINT `fk_constitution_entity` FOREIGN KEY (`role_code`) REFERENCES `Swarm_AI_Entities` (`role_code`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Hiến pháp tinh túy chọn lọc (<500 chữ) cho từng Role để nạp trong 10ms';

-- Table: Swarm_System_Mode
CREATE TABLE `Swarm_System_Mode` (
  `mode_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `current_mode` enum('MODE_FULL_PRODUCTION','MODE_STRATEGIC_HIGH_LEVEL','MODE_EMERGENCY_AUDIT') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MODE_STRATEGIC_HIGH_LEVEL',
  `active_high_level_roles` json NOT NULL,
  `standby_worker_roles` json NOT NULL,
  `resource_guard_policy` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'STRICT_NO_OVERKILL_NO_UNDERPOWERED',
  `activated_by` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`mode_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: Swarm_Worker_KPI_Token_Telemetry
CREATE TABLE `Swarm_Worker_KPI_Token_Telemetry` (
  `slot_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `conversation_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_tier` enum('STRATEGIC_HIGH_LEVEL','EXECUTION_WORKER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `current_model` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token_status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `operational_state` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token_cost_tier` enum('HIGH_COST_PREMIUM','LOW_COST_FLASH') COLLATE utf8mb4_unicode_ci NOT NULL,
  `estimated_tokens_consumed` bigint NOT NULL DEFAULT '0',
  `total_assigned_tasks` int NOT NULL DEFAULT '0',
  `completed_tasks` int NOT NULL DEFAULT '0',
  `in_progress_tasks` int NOT NULL DEFAULT '0',
  `rejected_or_rework_count` int NOT NULL DEFAULT '0',
  `tokens_per_completed_task` int NOT NULL DEFAULT '0',
  `first_time_pass_rate` decimal(5,2) NOT NULL DEFAULT '100.00',
  `on_time_completion_rate` decimal(5,2) DEFAULT '100.00',
  `kpi_efficiency_score` decimal(5,2) NOT NULL DEFAULT '100.00',
  `honest_evaluation_verdict` enum('EXCELLENT_ROI','GOOD_STRATEGIC','OVERKILL_WARNING','UNDERPERFORMING_REFACTOR_NEEDED','STANDBY_QUOTA_EXHAUSTED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `kpi_tier` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'GOLD_EXCELLENT',
  `reward_or_penalty_status` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'DUY TRÌ TÁC CHIẾN',
  `honest_audit_comment` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: Sys_Governance_Endpoints
CREATE TABLE `Sys_Governance_Endpoints` (
  `EndpointID` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã định danh duy nhất (VD: EP-SYNC-TASKS)',
  `Method` enum('GET','POST','PUT','DELETE','PATCH') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'GET',
  `Path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Đường dẫn route Express (VD: /sync-tasks, /tasks/:taskId/approve)',
  `ActionCommand` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên lệnh tương ứng trong CLI gov-client.js (VD: sync-tasks, approve)',
  `AuthScope` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'AUTH_JWT' COMMENT 'Cấp quyền: PUBLIC, AUTH_JWT, SUPER_AUDITOR, CHIEF_EXECUTIVE',
  `Description` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mô tả nghiệp vụ',
  `Handler` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên hàm Controller xử lý',
  `ParamSchema` json DEFAULT NULL COMMENT 'Lược đồ tham số hoặc body',
  `Status` enum('ACTIVE','DEPRECATED','DRAFT') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`EndpointID`),
  UNIQUE KEY `uk_method_path` (`Method`,`Path`),
  KEY `idx_action` (`ActionCommand`),
  KEY `idx_status` (`Status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Danh mục Endpoint Quản trị Dự án SSOT';

-- Table: Sys_Project_DDL_Evolution_Logs
CREATE TABLE `Sys_Project_DDL_Evolution_Logs` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `project_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'HDD-CLOUD',
  `executed_at` datetime NOT NULL,
  `command_sql` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `affected_rows` int DEFAULT '0',
  `status` enum('SUCCESS','FAILED') COLLATE utf8mb4_unicode_ci DEFAULT 'SUCCESS',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: Sys_Project_Tasks
CREATE TABLE `Sys_Project_Tasks` (
  `task_id` varchar(50) NOT NULL,
  `project_id` varchar(50) NOT NULL,
  `subplan_id` varchar(50) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `assigned_worker` varchar(50) DEFAULT NULL,
  `status` enum('PENDING','ASSIGNED','IN_PROGRESS','READY_FOR_AUDIT','COMPLETED','FAILED') DEFAULT 'PENDING',
  `priority` enum('LOW','MEDIUM','HIGH','CRITICAL') DEFAULT 'MEDIUM',
  `deliverables` json DEFAULT NULL,
  `result_summary` text,
  `deadline_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`task_id`),
  KEY `idx_proj_status` (`project_id`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: Sys_Projects
CREATE TABLE `Sys_Projects` (
  `project_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã tenant chuẩn hóa (vd: HDD-CLOUD, HDD-ERP)',
  `project_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `git_repository_url` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `root_workspace_path` varchar(512) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('ACTIVE','ARCHIVED','PAUSED') COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVE',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: Sys_Prompt_Cache_Index
CREATE TABLE `Sys_Prompt_Cache_Index` (
  `cache_hash` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cache_resource_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'gemini-3.8-flash',
  `token_count` int NOT NULL DEFAULT '0',
  `ttl_seconds` int NOT NULL DEFAULT '3600',
  `display_name` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `hit_count` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`cache_hash`),
  KEY `idx_cache_expires` (`expires_at`),
  KEY `idx_cache_model` (`model_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: Sys_Swarm_Node_Pool
CREATE TABLE `Sys_Swarm_Node_Pool` (
  `node_id` varchar(50) NOT NULL,
  `project_id` varchar(50) NOT NULL,
  `role_code` varchar(50) NOT NULL,
  `conversation_id` varchar(64) DEFAULT NULL,
  `current_model` varchar(50) NOT NULL,
  `operational_state` enum('ACTIVE','STANDBY','RECYCLED','TERMINATED') DEFAULT 'ACTIVE',
  `last_heartbeat_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`node_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: shared_team_tasks
CREATE TABLE `shared_team_tasks` (
  `task_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assigned_user` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assigned_worker` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PENDING','IN_PROGRESS','COMPLETED','FAILED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`task_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- SECTION 2: GOVERNANCE VIEWS (11 VIEWS: WBS ROLLUP, AUDIT, KPI, RUNTIME SSOT)
-- ----------------------------------------------------------------------------

-- View: vw_Executive_Decision_Matrix_Summary
CREATE ALGORITHM=UNDEFINED DEFINER=`hdd_user`@`%` SQL SECURITY DEFINER VIEW `vw_Executive_Decision_Matrix_Summary` AS select `Swarm_Executive_Decision_Matrix`.`group_code` AS `group_code`,max(`Swarm_Executive_Decision_Matrix`.`group_title`) AS `group_title`,count(0) AS `total_measures`,sum((case when (`Swarm_Executive_Decision_Matrix`.`is_approved` = 1) then 1 else 0 end)) AS `approved_measures`,sum((case when (`Swarm_Executive_Decision_Matrix`.`is_approved` = 0) then 1 else 0 end)) AS `rejected_measures`,sum((case when (`Swarm_Executive_Decision_Matrix`.`status_category` = 'DONE') then 1 else 0 end)) AS `done_or_running_count`,sum((case when (`Swarm_Executive_Decision_Matrix`.`status_category` = 'UNVERIFIED_RULE') then 1 else 0 end)) AS `unverified_rule_count`,sum((case when (`Swarm_Executive_Decision_Matrix`.`status_category` = 'GAP_OR_PARTIAL') then 1 else 0 end)) AS `remaining_gaps_count`,round(((sum((case when (`Swarm_Executive_Decision_Matrix`.`is_approved` = 1) then 1 else 0 end)) * 100.0) / count(0)),2) AS `approval_percentage`,group_concat(distinct cast(`Swarm_Executive_Decision_Matrix`.`engineering_principles` as char charset utf8mb4) order by `Swarm_Executive_Decision_Matrix`.`measure_id` ASC separator ' | ') AS `principles_summary`,max(`Swarm_Executive_Decision_Matrix`.`updated_at`) AS `last_approved_at` from `Swarm_Executive_Decision_Matrix` group by `Swarm_Executive_Decision_Matrix`.`group_code` order by `Swarm_Executive_Decision_Matrix`.`group_code`;

-- View: vw_Governance_Admin_Security_Live
CREATE ALGORITHM=UNDEFINED DEFINER=`debian-sys-maint`@`localhost` SQL SECURITY DEFINER VIEW `vw_Governance_Admin_Security_Live` AS select `Governance_Admin_Users`.`user_id` AS `user_id`,`Governance_Admin_Users`.`username` AS `username`,`Governance_Admin_Users`.`full_name` AS `full_name`,`Governance_Admin_Users`.`role_code` AS `role_code`,`Governance_Admin_Users`.`hash_algorithm` AS `hash_algorithm`,`Governance_Admin_Users`.`linked_employee_id` AS `linked_employee_id`,`Governance_Admin_Users`.`is_active` AS `is_active`,`Governance_Admin_Users`.`failed_login_attempts` AS `failed_login_attempts`,`Governance_Admin_Users`.`locked_until` AS `locked_until`,(case when (`Governance_Admin_Users`.`is_active` = 0) then 'DISABLED' when ((`Governance_Admin_Users`.`locked_until` is not null) and (`Governance_Admin_Users`.`locked_until` > now())) then 'TEMPORARILY_LOCKED' else 'ACTIVE_ALLOWED' end) AS `account_security_status`,`Governance_Admin_Users`.`last_login_at` AS `last_login_at`,`Governance_Admin_Users`.`last_login_ip` AS `last_login_ip` from `Governance_Admin_Users`;

-- View: vw_Governance_Safety_Framework_SSOT
CREATE ALGORITHM=UNDEFINED DEFINER=`hdd_user`@`%` SQL SECURITY DEFINER VIEW `vw_Governance_Safety_Framework_SSOT` AS select `Governance_Safety_Rules_16`.`rule_id` AS `ID`,`Governance_Safety_Rules_16`.`rule_group` AS `Group`,`Governance_Safety_Rules_16`.`measure_name` AS `Measure`,`Governance_Safety_Rules_16`.`prevents_risk` AS `RiskPrevented`,`Governance_Safety_Rules_16`.`core_principles` AS `Principles`,`Governance_Safety_Rules_16`.`status` AS `Status`,`Governance_Safety_Rules_16`.`evidence_or_missing` AS `PhysicalEvidence` from `Governance_Safety_Rules_16` order by `Governance_Safety_Rules_16`.`rule_id`;

-- View: vw_Project_Progress_Overview
CREATE ALGORITHM=UNDEFINED DEFINER=`hdd_user`@`%` SQL SECURITY DEFINER VIEW `vw_Project_Progress_Overview` AS select `mp`.`PlanID` AS `PlanID`,`mp`.`PlanName` AS `PlanName`,`mp`.`Status` AS `PlanStatus`,`mp`.`DeadlineAt` AS `PlanDeadline`,timestampdiff(HOUR,now(),`mp`.`DeadlineAt`) AS `HoursRemaining`,(case when ((`mp`.`DeadlineAt` is not null) and (now() > `mp`.`DeadlineAt`) and (`mp`.`Status` <> 'COMPLETED')) then 1 else 0 end) AS `IsPlanOverdue`,count(`t`.`TaskID`) AS `TotalTasks`,sum((case when (`t`.`Status` = 'COMPLETED') then 1 else 0 end)) AS `CompletedTasks`,sum((case when (`t`.`Status` = 'IN_PROGRESS') then 1 else 0 end)) AS `InProgressTasks`,sum((case when (`t`.`Status` = 'ASSIGNED') then 1 else 0 end)) AS `AssignedTasks`,sum((case when (`t`.`Status` = 'OPEN') then 1 else 0 end)) AS `OpenTasks`,sum((case when (`t`.`Status` = 'READY_FOR_AUDIT') then 1 else 0 end)) AS `ReadyForAuditTasks`,sum((case when (`t`.`AuditVerdict` = 'PASSED') then 1 else 0 end)) AS `AuditPassedTasks`,sum((case when (`t`.`IsOverdue` = 1) then 1 else 0 end)) AS `OverdueTasks`,round(((sum((case when (`t`.`Status` = 'COMPLETED') then 1 else 0 end)) * 100.0) / nullif(count(`t`.`TaskID`),0)),2) AS `CompletionPercentage`,now() AS `ReportGeneratedAt` from ((`Project_MasterPlans` `mp` left join `Project_SubPlans` `sp` on((`mp`.`PlanID` = `sp`.`PlanID`))) left join `Project_Tasks` `t` on((`sp`.`SubPlanID` = `t`.`SubPlanID`))) group by `mp`.`PlanID`,`mp`.`PlanName`,`mp`.`Status`,`mp`.`DeadlineAt`;

-- View: vw_Project_Realtime_BurnRate_Monitor
CREATE ALGORITHM=UNDEFINED DEFINER=`hdd_user`@`%` SQL SECURITY DEFINER VIEW `vw_Project_Realtime_BurnRate_Monitor` AS select now() AS `CurrentTime`,`t`.`TaskID` AS `TaskID`,`t`.`AssignedWorker` AS `AssignedWorker`,`t`.`Status` AS `Status`,`t`.`AuditVerdict` AS `AuditVerdict`,`t`.`DeadlineAt` AS `DeadlineAt`,`t`.`EstimatedHours` AS `EstimatedHours`,timestampdiff(HOUR,now(),`t`.`DeadlineAt`) AS `HoursRemaining`,timestampdiff(MINUTE,now(),`t`.`DeadlineAt`) AS `MinutesRemaining`,(case when ((`t`.`DeadlineAt` is not null) and (now() > `t`.`DeadlineAt`)) then '🔴 QUÁ HẠN (OVERDUE)' when (timestampdiff(HOUR,now(),`t`.`DeadlineAt`) <= `t`.`EstimatedHours`) then '🔴 RỦI RO CHẬM TRỄ CỰC CAO' when (timestampdiff(HOUR,now(),`t`.`DeadlineAt`) <= (`t`.`EstimatedHours` * 2)) then '🟡 CẦN TĂNG TỐC KHẨN CẤP' else '🟢 TIẾN ĐỘ AN TOÀN' end) AS `VelocityRisk`,`t`.`Title` AS `TaskTitle` from `Project_Tasks` `t` where (`t`.`Status` <> 'COMPLETED') order by `t`.`DeadlineAt`;

-- View: vw_Project_Recent_Audit_Logs
CREATE ALGORITHM=UNDEFINED DEFINER=`hdd_user`@`%` SQL SECURITY DEFINER VIEW `vw_Project_Recent_Audit_Logs` AS select `al`.`AuditLogID` AS `AuditLogID`,`al`.`TaskID` AS `TaskID`,`t`.`Title` AS `TaskTitle`,`al`.`AuditorRole` AS `AuditorRole`,`al`.`Verdict` AS `Verdict`,`al`.`Findings` AS `Findings`,`al`.`Recommendations` AS `Recommendations`,`al`.`CreatedAt` AS `AuditedAt` from (`Project_AuditLogs` `al` join `Project_Tasks` `t` on((`al`.`TaskID` = `t`.`TaskID`))) order by `al`.`CreatedAt` desc;

-- View: vw_Project_Runtime_MasterPlan_SSOT
CREATE ALGORITHM=UNDEFINED DEFINER=`hdd_user`@`%` SQL SECURITY DEFINER VIEW `vw_Project_Runtime_MasterPlan_SSOT` AS select `mp`.`PlanID` AS `PlanID`,`mp`.`PlanName` AS `PlanName`,`mp`.`Status` AS `PlanStatus`,`mp`.`DeadlineAt` AS `PlanDeadline`,`sp`.`SubPlanID` AS `SubPlanID`,`sp`.`SubPlanName` AS `SubPlanName`,`sp`.`Status` AS `SubPlanStatus`,`t`.`TaskID` AS `TaskID`,`t`.`Title` AS `TaskTitle`,`t`.`AssignedWorker` AS `AssignedWorker`,`t`.`Status` AS `TaskStatus`,`t`.`AuditVerdict` AS `AuditVerdict`,`t`.`DeadlineAt` AS `TaskDeadline`,timestampdiff(HOUR,now(),`t`.`DeadlineAt`) AS `HoursRemaining`,`t`.`EstimatedHours` AS `EstimatedHours`,`t`.`IsOverdue` AS `IsOverdue`,`t`.`ResultSummary` AS `ResultSummary`,`t`.`Deliverables` AS `Deliverables`,`t`.`UpdatedAt` AS `LastUpdated` from ((`Project_MasterPlans` `mp` join `Project_SubPlans` `sp` on((`mp`.`PlanID` = `sp`.`PlanID`))) join `Project_Tasks` `t` on((`sp`.`SubPlanID` = `t`.`SubPlanID`)));

-- View: vw_Project_WBS_Rollup_Hierarchy
CREATE ALGORITHM=UNDEFINED DEFINER=`hdd_user`@`%` SQL SECURITY DEFINER VIEW `vw_Project_WBS_Rollup_Hierarchy` AS select `p`.`project_id` AS `project_id`,`p`.`project_name` AS `project_name`,`p`.`git_repository_url` AS `git_repository_url`,`mp`.`PlanID` AS `master_plan_id`,`mp`.`PlanName` AS `master_plan_name`,`mp`.`Status` AS `master_plan_status`,`sp`.`SubPlanID` AS `sub_plan_id`,`sp`.`SubPlanName` AS `sub_plan_name`,`sp`.`Status` AS `sub_plan_status`,`sp`.`LeadArchitect` AS `sub_plan_lead`,`sp`.`DocumentationFile` AS `sub_plan_doc`,`t`.`TaskID` AS `task_id`,`t`.`Title` AS `task_title`,`t`.`AssignedWorker` AS `task_worker`,`t`.`Status` AS `task_status`,`t`.`AuditVerdict` AS `task_verdict`,`t`.`Deliverables` AS `task_deliverables`,`t`.`CreatedAt` AS `task_created_at`,`t`.`CompletedAt` AS `task_completed_at` from (((`Projects` `p` left join `Project_MasterPlans` `mp` on((`mp`.`project_id` = `p`.`project_id`))) left join `Project_SubPlans` `sp` on((`sp`.`PlanID` = `mp`.`PlanID`))) left join `Project_Tasks` `t` on((`t`.`SubPlanID` = `sp`.`SubPlanID`))) order by `p`.`project_id`,`mp`.`PlanID`,`sp`.`SubPlanID`,`t`.`TaskSeq`;

-- View: vw_Project_Worker_Performance
CREATE ALGORITHM=UNDEFINED DEFINER=`hdd_user`@`%` SQL SECURITY DEFINER VIEW `vw_Project_Worker_Performance` AS select `w`.`WorkerRole` AS `WorkerRole`,`w`.`DedicatedModule` AS `DedicatedModule`,`w`.`IsActive` AS `IsActive`,count(`t`.`TaskID`) AS `TotalAssignedTasks`,sum((case when (`t`.`Status` = 'COMPLETED') then 1 else 0 end)) AS `CompletedTasks`,sum((case when (`t`.`Status` = 'IN_PROGRESS') then 1 else 0 end)) AS `ActiveTasks`,sum((case when (`t`.`AuditVerdict` = 'PASSED') then 1 else 0 end)) AS `VerifiedTasks`,max(`t`.`CompletedAt`) AS `LastTaskCompletedAt` from (`Project_Workers` `w` left join `Project_Tasks` `t` on((`w`.`WorkerRole` = `t`.`AssignedWorker`))) group by `w`.`WorkerRole`,`w`.`DedicatedModule`,`w`.`IsActive`;

-- View: vw_Swarm_Worker_KPI_And_Token_Efficiency
CREATE ALGORITHM=UNDEFINED DEFINER=`hdd_user`@`%` SQL SECURITY DEFINER VIEW `vw_Swarm_Worker_KPI_And_Token_Efficiency` AS select `Swarm_Worker_KPI_Token_Telemetry`.`slot_id` AS `slot_id`,`Swarm_Worker_KPI_Token_Telemetry`.`display_name` AS `display_name`,`Swarm_Worker_KPI_Token_Telemetry`.`role_code` AS `role_code`,`Swarm_Worker_KPI_Token_Telemetry`.`conversation_id` AS `conversation_id`,`Swarm_Worker_KPI_Token_Telemetry`.`role_tier` AS `role_tier`,`Swarm_Worker_KPI_Token_Telemetry`.`current_model` AS `current_model`,`Swarm_Worker_KPI_Token_Telemetry`.`token_status` AS `token_status`,`Swarm_Worker_KPI_Token_Telemetry`.`operational_state` AS `operational_state`,`Swarm_Worker_KPI_Token_Telemetry`.`token_cost_tier` AS `token_cost_tier`,`Swarm_Worker_KPI_Token_Telemetry`.`estimated_tokens_consumed` AS `estimated_tokens_consumed`,`Swarm_Worker_KPI_Token_Telemetry`.`total_assigned_tasks` AS `total_assigned_tasks`,`Swarm_Worker_KPI_Token_Telemetry`.`completed_tasks` AS `completed_tasks`,`Swarm_Worker_KPI_Token_Telemetry`.`in_progress_tasks` AS `in_progress_tasks`,`Swarm_Worker_KPI_Token_Telemetry`.`rejected_or_rework_count` AS `rejected_or_rework_count`,`Swarm_Worker_KPI_Token_Telemetry`.`tokens_per_completed_task` AS `tokens_per_completed_task`,`Swarm_Worker_KPI_Token_Telemetry`.`first_time_pass_rate` AS `first_time_pass_rate`,`Swarm_Worker_KPI_Token_Telemetry`.`kpi_efficiency_score` AS `kpi_efficiency_score`,`Swarm_Worker_KPI_Token_Telemetry`.`honest_evaluation_verdict` AS `honest_evaluation_verdict`,`Swarm_Worker_KPI_Token_Telemetry`.`honest_audit_comment` AS `honest_audit_comment`,`Swarm_Worker_KPI_Token_Telemetry`.`updated_at` AS `updated_at` from `Swarm_Worker_KPI_Token_Telemetry` order by cast(replace(`Swarm_Worker_KPI_Token_Telemetry`.`slot_id`,'CONVERSATION_ID_','') as unsigned);

-- View: vw_Swarm_Worker_KPI_Leaderboard
CREATE ALGORITHM=UNDEFINED DEFINER=`hdd_user`@`%` SQL SECURITY DEFINER VIEW `vw_Swarm_Worker_KPI_Leaderboard` AS select `kpi`.`slot_id` AS `Slot`,`kpi`.`role_code` AS `RoleCode`,`kpi`.`display_name` AS `WorkerName`,`kpi`.`conversation_id` AS `UUID`,`kpi`.`kpi_efficiency_score` AS `KPIScore`,`kpi`.`kpi_tier` AS `KPITier`,`kpi`.`reward_or_penalty_status` AS `ActionStatus`,`kpi`.`completed_tasks` AS `CompletedTasks`,`kpi`.`rejected_or_rework_count` AS `ReworkCount`,`kpi`.`first_time_pass_rate` AS `FirstTimePassRate`,`kpi`.`on_time_completion_rate` AS `OnTimeRate`,`kpi`.`honest_evaluation_verdict` AS `AuditVerdict`,`kpi`.`updated_at` AS `LastAssessedAt` from `Swarm_Worker_KPI_Token_Telemetry` `kpi` order by `kpi`.`kpi_efficiency_score` desc,`kpi`.`first_time_pass_rate` desc;

SET FOREIGN_KEY_CHECKS = 1;

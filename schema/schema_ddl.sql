-- =================================================================================
-- HDD MASTER FRAMEWORK - 10 BẢNG MYSQL 3NF SSOT RUNTIME
-- ENGINE: MySQL 8.0+ / MariaDB 10.5+ | CHARSET: utf8mb4_unicode_ci
-- =================================================================================

CREATE DATABASE IF NOT EXISTS `hdd_swarm_governance` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `hdd_swarm_governance`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. BẢNG DỰ ÁN (PROJECTS)
DROP TABLE IF EXISTS `sys_projects`;
CREATE TABLE `sys_projects` (
    `project_id` VARCHAR(64) NOT NULL,
    `project_name` VARCHAR(255) NOT NULL,
    `git_repository_url` VARCHAR(512) DEFAULT NULL,
    `root_workspace_path` VARCHAR(512) NOT NULL,
    `status` ENUM('ACTIVE', 'ARCHIVED', 'PAUSED') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. BẢNG PHÂN QUYỀN USER (USER GRANTS)
DROP TABLE IF EXISTS `sys_project_user_grants`;
CREATE TABLE `sys_project_user_grants` (
    `grant_id` INT AUTO_INCREMENT PRIMARY KEY,
    `project_id` VARCHAR(64) NOT NULL,
    `system_username` VARCHAR(64) NOT NULL,
    `role_in_project` ENUM('CHIEF', 'LEADER', 'DEVELOPER', 'AUDITOR') NOT NULL DEFAULT 'DEVELOPER',
    `assigned_port` INT DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_user_project` FOREIGN KEY (`project_id`) REFERENCES `sys_projects` (`project_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. BẢNG SWARM NODE POOL
DROP TABLE IF EXISTS `sys_swarm_node_pool`;
CREATE TABLE `sys_swarm_node_pool` (
    `node_uuid` VARCHAR(64) NOT NULL,
    `project_id` VARCHAR(64) NOT NULL,
    `abstract_role` VARCHAR(100) NOT NULL,
    `conversation_uuid` VARCHAR(128) DEFAULT NULL,
    `operational_state` ENUM('ACTIVE', 'STANDBY', 'SUSPENDED') NOT NULL DEFAULT 'STANDBY',
    `last_heartbeat` DATETIME DEFAULT NULL,
    PRIMARY KEY (`node_uuid`, `project_id`),
    CONSTRAINT `fk_node_project` FOREIGN KEY (`project_id`) REFERENCES `sys_projects` (`project_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. BẢNG KẾ HOẠCH MASTER PLANS
DROP TABLE IF EXISTS `sys_project_masterplans`;
CREATE TABLE `sys_project_masterplans` (
    `plan_id` VARCHAR(64) NOT NULL,
    `project_id` VARCHAR(64) NOT NULL,
    `plan_name` VARCHAR(255) NOT NULL,
    `status` ENUM('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`plan_id`, `project_id`),
    CONSTRAINT `fk_plan_project` FOREIGN KEY (`project_id`) REFERENCES `sys_projects` (`project_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. BẢNG TÁC VỤ (TASKS)
DROP TABLE IF EXISTS `sys_project_tasks`;
CREATE TABLE `sys_project_tasks` (
    `task_id` VARCHAR(64) NOT NULL,
    `project_id` VARCHAR(64) NOT NULL,
    `plan_id` VARCHAR(64) DEFAULT NULL,
    `task_code` VARCHAR(64) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `assigned_node_uuid` VARCHAR(64) DEFAULT NULL,
    `status` ENUM('TODO', 'ASSIGNED', 'IN_PROGRESS', 'REVIEW', 'DONE', 'FAILED') NOT NULL DEFAULT 'TODO',
    `audit_verdict` ENUM('NONE', 'PASSED', 'FAILED', 'WARNING') NOT NULL DEFAULT 'NONE',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`task_id`),
    CONSTRAINT `fk_task_project` FOREIGN KEY (`project_id`) REFERENCES `sys_projects` (`project_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. BẢNG KẾT QUẢ BÀN GIAO (DELIVERABLES)
DROP TABLE IF EXISTS `sys_task_deliverables`;
CREATE TABLE `sys_task_deliverables` (
    `deliverable_id` VARCHAR(64) PRIMARY KEY,
    `task_id` VARCHAR(64) NOT NULL,
    `git_commit_hash` VARCHAR(64) NOT NULL,
    `exit_code` INT NOT NULL DEFAULT 0,
    `proof_path` VARCHAR(512) NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_deliv_task` FOREIGN KEY (`task_id`) REFERENCES `sys_project_tasks` (`task_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. BẢNG AUDIT CHECKPOINTS
DROP TABLE IF EXISTS `sys_audit_checkpoints`;
CREATE TABLE `sys_audit_checkpoints` (
    `checkpoint_id` VARCHAR(64) PRIMARY KEY,
    `task_id` VARCHAR(64) NOT NULL,
    `auditor_uuid` VARCHAR(64) NOT NULL,
    `verdict` ENUM('PASSED', 'REJECTED') NOT NULL,
    `evidence_hash` VARCHAR(64) NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_chk_task` FOREIGN KEY (`task_id`) REFERENCES `sys_project_tasks` (`task_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. BẢNG AUDIT LOGS
DROP TABLE IF EXISTS `sys_audit_logs`;
CREATE TABLE `sys_audit_logs` (
    `log_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `project_id` VARCHAR(64) NOT NULL,
    `action_type` VARCHAR(64) NOT NULL,
    `actor_uuid` VARCHAR(64) NOT NULL,
    `details` JSON DEFAULT NULL,
    `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. BẢNG FEDERATED INBOX
DROP TABLE IF EXISTS `sys_federated_inbox`;
CREATE TABLE `sys_federated_inbox` (
    `message_id` VARCHAR(64) PRIMARY KEY,
    `source_project` VARCHAR(64) NOT NULL,
    `target_project` VARCHAR(64) NOT NULL,
    `payload` JSON NOT NULL,
    `status` ENUM('PENDING', 'PROCESSED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `received_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. BẢNG SYSTEM INVARIANTS
DROP TABLE IF EXISTS `sys_system_invariants`;
CREATE TABLE `sys_system_invariants` (
    `invariant_key` VARCHAR(128) PRIMARY KEY,
    `enforced_value` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

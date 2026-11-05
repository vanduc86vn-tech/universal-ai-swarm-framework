-- =================================================================================
-- TRIGGERS CHỐNG GIAN LẬN & KHÓA KỶ LUẬT SSOT
-- =================================================================================
USE `hdd_swarm_governance`;

DELIMITER $$

-- Trigger 1: Chặn nhảy cóc trạng thái từ TODO lên DONE trực tiếp
DROP TRIGGER IF EXISTS `trg_verify_task_completion`$$
CREATE TRIGGER `trg_verify_task_completion`
BEFORE UPDATE ON `sys_project_tasks`
FOR EACH ROW
BEGIN
    IF NEW.status = 'DONE' AND OLD.status = 'TODO' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '[FRAUD_PREVENTION] Cấm nhảy cóc trạng thái: Task phải qua IN_PROGRESS và REVIEW trước khi hoàn thành!';
    END IF;
END$$

-- Trigger 2: Chặn ký passed nếu chưa có audit deliverable
DROP TRIGGER IF EXISTS `trg_prevent_fake_audit_pass`$$
CREATE TRIGGER `trg_prevent_fake_audit_pass`
BEFORE UPDATE ON `sys_project_tasks`
FOR EACH ROW
BEGIN
    IF NEW.audit_verdict = 'PASSED' AND NEW.status != 'REVIEW' AND NEW.status != 'DONE' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '[AUDIT_FRAUD] Cấm ký khống: Chỉ được ký PASSED khi Task đang ở trạng thái REVIEW!';
    END IF;
END$$

DELIMITER ;

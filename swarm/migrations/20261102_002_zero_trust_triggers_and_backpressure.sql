-- ============================================================================
-- MIGRATION: 20261102_002_zero_trust_triggers_and_backpressure.sql
-- DESCRIPTION: Ràng buộc CSDL vật lý chống gian lận nghiệm thu & ngắt mạch quá tải
-- TÁC GIẢ: SUPER MASTER LEADER (V6.2 Zero-Trust Architecture)
-- ============================================================================

DELIMITER $$

-- 1. TRIGGER: CHỐNG HOÀN THÀNH LÁO & BẢO ĐẢM XÁC THỰC ĐÔI (DUAL-SIGNATURE GATE)
DROP TRIGGER IF EXISTS trg_verify_task_completion$$
CREATE TRIGGER trg_verify_task_completion
BEFORE UPDATE ON Project_Tasks
FOR EACH ROW
BEGIN
  -- Cấm nhảy cóc từ IN_PROGRESS lên thẳng COMPLETED (Worker không được tự đóng task)
  IF NEW.Status = 'COMPLETED' AND OLD.Status = 'IN_PROGRESS' THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = '[DB_ERROR] Vi phạm SDLC: Task bắt buộc phải chuyển sang READY_FOR_AUDIT để Kiểm toán viên độc lập thẩm định trước khi COMPLETED!';
  END IF;

  -- Cấm đóng task sang COMPLETED nếu thiếu bằng chứng nhị phân và chữ ký kiểm toán
  IF NEW.Status = 'COMPLETED' AND (
      NEW.ProofUrl IS NULL OR TRIM(NEW.ProofUrl) = '' OR 
      NEW.ProofHash IS NULL OR TRIM(NEW.ProofHash) = '' OR 
      NEW.AuditedBy IS NULL OR TRIM(NEW.AuditedBy) = ''
  ) THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = '[DB_ERROR] Gian lận nghiệm thu: Thiếu ProofUrl, ProofHash hoặc Chữ ký Kiểm toán viên (AuditedBy)!';
  END IF;
END$$

-- 2. TRIGGER: CƠ CHẾ TỰ ĐỘNG NGẮT MẠCH KHI QUÁ TẢI (DYNAMIC BACKPRESSURE GATE)
DROP TRIGGER IF EXISTS trg_enforce_dynamic_backpressure$$
CREATE TRIGGER trg_enforce_dynamic_backpressure
BEFORE UPDATE ON Project_Tasks
FOR EACH ROW
BEGIN
  DECLARE active_count INT DEFAULT 0;

  -- Chỉ kiểm tra khi PM cố tình gán thêm Task mới cho Worker (Chuyển sang ASSIGNED)
  IF NEW.Status = 'ASSIGNED' AND OLD.Status <> 'ASSIGNED' AND NEW.AssignedWorker IS NOT NULL THEN
    SELECT COUNT(*) INTO active_count 
    FROM Project_Tasks 
    WHERE AssignedWorker = NEW.AssignedWorker 
      AND Status = 'IN_PROGRESS';

    -- Ngưỡng an toàn tối đa: 5 tasks đang IN_PROGRESS cùng lúc
    IF active_count >= 5 THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = '[CIRCUIT_BREAKER_ACTIVE] Worker đang bị nghẽn (>= 5 task IN_PROGRESS). Cấm gán thêm việc mới! Hãy tháo gỡ điểm nghẽn trước!';
    END IF;
  END IF;
END$$

DELIMITER ;

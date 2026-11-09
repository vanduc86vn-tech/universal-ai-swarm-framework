-- ============================================================================
-- UNIVERSAL AI SWARM FRAMEWORK - STORED PROCEDURE
-- File: src/database/procedures/sp_claim_task.sql
-- ============================================================================
-- Cơ chế #6: Nhận Task An Toàn Bằng Row-Level Locking (FOR UPDATE)
-- Đảm bảo 1 Task = Chính xác 1 Node nhận, triệt tiêu 100% tranh chấp Race Condition.
-- ============================================================================

DELIMITER //

DROP PROCEDURE IF EXISTS sp_claim_task //

CREATE PROCEDURE sp_claim_task(
  IN  p_task_id             VARCHAR(64),
  IN  p_worker_id           VARCHAR(32),
  IN  p_conversation_uuid   VARCHAR(64),
  OUT p_result              VARCHAR(20),
  OUT p_message             VARCHAR(255)
)
BEGIN
  DECLARE v_status VARCHAR(20);
  DECLARE v_worker VARCHAR(32);

  -- Bắt đầu giao dịch cô lập cao
  START TRANSACTION;

  -- 1. KHÓA DÒNG NGAY LẬP TỨC — Giao dịch thứ 2 đến sau bắt buộc phải chờ
  SELECT status, assigned_worker INTO v_status, v_worker
  FROM Project_Tasks 
  WHERE task_id = p_task_id
  FOR UPDATE;

  -- 2. Kiểm tra điều kiện phân bổ
  IF v_status IS NULL THEN
    SET p_result = 'NOT_FOUND';
    SET p_message = CONCAT('Task [', p_task_id, '] không tồn tại trong CSDL SSOT');
  ELSEIF v_status NOT IN ('OPEN', 'PENDING', 'ASSIGNED') THEN
    SET p_result = 'ALREADY_CLAIMED';
    SET p_message = CONCAT('Task đã được nhận bởi: ', IFNULL(v_worker, 'khác'), ' (Trạng thái: ', v_status, ')');
  ELSE
    -- 3. CHỈ DUY NHẤT 1 GIAO DỊCH ĐƯỢC PHÉP THÀNH CÔNG
    UPDATE Project_Tasks
    SET status = 'IN_PROGRESS',
        assigned_worker = p_worker_id,
        conversation_uuid = IFNULL(p_conversation_uuid, UUID()),
        started_at = NOW(),
        updated_at = NOW()
    WHERE task_id = p_task_id;

    SET p_result = 'SUCCESS';
    SET p_message = CONCAT('Nhận task [', p_task_id, '] thành công cho Worker [', p_worker_id, ']');
  END IF;

  COMMIT;
END //

DELIMITER ;

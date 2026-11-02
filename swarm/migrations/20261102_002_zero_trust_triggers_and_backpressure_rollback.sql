-- ============================================================================
-- ROLLBACK: 20261102_002_zero_trust_triggers_and_backpressure_rollback.sql
-- DESCRIPTION: Hạ cấp gỡ bỏ 2 triggers kiểm soát Zero-Trust
-- ============================================================================

DROP TRIGGER IF EXISTS trg_verify_task_completion;
DROP TRIGGER IF EXISTS trg_enforce_dynamic_backpressure;

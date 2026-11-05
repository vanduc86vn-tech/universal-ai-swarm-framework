"""
===============================================================================
IMMUTABLE TEST ORACLE - ĐỀ THI ĐÓNG BĂNG KIỂM CHỨNG BẤT BIẾN OOP (V3.0)
Tệp này bị khóa cứng tại PreToolUse Hook (chống sửa đề thi).
Mọi thay đổi để qua test phải được thực hiện trong src/hdd_core/.
===============================================================================
"""
import pytest
from src.hdd_core.base_entity import BaseEntity
from src.hdd_core.abstract_plan import AbstractPlan
from src.hdd_core.entities import SwarmProject, SwarmNode, ProjectTask, AuditCheckpoint

def test_base_entity_invariants():
    """Kiểm tra điều kiện bất biến khi khởi tạo BaseEntity."""
    with pytest.raises(ValueError):
        BaseEntity("", "Valid Name")
    with pytest.raises(ValueError):
        BaseEntity("ID-001", "")
    
    entity = BaseEntity("ID-001", "Entity 1")
    assert entity.entity_id == "ID-001"
    assert entity.name == "Entity 1"
    assert entity.is_active is True

def test_task_fsm_anti_skip_invariants():
    """
    Kiểm tra cơ chế chống nhảy cóc trạng thái:
    Task TUYỆT ĐỐI KHÔNG ĐƯỢC nhảy thẳng từ TODO sang DONE.
    """
    task = ProjectTask("TASK-001", "Triển khai API", "PLAN-01", "AI-BACKEND")
    assert task.status == "TODO"

    # Nhảy cóc trực tiếp -> Phải ném ngoại lệ FSM_VIOLATION
    with pytest.raises(ValueError, match="FSM_VIOLATION"):
        task.transition_to("DONE")

    # Quy trình hợp lệ
    task.transition_to("IN_PROGRESS")
    assert task.status == "IN_PROGRESS"
    
    task.submit_for_audit()
    assert task.status == "REVIEW"

def test_audit_fraud_prevention():
    """
    Kiểm tra chống ký khống kiểm toán:
    Cấm ký duyệt khi không có bằng chứng bằng hash (evidence_hash).
    """
    task = ProjectTask("TASK-002", "Dọn dẹp Portal", "PLAN-01", "AI-DEVOPS")
    task.transition_to("IN_PROGRESS")
    task.submit_for_audit()

    # Ký khống không có hash -> Phải văng lỗi
    with pytest.raises(ValueError, match="FRAUD_PREVENTION"):
        task.approve_audit("")

    with pytest.raises(ValueError, match="FRAUD_PREVENTION"):
        task.approve_audit("123")  # hash quá ngắn

    # Ký chuẩn mực có bằng chứng
    task.approve_audit("commit_dbe2f34_exit0")
    assert task.status == "DONE"
    assert task.audit_verdict == "PASSED"

def test_node_binding_invariants():
    """Kiểm tra ràng buộc khóa cứng UUID cho SwarmNode."""
    node = SwarmNode("NODE_01", "LEAD_ARCHITECT", "PRJ-01")
    with pytest.raises(ValueError):
        node.bind_conversation("short")
    
    node.bind_conversation("c_dde03bd0904f4a11")
    assert node._conversation_uuid == "c_dde03bd0904f4a11"

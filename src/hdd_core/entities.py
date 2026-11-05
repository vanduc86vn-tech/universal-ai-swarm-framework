"""
Domain Entities kế thừa BaseEntity.
"""
from typing import Optional, Dict, Any
from .base_entity import BaseEntity
from .abstract_plan import AbstractPlan

class SwarmProject(BaseEntity):
    def __init__(self, project_id: str, project_name: str, workspace_path: str):
        super().__init__(entity_id=project_id, name=project_name)
        if not workspace_path:
            raise ValueError("[INVARIANT_VIOLATION] workspace_path cannot be empty.")
        self._workspace_path = workspace_path

    @property
    def workspace_path(self) -> str:
        return self._workspace_path


class SwarmNode(BaseEntity):
    def __init__(self, node_uuid: str, role: str, project_id: str):
        super().__init__(entity_id=node_uuid, name=role)
        self._role = role
        self._project_id = project_id
        self._conversation_uuid: Optional[str] = None

    @property
    def role(self) -> str:
        return self._role

    def bind_conversation(self, uuid: str) -> None:
        if not uuid or len(uuid) < 8:
            raise ValueError("[INVARIANT_VIOLATION] Invalid conversation UUID.")
        self._conversation_uuid = uuid


class ProjectTask(BaseEntity):
    FSM_TRANSITIONS = {
        "TODO": ["ASSIGNED", "IN_PROGRESS"],
        "ASSIGNED": ["IN_PROGRESS", "TODO"],
        "IN_PROGRESS": ["REVIEW", "FAILED"],
        "REVIEW": ["DONE", "IN_PROGRESS"],
        "DONE": [],
        "FAILED": ["TODO"]
    }

    def __init__(self, task_id: str, title: str, plan_id: str, assigned_worker: str):
        super().__init__(entity_id=task_id, name=title)
        self._plan_id = plan_id
        self._assigned_worker = assigned_worker
        self._status = "TODO"
        self._audit_verdict = "NONE"

    @property
    def status(self) -> str:
        return self._status

    @property
    def audit_verdict(self) -> str:
        return self._audit_verdict

    def transition_to(self, new_status: str) -> None:
        allowed = self.FSM_TRANSITIONS.get(self._status, [])
        if new_status not in allowed:
            raise ValueError(
                f"[FSM_VIOLATION] Invalid state transition from {self._status} -> {new_status}. "
                f"Allowed transitions: {allowed}"
            )
        self._status = new_status

    def submit_for_audit(self) -> None:
        self.transition_to("REVIEW")

    def approve_audit(self, evidence_hash: str) -> None:
        if not evidence_hash or len(evidence_hash) < 8:
            raise ValueError("[FRAUD_PREVENTION] Evidence hash required to approve audit.")
        if self._status != "REVIEW":
            raise ValueError("[FRAUD_PREVENTION] Task must be in REVIEW state to approve.")
        self._audit_verdict = "PASSED"
        self.transition_to("DONE")


class AuditCheckpoint(BaseEntity):
    def __init__(self, checkpoint_id: str, task_id: str, auditor_uuid: str, evidence_hash: str):
        super().__init__(entity_id=checkpoint_id, name=f"Audit for {task_id}")
        if not evidence_hash or len(evidence_hash) < 8:
            raise ValueError("[INVARIANT_VIOLATION] Valid evidence hash is required for Audit Checkpoint.")
        self._task_id = task_id
        self._auditor_uuid = auditor_uuid
        self._evidence_hash = evidence_hash

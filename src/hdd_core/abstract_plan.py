"""
AbstractPlan - Khuôn mẫu cho kế hoạch thực thi FSM.
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Any
from .base_entity import BaseEntity

class AbstractPlan(BaseEntity, ABC):
    VALID_STATUSES = ["DRAFT", "ACTIVE", "COMPLETED", "ARCHIVED"]

    def __init__(self, plan_id: str, plan_name: str, project_id: str):
        super().__init__(entity_id=plan_id, name=plan_name)
        if not project_id:
            raise ValueError("[INVARIANT_VIOLATION] project_id is required.")
        self._project_id = project_id
        self._status = "DRAFT"
        self._tasks: List[str] = []

    @property
    def status(self) -> str:
        return self._status

    @property
    def tasks(self) -> List[str]:
        return list(self._tasks)

    def activate(self) -> None:
        if self._status != "DRAFT":
            raise ValueError(f"[INVALID_TRANSITION] Cannot activate plan from state: {self._status}")
        self._status = "ACTIVE"

    def complete(self) -> None:
        if self._status != "ACTIVE":
            raise ValueError(f"[INVALID_TRANSITION] Cannot complete plan unless it is ACTIVE.")
        self._status = "COMPLETED"

    @abstractmethod
    def validate_invariants(self) -> bool:
        """Kiểm tra điều kiện bất biến của kế hoạch."""
        pass

"""
BaseEntity - Lớp cơ sở cho toàn bộ đối tượng nghiệp vụ trong HDD Framework.
Đảm bảo tính bao đóng, định danh bất biến, và tự kiểm tra invariants.
"""
from datetime import datetime
from typing import Optional, Dict, Any

class BaseEntity:
    def __init__(self, entity_id: str, name: str):
        if not entity_id or not isinstance(entity_id, str):
            raise ValueError("[INVARIANT_VIOLATION] entity_id must be a non-empty string.")
        if not name or not isinstance(name, str):
            raise ValueError("[INVARIANT_VIOLATION] name must be a non-empty string.")
        
        self._entity_id = entity_id.strip()
        self._name = name.strip()
        self._created_at = datetime.utcnow()
        self._updated_at = datetime.utcnow()
        self._is_active = True

    @property
    def entity_id(self) -> str:
        return self._entity_id

    @property
    def name(self) -> str:
        return self._name

    @property
    def created_at(self) -> datetime:
        return self._created_at

    @property
    def is_active(self) -> bool:
        return self._is_active

    def deactivate(self) -> None:
        self._is_active = False
        self._updated_at = datetime.utcnow()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "entity_id": self._entity_id,
            "name": self._name,
            "created_at": self._created_at.isoformat(),
            "is_active": self._is_active
        }

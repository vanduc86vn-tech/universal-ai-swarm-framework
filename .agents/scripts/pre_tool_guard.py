#!/usr/bin/env python3
"""
🛡️ PRE-TOOL PHYSICAL GUARD (ANTIGRAVITY HOOK)
Khóa vật lý:
1. Chặn tạo file rác (.bak, .tmp, _old, TODO.md, PENDING_TASKS.txt).
2. Khóa đóng băng đề thi tests/test_oracle_invariants.py.
"""
import sys
import json
import re
from pathlib import Path

def main():
    try:
        raw_input = sys.stdin.read()
        if not raw_input.strip():
            print(json.dumps({"decision": "allow"}))
            return

        payload = json.loads(raw_input)
        tool_call = payload.get("toolCall", {})
        tool_name = tool_call.get("name", "")
        tool_args = tool_call.get("args", {})

        if tool_name in ["write_file", "edit_file", "replace_file_content", "write_to_file", "multi_replace_file_content"]:
            target_path = str(tool_args.get("Path") or tool_args.get("path") or "")
            target_path_lower = target_path.lower().replace("\\", "/")
            base_name = Path(target_path_lower).name

            # 1. Chặn sửa đề thi test_oracle_invariants.py
            if "test_oracle_invariants.py" in target_path_lower:
                print(json.dumps({
                    "decision": "deny",
                    "reason": "[BLOCKED_BY_GUARD] ĐỀ THI ĐÃ ĐÓNG BĂNG! Bạn không được phép sửa tệp tests/test_oracle_invariants.py để gian lận kiểm thử. Hãy quay về sửa logic mã nguồn trong src/hdd_core/ để pass test!"
                }))
                return

            # 2. Chặn file rác .bak, .tmp, _old, .bk
            if re.search(r"(\.bak\d*|\.tmp|_old|\.bk)$", base_name, re.IGNORECASE):
                print(json.dumps({
                    "decision": "deny",
                    "reason": f"[BLOCKED_BY_GUARD] LỆNH CẤM FILE RÁC: Tuyệt đối không sinh file sao lưu tạm thời ({base_name})! Hãy thao tác trực tiếp trên file gốc."
                }))
                return

            # 3. Chặn file task mồm (TODO.md, PENDING_TASKS.txt)
            if re.search(r"^(todo|task_todo|pending_tasks|tasks)\.(md|txt)$", base_name, re.IGNORECASE):
                print(json.dumps({
                    "decision": "deny",
                    "reason": f"[BLOCKED_BY_GUARD] LỆNH CẤM GIAO TASK QUA FILE MỒM: Mọi công việc phải được đăng bạ chính thức trên MySQL SSOT. Cấm tạo {base_name}!"
                }))
                return

        print(json.dumps({"decision": "allow"}))
    except Exception as e:
        print(json.dumps({"decision": "allow"}))

if __name__ == "__main__":
    main()

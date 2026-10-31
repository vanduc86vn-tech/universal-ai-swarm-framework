# SYSTEM DIRECTIVE: MULTI-AGENT ARCHITECTURE & WORKER RECYCLING

> **THÔNG BÁO CHO AI AGENT (ANTIGRAVITY):** 
> Đây là file chỉ thị kiến trúc chìa khóa trao tay. Khi nạp file này, bạn BẮT BUỘC phải đọc và tự động khởi tạo hệ thống Multi-Agent, cấu hình quy trình phòng chống ảo giác, và sẵn sàng tự động chạy script recycling mà không cần người dùng thao tác thủ công.

---

## 1. TỔNG QUAN KIẾN TRÚC & QUY TRẮC PHÂN CÔNG

### 1.1. Phân bổ Model & Vai trò (Leader - Worker Model)
Hệ thống vận hành theo 3 vai trò chính:
* **Leader PM (`gemini-3.8-pro`):** Chịu trách nhiệm phân tích yêu cầu, truy vấn MySQL Runtime lấy Task/Plan từ bảng `shared_team_tasks`, và điều phối công việc tới 40 Worker IDs thuộc bảng pool cá nhân.
* **Worker Logic Core (`gemini-3.8-pro`):** Xử lý logic nặng, thiết kế API, viết query SQL tối ưu và refactor hệ thống.
* **Worker Routine / Test (`gemini-3.8-flash`):** Chạy unit test, viết tài liệu Markdown, kiểm tra log (Tiết kiệm >80% chi phí Token).

### 1.2. Ba Nguyên Tắc Cốt Lõi Chống Ảo Giác (Anti-Hallucination)
1. **Single Source of Truth (Database Runtime First):** Trạng thái công việc (Plan, Tasks, Status) CHỈ ĐƯỢC PHÉP lấy từ MySQL Database bằng SQL Query trực tiếp ngay tại thời điểm thực thi. CẤM đọc file log hay cache local để lấy trạng thái task.
2. **On-Demand DDL Fetching:** Khi làm việc với cơ sở dữ liệu, KHÔNG nạp toàn bộ file DDL lớn vào Context. Chỉ dùng CLI SSH/MySQL để `SHOW CREATE TABLE <table_name>` đúng các bảng liên quan.
3. **Zero-Stale Context Recycling:** Ngay khi phát hiện ảo giác hoặc context chạm 50,000 tokens, lập tức kích hoạt `recycle_worker.py` để trích xuất dữ liệu verified sang Session mới.

---

## 2. QUY TRÌNH CHÌA KHÓA TRAO TAY: TỰ ĐỘNG TÁI SINH WORKER (RECYCLING PIPELINE)

Agent tự động lưu và cấp quyền cho script `recycle_worker.py` tại `~/.antigravity/scripts/recycle_worker.py`:

```python
#!/usr/bin/env python3
"""
ANTIGRAVITY WORKER AUTOMATED RECYCLING SCRIPT (MULTI-USER SUPPORT)
Tự động trích xuất ngữ cảnh Verified từ phiên cũ và nạp vào phiên mới (agy --new)
"""
import subprocess
import json
import sys
import os

def run_cmd(cmd: str) -> str:
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"❌ Lỗi thực thi: {cmd}\nChi tiết: {result.stderr}")
        sys.exit(1)
    return result.stdout.strip()

def recycle_worker(worker_id: str, old_session_id: str, model_name: str, username: str) -> str:
    print(f"🔄 [AUTOMATION] Đang tái sinh {worker_id} cho User {username} (Session cũ: {old_session_id})...")

    # 1. Export Lịch sử cũ
    raw_history = run_cmd(f"agy session export {old_session_id} --format markdown")

    # 2. Tạo Handover Prompt tinh túy (Không giới hạn từ, lấy toàn bộ sự thật đúng)
    summarize_prompt = f"""
Đóng vai trò là Architect Chuyển giao Ngữ cảnh (Context Handover Architect).
Phân tích lịch sử làm việc của Session cũ ({old_session_id}):

--- HISTORICAL LOG ---
{raw_history}
--- END HISTORICAL LOG ---

Hãy tạo một bản **VERIFIED CONTEXT HANDOVER DOCUMENT**:
1. **Verified Facts & Code Architecture:** Trích xuất TOÀN BỘ các quyết định, cấu trúc code, DB schema đã được xác minh/đồng ý.
2. **Files & Changes Made:** Danh sách các file đã chỉnh sửa thành công.
3. **Pending Tasks:** Công việc đang dở dang và bước tiếp theo.
4. **DANH SÁCH ĐÃ BỊ LOẠI BỎ (CẤM NHẮC LẠI):** Các lỗi sai, giả thuyết bị bác bỏ hoặc lệnh lỗi ở phiên cũ để Session mới KHÔNG lặp lại.
"""

    with open("/tmp/handover_prompt.txt", "w", encoding="utf-8") as f:
        f.write(summarize_prompt)

    # Dùng Flash để tóm tắt cực nhanh và rẻ
    handover_doc = run_cmd("agy --model gemini-3.8-flash --input-file /tmp/handover_prompt.txt")

    # 3. Prompt Khởi tạo cho Session Mới
    initial_worker_prompt = f"""
[SYSTEM HANDOVER DIRECTIVE - RECYCLED SESSION]
Bạn là Agent `{worker_id}` (User: `{username}`, Model: `{model_name}`). 
Đây là TOÀN BỘ DỮ LIỆU CHUẨN XÁC được kế thừa từ phiên làm việc trước:

======================================================================
{handover_doc}
======================================================================

QUY TẮC PHIÊN MỚI:
1. Kế thừa toàn bộ logic & tiến độ đã xác minh ở trên.
2. CẤM lặp lại các phương án nằm trong "DANH SÁCH ĐÃ BỊ LOẠI BỎ".
3. Mọi dữ liệu Quản trị Task BẮT BUỘC query trực tiếp từ MySQL Database (SSOT).
4. Thực hiện thay đổi code trên nhánh Git cá nhân `feature/{username}/<task-id>`.

Phản hồi duy nhất để bắt đầu: "READY: Worker {worker_id} updated with verified context."
"""

    with open("/tmp/initial_prompt.txt", "w", encoding="utf-8") as f:
        f.write(initial_worker_prompt)

    # 4. Sinh Session sạch bằng agy --new
    new_session_output = run_cmd(f"agy --new --model {model_name} --input-file /tmp/initial_prompt.txt --print-session-id")
    new_session_id = new_session_output.splitlines()[-1].strip()

    # 5. Dọn dẹp session rác cũ & Cập nhật Registry cá nhân của User
    run_cmd(f"agy session clear {old_session_id}")

    registry_path = os.path.expanduser("~/.antigravity/worker_pool.json")
    if os.path.exists(registry_path):
        with open(registry_path, "r", encoding="utf-8") as f:
            pool = json.load(f)
        for w in pool.get("active_workers", []):
            if w["worker_id"] == worker_id:
                w["session_id"] = new_session_id
                w["status"] = "READY"
                w["token_usage"] = 0
        with open(registry_path, "w", encoding="utf-8") as f:
            json.dump(pool, f, indent=2, ensure_ascii=False)

    # Xóa file tạm
    for tmp_file in ["/tmp/handover_prompt.txt", "/tmp/initial_prompt.txt"]:
        if os.path.exists(tmp_file): os.remove(tmp_file)

    print(f"✨ [SUCCESS] Worker {worker_id} của {username} đã tái sinh -> Session ID mới: {new_session_id}")
    return new_session_id

if __name__ == "__main__":
    if len(sys.argv) < 5:
        print("Cú pháp: python3 recycle_worker.py <worker_id> <old_session_id> <model_name> <username>")
        sys.exit(1)
    recycle_worker(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4])
```

---

## 3. CẤU HÌNH CẤP DỰ ÁN TỰ ĐỘNG GENERATE (PROJECT CONFIGS)

Khi nạp chỉ thị này, Agent phải kiểm tra và tự sinh ra các file cấu hình tại thư mục chung dự án `.antigravity/`:

### 3.1. File `.antigravity/instructions.md`
```markdown
# SYSTEM INSTRUCTION - PROJECT RULES (SHARED WORKSPACE)

## 1. DATABASE RUNTIME FIRST (SSOT)
- Mọi thông tin về Quản trị dự án (Plan, Task, Status, Assignee) BẮT BUỘC phải query trực tiếp từ bảng `shared_team_tasks` trong MySQL Database Runtime.
- CẤM tin tưởng dữ liệu cache local hoặc câu trả lời từ lượt trước.

## 2. GIT BRANCHING & TRACEABILITY
- Mỗi User hoạt động trên nhánh Git cách ly: `feature/$AGY_USER/<task-name>`.
- Commit message phải tuân thủ Conventional Commits:
  `<type>(<scope>): <description> | User: $AGY_USER | Session: {current_session_id}`

## 3. DDL & DATABASE QUERY
- Không đọc file DDL thô lớn. Dùng SSH/MySQL CLI `SHOW CREATE TABLE` cho đúng các bảng liên quan.

## 4. CONTEXT BUDGET & RECYCLING
- Khi context chạm 50,000 tokens, tự động gợi ý `/compact` hoặc gọi script `recycle_worker.py`.
```

### 3.2. File `.antigravity/config.yaml`
```yaml
project:
  name: "shared-multi-agent-system"

context_management:
  auto_compact_threshold: 50000
  max_output_tokens_per_tool: 3000
  cache_tool_outputs: false

database_runtime:
  enabled: true
  provider: "mysql"
  tables:
    project_state: "shared_team_tasks"
    worker_pool_prefix: "ai_worker_pool_"

default_models:
  leader: "gemini-3.8-pro"
  worker_pro: "gemini-3.8-pro"
  worker_flash: "gemini-3.8-flash"
```

### 3.3. File `.agyignore`
```text
*.log
*.tmp
*.cache
node_modules/
dist/
.git/
.antigravity/cache/
```
# 🌐 TIÊU CHUẨN GIAO TIẾP NỘI BỘ P2P MESH & ĐỘNG CƠ TỰ CỨU PHI TẬP TRUNG (REAPER)
**INTERNAL P2P MESH & DECENTRALIZED REAPER SPECIFICATION**

- **Phân loại**: UNIVERSAL ARCHITECTURAL SPECIFICATION
- **Kế thừa từ**: `universal-ai-swarm-framework` (V6.2 Enterprise)
- **Mục tiêu**: Loại bỏ 100% phình bộ nhớ ngữ cảnh (Zero-Memory Bloat) và giải quyết triệt để lỗi tiến trình treo/xung đột Git lock trên toàn OS.

---

## 🏛️ I. GIAO THỨC BẮT TAY MÙ (BLIND TASKID HANDSHAKE PROTOCOL)

Trong mô hình Swarm P2P Mesh phi tập trung, việc giao việc giữa Orchestrator (`AI-PROJECT-MANAGER`) và các Worker chuyên biệt **tuyệt đối không truyền tải toàn bộ nội dung yêu cầu, code mẫu hay ngữ cảnh thô qua kênh chat**:

```text
┌────────────────────────┐                    ┌────────────────────────┐
│  AI-PROJECT-MANAGER    │                    │     WORKER NODE        │
│  (Orchestrator Node)   │                    │  (DevOps / DB / BE...) │
└───────────┬────────────┘                    └───────────┬────────────┘
            │                                             │
            │ 1. send_message({ taskId: "TASK-XXX" })     │
            │────────────────────────────────────────────>│ (Zero-Memory Bloat:
            │    (Chỉ gửi duy nhất TaskID)                │  Ngữ cảnh chat < 50 tokens)
            │                                             │
            │                                             │ 2. Query MySQL Runtime SSOT
            │                                             │    (Lấy requirements, schema,
            │                                             │     acceptance criteria)
            │                                             │
            │                                             │ 3. Thi công & Test trong boundary
            │                                             │
            │ 4. REST API Zero-Trust                      │
            │    POST /api/v1/governance/sign-task        │
            │<────────────────────────────────────────────│
            │    (Kèm Deliverables JSON + Checksum SHA256)│
```

### 1. Nguyên Tắc Cốt Lõi:
1. **Zero-Memory Bloat (Chống Tràn Context Window):** Tin nhắn P2P chỉ mang duy nhất định danh `TaskID`. Toàn bộ mô tả, tài liệu đặc tả, và tiêu chí nghiệm thu được lưu tại CSDL Quản Trị SSOT (`Sys_Project_Tasks`).
2. **Kéo Ngữ Cảnh Đúng Nhu Cầu (On-Demand Context Pull):** Worker khi thức giấc tự dùng script nội bộ truy vấn CSDL để lấy đúng ranh giới bất biến (`exclusive_boundaries`) của task đó trong thời gian < 10ms.
3. **Ký Bàn Giao Không Tin Cậy (Zero-Trust Delivery Signing):** Khi hoàn thành, Worker submit kết quả qua API chuẩn hóa có ký xác thực payload và checksum deliverables. Cấm cập nhật trực tiếp trạng thái `COMPLETED` bằng SQL thô khi chưa qua QA Inspector.

---

## ⚙️ II. CƠ CHẾ TỰ CỨU & GIẢI PHÓNG TREO PHI TẬP TRUNG (P2P MESH REAPER ENGINE)

Động cơ tự phục hồi (`swarm_self_healing_reaper.js`) chạy thường trực ở chế độ nền nhằm đảm bảo môi trường thực thi luôn sạch sẽ:

### 1. Tự Động Thu Dọn Khóa Git Mồ Côi (Orphaned Git Lock Auto-Pruning):
* **Vấn đề thực địa:** Trên hệ điều hành Windows/Linux, khi một tiến trình Git bị crash hoặc kill đột ngột, file `.git/index.lock` vẫn tồn tại, khiến toàn bộ chu kỳ commit/push tiếp theo bị tê liệt hoàn toàn.
* **Quy tắc Reaper:** Định kỳ quét thư mục `.git/`. Nếu phát hiện file `index.lock` có tuổi thọ (TTL) vượt quá **30 giây**, Reaper tự động xóa file khóa và ghi log cảnh báo.

### 2. Khóa Triệt Tiêu Đơn Nhất (Singleton Mutex PID Lock):
* Mỗi Worker Node duy trì 1 file định danh tiến trình tại `swarm/locks/${WORKER_ROLE}.pid`.
* Reaper liên tục giám sát nhịp tim (`Heartbeat`). Nếu phát hiện tiến trình cũ bị chết bất đắc kỳ tử hoặc treo nhịp tim vượt quá **3 chu kỳ**, Reaper tự động giải phóng lock để cho phép Worker mới khởi động lại êm thắm.

### 3. Khử Trùng Lặp Tiến Trình Toàn OS (OS-Wide Process Deduplication):
* **Vấn đề:** Tránh tình trạng 2 hoặc nhiều tiến trình daemon watcher cùng một vai trò chạy song song gây race condition trên cùng một task.
* **Quy tắc Reaper:** Khi phát hiện $\ge 2$ tiến trình watcher có cùng định danh vai trò đang chạy đồng thời, Reaper lập tức tiêu diệt (`kill -9`) tiến trình cũ hơn, chỉ bảo lưu duy nhất tiến trình mới nhất.

### 4. Cắt Tỉa Lệnh Treo Khẩn Cấp (Hung Execution Circuit Breaker):
* Mọi tiến trình con được spawn ra từ CLI (ví dụ: `node -e`, build script, test runner) đều được gắn trần thời gian thực thi (mặc định trần **45 giây**).
* Quá ngưỡng 45 giây mà không trả về kết quả, Reaper lập tức cưỡng chế chấm dứt tiến trình để tránh ngốn CPU/RAM và deadlock tài nguyên máy chủ.

# 🌐 ĐẶC TẢ KIẾN TRÚC GIAO TIẾP NỘI BỘ 3 TẦNG KHÉP KÍN & ĐỘNG CƠ TỰ CỨU PHI TẬP TRUNG
**UNIVERSAL 3-TIER CLOSED-LOOP COMMUNICATION & DECENTRALIZED REAPER SPECIFICATION**

- **Phân loại**: UNIVERSAL ARCHITECTURAL SPECIFICATION
- **Kế thừa từ**: `universal-ai-swarm-framework` (V6.2 Enterprise)
- **Mục tiêu**: Mô hình hóa trừu tượng toàn bộ cơ chế giao tiếp nội bộ Swarm, triệt tiêu 100% phình ngữ cảnh (Zero-Memory Bloat) và đảm bảo khả năng tự phục hồi khi hạ tầng bị gián đoạn mà không phụ thuộc vào server mẹ.

---

## 🏛️ I. KIẾN TRÚC TAM GIÁC GIAO TIẾP KHÉP KÍN 3 TẦNG (THE 3-TIER CLOSED-LOOP)

Giao tiếp trong Swarm tuyệt đối **không bao giờ là các tin nhắn chat `send_message` một chiều đơn thuần**. Hệ thống vận hành trên **Tam Giác Khép Kín 3 Tầng**:

```text
       ┌─────────────────────────────────────────────────────────┐
       │             [TẦNG 1: BẢNG TASK SSOT VẬT LÝ]             │
       │    CSDL Runtime Sys_Project_Tasks & TASK_DISPATCH_BOARD │
       └──────────────┬───────────────────────────▲──────────────┘
                      │                           │
                      │ Bốc việc                  │ Nộp nghiệm thu
                      │ (Blind Handshake)         │ (REST API Zero-Trust)
                      ▼                           │
       ┌───────────────────────────┐   Thẩm định  ┌───────────────────────────┐
       │ [TẦNG 2: WORKER TRỰC CHIẾN] ────────────>│ [TẦNG 3: CỔNG KIỂM TOÁN QA]│
       │  - swarm-watch.js Daemon  │   độc lập    │  - AI-AUDIT-QA Inspector  │
       │  - P2P Mesh Reaper Engine │              │  - Trigger State Machine  │
       └───────────────────────────┘              └───────────────────────────┘
```

### 1. Tầng 1: Mặt Phẳng Trạng Thái Gốc (SSOT Task Plane)
* Toàn bộ trạng thái vòng đời công việc (`OPEN` $\rightarrow$ `ASSIGNED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `READY_FOR_AUDIT` $\rightarrow$ `COMPLETED`) phải được lưu trữ bất biến tại CSDL Quản Trị Runtime (`Sys_Project_Tasks` hoặc file GitOps `TASK_DISPATCH_BOARD.json`).
* Cấm dùng bộ nhớ tạm của hội thoại hay file Markdown tĩnh làm nguồn trạng thái.

### 2. Tầng 2: Mặt Phẳng Thực Thi Tự Chủ & Tự Cứu (Autonomous Worker Plane)
* Mỗi Worker Node duy trì **Tiến trình Daemon Nền Trực Chiến** (`swarm-watch.js`) kết hợp cùng **Động Cơ Tự Cứu** (`swarm_self_healing_reaper.js`) chạy ngầm với cờ `IsDaemon: true`.
* **Giao Thức Bắt Tay Mù (Blind TaskID Handshake Protocol):**
  * Khi Orchestrator (`AI-PROJECT-MANAGER`) giao việc, chỉ gửi **DUY NHẤT một gói tin nhỏ gọn chứa `TaskID`**:
    `send_message(Recipient='${WORKER_UUID}', Message='{"taskId": "${TASK_ID}"}')`.
  * **CẤM:** Gửi cả tràng giải thích, code mẫu dài dòng qua chat (gây phình to Context Window, lú lẫn AI, đốt token vô ích).
  * Worker nhận `TaskID` tự dùng script nội bộ truy vấn CSDL để kéo đúng mô tả, tài liệu đặc tả, và tiêu chí nghiệm thu trong thời gian $< 10\text{ms}$.

### 3. Tầng 3: Mặt Phẳng Nghiệm Thu Nhị Phân Không Tin Cậy (Zero-Trust Verification Plane)
* **Kỷ luật nộp bài:** Worker thi công xong **TUYỆT ĐỐI KHÔNG ĐƯỢC tự ý UPDATE Status = 'COMPLETED' qua SQL**.
* Worker gọi REST API: `POST /api/v1/governance/sign-task` nộp file deliverables dạng JSON kèm mã băm Checksum SHA256.
* Hệ thống tự động chuyển trạng thái sang `READY_FOR_AUDIT`.
* Chỉ khi `AI-AUDIT-QA` vào kiểm tra thực địa độc lập (bằng công cụ kiểm thử thực tế, trình duyệt thật) và đóng dấu `AuditVerdict = 'PASSED'`, State Machine mới tự động nâng trạng thái lên `COMPLETED`.

---

## ⚙️ II. CƠ CHẾ TRỰC CHIẾN & ĐỘNG CƠ TỰ CỨU PHI TẬP TRUNG (P2P MESH REAPER ENGINE)

### 1. Cơ Chế Thức Tỉnh Hai Chiều Bằng Exit Code 0 (Bidirectional FSM Wakeup):
* Mọi Node (PM, Worker, QA) bắt buộc phải duy trì tiến trình nền:
  `node swarm/scripts/swarm-watch.js --role ${ROLE_NAME} --loop` (chạy ngầm với `IsDaemon: true`).
* **Nguyên lý hoạt động:**
  * Daemon chạy ở tầng OS bằng Node.js thuần (tiêu hao 0 Token), định kỳ kiểm tra Task Board mỗi 15-30 giây.
  * Khi phát hiện có Task mới khớp với Role/UUID $\rightarrow$ **Tiến trình tự động kết thúc với `process.exit(0)`**.
  * Trong môi trường Agentic IDE, sự kiện Exit Code 0 của một background task sẽ **TỰ ĐỘNG KÍCH HOẠT REACTIVE WAKEUP ĐÁNH THỨC AGENT DẬY THI CÔNG NGAY MÀ KHÔNG CẦN CON NGƯỜI HAY PM PHẢI GỌI NHẮC!**
  * Khi Worker nộp bài sang `READY_FOR_AUDIT` $\rightarrow$ Daemon của QA tự động thoát 0 để đánh thức QA đi kiểm toán.

### 2. Động Cơ Tự Cứu P2P Mesh Reaper (`swarm_self_healing_reaper.js`):
Khi hạ tầng gặp sự cố (mạng lag, ngắt kết nối CSDL, crash giữa chừng), Reaper xử lý tự động theo 4 cơ chế:

1. **Tự Động Bẻ Khóa Git (`.git/index.lock` Auto-Sweeper):**
   * Nếu file lock tồn tại quá **30 giây** do tiến trình trước bị crash, Reaper tự động xóa file khóa (`fs.unlinkSync`), giải phóng toàn bộ team khỏi bế tắc commit.
2. **Chiếm Quyền Tiên Phát — "Măng mọc tre già rụng" (Pre-emptive Takeover):**
   * Quét toàn bộ OS. Nếu phát hiện một Role có $\ge 2$ tiến trình `swarm-watch.js` chạy đè nhau, Reaper lập tức tiêu diệt (`kill`) các tiến trình cũ hơn, chỉ giữ lại duy nhất 1 tiến trình mới nhất có PID cao nhất.
3. **Tiêu Diệt Lệnh Treo (Execution Circuit Breaker):**
   * Tự động quét và cưỡng chế kill mọi tiến trình `node -e` hoặc CLI chạy ngầm vượt trần **45 giây** để chống tràn socket và khóa cứng tài nguyên.
4. **Giải Phóng Treo Phi Tập Trung (Decentralized Mutual Liberation):**
   * Không cần máy chủ trung tâm. Bất kỳ Agent nào đang chạy vòng tuần tra cũng tự động kích hoạt hàm `sweepOsMeshProcesses()`, dọn rác và giải phóng lẫn nhau trên toàn hệ điều hành.

---

## 🚫 III. BẢNG SO SÁNH: PHƯƠNG THỨC LỖI VS QUY CHUẨN THỰC CHIẾN

| Tiêu chí | Phương thức Lỗi Của Team Mới (Chết Đứng Hạ Tầng) | Quy Chuẩn Framework V6.2 (Sống Sót Tự Chủ) |
| :--- | :--- | :--- |
| **Kênh điều phối** | Chỉ dùng `send_message` suông, gửi tin nhắn dài dòng kèm code mẫu vào chat. | **Blind TaskID Handshake:** Chỉ gửi TaskID. Worker tự query CSDL lấy context trong 10ms. |
| **Trực chiến nền** | **Không mở Watcher nền (`IsDaemon: false` hoặc không chạy).** Khi hết lượt, bot chìm vào giấc ngủ vĩnh viễn. | **Bắt buộc chạy `swarm-watch.js` (`IsDaemon: true`).** Tự thức dậy qua cơ chế Exit Code 0. |
| **Khi hạ tầng đứng** | Đứng hình toàn đàn, treo lock Git, deadlock toàn bộ task, chờ người dùng vào gõ lệnh. | **P2P Reaper tự cứu:** Tự xóa `.git/index.lock` >30s, tự kill lệnh treo >45s, tự dọn PID zombie. |
| **Nghiệm thu** | Tự ý dùng SQL UPDATE status thành `COMPLETED` hoặc báo cáo mồm. | **Zero-Trust REST API:** Ký qua `/sign-task` kèm Checksum; chỉ QA thật duyệt mới thành `COMPLETED`. |

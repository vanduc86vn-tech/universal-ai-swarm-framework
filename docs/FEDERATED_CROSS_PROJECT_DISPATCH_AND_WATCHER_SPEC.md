# 🌐 QUY CHUẨN ĐIỀU PHỐI SỰ KIỆN LIÊN DỰ ÁN & DAEMON WATCHER ĐA NGUỒN
**FEDERATED CROSS-PROJECT EVENT DISPATCH & MULTI-SOURCE WATCHER SPECIFICATION (UASOF-FED-DISPATCH-V1.0)**

- **Mã hiệu**: `UASOF-FED-DISPATCH-V1.0` | **Cấp thẩm quyền**: Sếp Alex & Super Master Leader
- **Phân loại**: UNIVERSAL INVARIANT ARCHITECTURAL SPECIFICATION
- **Đối tượng áp dụng**: Tất cả các Cụm Dự Án (Projects), Project Managers (NODE_02), Partner Nodes, và Daemons (`swarm-watch.js`).
- **Nguyên tắc tối thượng**: **TUYỆT ĐỐI KHÔNG HARDCODE NGỮ CẢNH DỰ ÁN CỤ THỂ**. Mọi cơ chế được thiết kế theo mô hình trừu tượng hóa (Abstraction), hướng đối tượng (SOLID), bảo toàn tính đóng gói (Encapsulation), và an toàn thông tin (CIA Triad).

---

## 🛑 I. BẢN CHẤT GỐC RỄ & PHÂN TÍCH CẢNH BÁO (ROOT CAUSE ANALYSIS)

### 1. Hiện Tượng Đứt Gãy Liên Dự Án (Cross-Project Blindspot Breakdown)
Khi vận hành hệ sinh thái đa dự án độc lập (Multi-Repository / Multi-Tenant Ecosystem):
- **Phía Dự Án A (Initiator/Client Project - vd: App, ERP):** Tạo nhiệm vụ cần đối tác xử lý, lưu vào CSDL nội bộ hoặc file cục bộ của Dự án A.
- **Phía Dự Án B (Partner/Provider Project - vd: Infra, VPS, Service Partner):** Tiến trình daemon tuần tra nền (`swarm-watch.js`) chỉ quét file cục bộ của Dự án B (`swarm/TASK_DISPATCH_BOARD.json`).
- **Hậu quả:** 
  - Dự án A tưởng đã giao việc, ngồi chờ vô vọng.
  - Dự án B quét 0 task, ngủ đông hoàn toàn.
  - Hệ thống rơi vào trạng thái chết đứng liên dự án (Cross-Project Deadlock / Split-Brain).

### 2. Cảnh Báo "Bẫy Hardcode Chữa Cháy" (The Ad-hoc Coupling Anti-Pattern)
> [!CAUTION]
> **HÀNH VI BỊ CẤM:** Để giải quyết việc lệch dữ liệu, Partner Dự Án B vội vã cấu hình mở cổng mạng kết nối thẳng vào CSDL nội bộ MySQL của Dự Án A.
> 
> **Lý do nghiêm cấm ở cấp độ kiến trúc thượng tầng:**
> 1. **Vi phạm Tính Đóng Gói (Encapsulation Breakdown):** Dự án B chọc thủng ranh giới cô lập dữ liệu của Dự án A. Khi Dự án A thay đổi schema, di dời hạ tầng, hoặc bảo trì DB, Dự án B sập dây chuyền theo.
> 2. **Vi phạm CIA-Confidentiality & CIA-Integrity:** Làm lộ chuỗi kết nối (Database Credentials), mở cổng mạng trực tiếp giữa các máy chủ mà không qua lớp xác thực Zero-Trust. Dự án B có thể vô tình lock bảng hoặc sửa nhầm dữ liệu nội bộ của Dự án A.
> 3. **Bẫy Spaghetti (Point-to-Point Hell):** Nếu hệ sinh thái có $N$ dự án, mô hình kết nối DB chéo đòi hỏi $N \times (N-1)$ kết nối mạng riêng lẻ. Độ phức tạp tăng theo lũy thừa $O(N^2)$, phá hủy hoàn toàn tính mở rộng.

---

## 🏛️ II. MÔ HÌNH KIẾN TRÚC ĐIỀU PHỐI ĐA TẦNG (FEDERATED TRI-CHANNEL DISPATCH)

Hệ thống Master Framework thiết lập mô hình **3 Trụ Cột Điều Phối Phân Tán (Tri-Channel Cross-Project Dispatch Architecture)**:

```text
  ┌────────────────────────────────────────────────────────────────────────┐
  │                   DỰ ÁN A (INITIATOR PROJECT / CLIENT)                 │
  │   - AI-PROJECT-MANAGER phát sinh nhu cầu liên dự án                    │
  │   - Định dạng Task theo chuẩn UASOF-RFC-CONTRACT                       │
  └───────────────────┬────────────────────────────────┬───────────────────┘
                      │                                │
        [SLOW-PATH: TRÍ NHỚ VẬT LÝ]        [FAST-PATH: ĐÁNH THỨC TỨC THÌ]
                      │                                │
                      ▼                                ▼
  ┌──────────────────────────────────────┐     ┌───────────────────────────┐
  │   KÊNH 1: GITOPS CROSS-MAILBOX       │     │  KÊNH 2: P2P FAST-PATH    │
  │   Hoặc KÊNH 1B: GOVERNANCE API BUS   │     │  send_message / Webhook   │
  │   - File RFC vật lý có chữ ký số     │     │  - Payload gọn nhẹ        │
  │   - Không hardcode DB nội bộ         │     │  - Đánh thức Daemon dậy   │
  └───────────────────┬──────────────────┘     └───────────────┬───────────┘
                      │                                        │
                      └───────────────────┬────────────────────┘
                                          │
                                          ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │                 DỰ ÁN B (PARTNER / PROVIDER PROJECT)                   │
  │   - swarm-watch.js chạy Pluggable Provider (Đa Nguồn)                  │
  │   - Tiếp nhận Task qua Mailbox / API -> Ký nhận Handshake              │
  │   - Phân bổ cho Worker thi công -> Báo cáo ngược qua RFC Feedback      │
  └────────────────────────────────────────────────────────────────────────┘
```

---

## 📜 III. NGUYÊN TẮC THIẾT KẾ CHI TIẾT (DESIGN INVARIANTS)

### 1. Kênh Lưu Trữ Bất Biến (Slow-Path Persistence Channels)
Tùy thuộc vào hạ tầng triển khai của Cụm Dự Án, PM chỉ được phép chọn 1 trong 2 kênh chuẩn:

*   **Phương Án 1 (Chuẩn Mực - GitOps Shared Mailbox):**
    *   Mỗi dự án thiết lập thư mục hòm thư:
        *   `docs/cross_project_mailbox/outbox/` (Thư đi)
        *   `docs/cross_project_mailbox/inbox/` (Thư đến)
    *   Khi giao việc cho Dự án B, PM Dự án A sinh file RFC: `RFC_${SOURCE_PROJECT}_TO_${TARGET_PROJECT}_TASK_${TASK_ID}.json`.
    *   Đồng bộ qua Git (Submodule, Shared Repo, hoặc Git Action Push).
    *   *Ưu điểm:* Tuân thủ 100% Biện pháp 1, 3, 13 (Trí nhớ nằm trong file, không đụng độ, lưu vết lịch sử Git tuyệt đối).

*   **Phương Án 2 (Chuẩn Doanh Nghiệp - Zero-Trust Governance API Gateway):**
    *   Nếu hai dự án dùng chung Control Plane, giao tiếp bắt buộc thông qua **REST API Gateway** được bảo vệ bằng Token HMAC/Bearer:
        *   `POST /api/v1/cross-project/tasks/dispatch`
        *   `GET /api/v1/cross-project/tasks/pending?target_role=${ROLE_NAME}`
        *   `POST /api/v1/cross-project/tasks/ack`
    *   *Nghiêm cấm:* Worker hoặc PM tự ý mở TCP Socket chọc thẳng vào MySQL/PostgreSQL port 3306/5432 của dự án đối tác.

### 2. Kênh Tín Hiệu Đánh Thức Tức Thì (Fast-Path Signal)
Khi Dự án A ghi Task xong vào Slow-Path, PM Dự án A **bắt buộc** thực hiện bước Fast-Path:
*   Gửi tin nhắn P2P qua `send_message` tới Agent ID / UUID của PM Dự án B.
*   **Payload chuẩn hóa (Zero-Context Bloat):**
    ```json
    {
      "event_type": "FEDERATED_CROSS_PROJECT_TASK_DISPATCH",
      "dispatch_id": "XPROJ-20261101-001",
      "source_project": "${INITIATOR_PROJECT_CODE}",
      "target_project": "${PARTNER_PROJECT_CODE}",
      "target_role": "${TARGET_ROLE_META}",
      "task_id": "TASK-EXT-089",
      "channel_type": "GITOPS_MAILBOX",
      "mailbox_ref": "docs/cross_project_mailbox/inbox/RFC_INITIATOR_TASK-EXT-089.json",
      "signature_hash": "sha256_checksum_here"
    }
    ```
*   Tín hiệu Fast-Path đánh thức Target PM ngay trong turn kế tiếp, không cần chờ đến chu kỳ polling của Watcher.

---

## ⚙️ IV. CHIẾN LƯỢC NÂNG CẤP DAEMON WATCHER ĐA NGUỒN (PLUGGABLE WATCHER STRATEGY)

Tiến trình `swarm-watch.js` không được phép hardcode duy nhất một nguồn đọc. Thay vào đó, áp dụng **Strategy Pattern** cho phép nạp nhiều Provider cùng lúc:

```text
                     ┌─────────────────────────────┐
                     │       SWARM-WATCH.JS        │
                     │    (Daemon Event Engine)    │
                     └──────────────┬──────────────┘
                                    │
           ┌────────────────────────┼────────────────────────┐
           ▼                        ▼                        ▼
┌───────────────────────┐ ┌───────────────────┐ ┌─────────────────────────┐
│ LocalBoardProvider    │ │ MailboxProvider   │ │ FederatedApiProvider    │
│ (TASK_DISPATCH_BOARD) │ │ (inbox/*.json)    │ │ (GET /api/v1/.../tasks) │
└───────────────────────┘ └───────────────────┘ └─────────────────────────┘
```

### Quy Tắc Xử Lý Ưu Tiên (Resolution Priority):
1.  **Hòm thư đến liên dự án (Incoming Mailbox):** Nếu phát hiện file RFC mới trong `cross_project_mailbox/inbox/`, nạp ngay vào bộ nhớ điều phối, chuyển trạng thái file sang `.processing`.
2.  **API Sự Kiện Tập Trung (Nếu có cấu hình Endpoint):** Truy vấn qua HTTP GET với timeout 3 giây. Nếu đứt mạng, tự động suy thoái mềm (Graceful Fallback) về đọc file cục bộ, không crash tiến trình.
3.  **Task Board Cục Bộ (`TASK_DISPATCH_BOARD.json`):** Quét các task nội bộ do chính PM của dự án đó phát hành.

---

## 🛡️ V. ĐỐI SOÁT VỚI HỆ THỐNG 16 BIỆN PHÁP AN TOÀN & KIỂM TRA CHÉO

| Biện Pháp Trong Hệ Thống 16 | Ứng Dụng Trong Điều Phối Liên Dự Án |
| :--- | :--- |
| **Biện pháp 1 & 2 (Git Local & Remote)** | Mọi giao kèo (RFC Contract) giữa 2 dự án được lưu thành file và commit vào Git. Mất mạng hay sập máy đều không mất dấu vết giao dịch. |
| **Biện pháp 3 (Sổ việc chung SSOT)** | Mỗi dự án có sổ việc riêng; sổ việc liên dự án được duy trì qua cơ chế Federation (Liên kết) thay vì gộp chung CSDL hỗn tạp. |
| **Biện pháp 6 ("Không có file thì chưa xong")** | Task liên dự án chỉ được coi là hoàn thành khi Partner nộp lại file kết quả (`RFC_FEEDBACK_${TASK_ID}.json`) kèm artifacts chứng minh (log, config, endpoint). |
| **Biện pháp 7 (Cấm bịa đặt, tên gọi phải có thật)** | Khử ảo giác: Endpoint, port, IP hay container giữa 2 dự án phải được kiểm tra thông mạng vật lý (`curl -I`, `ping`, DDL test) trước khi ký nghiệm thu. |
| **Biện pháp 8 (Kiểm tra chéo độc lập)** | QA của Dự án B kiểm chéo cấu hình trước khi nộp; sau đó QA của Dự án A kiểm chéo lại lần 2 tại đầu nhận trước khi PM A đóng Task. |
| **Biện pháp 9 (Bảo vệ thông tin nhạy cảm)** | Cấm tuyệt đối việc chia sẻ mật khẩu root DB nội bộ cho đối tác bên ngoài. Chỉ cấp quyền qua API Key có giới hạn phạm vi (Least Privilege). |
| **Biện pháp 13 (Mỗi bên ghi file riêng)** | Khử hoàn toàn xung đột ghi đè. Dự án A chỉ ghi Outbox của A; Dự án B chỉ đọc Inbox của B và phản hồi vào Outbox của B. |
| **Biện pháp 14 & 15 (Daemon tuần tra ngầm)** | Tiến trình `swarm-watch.js` chạy nền bằng Node.js thuần tiêu thụ 0 token, canh giữ 24/7 cả task nội bộ lẫn task đối tác gửi sang. |

---

## 📌 VI. KẾT LUẬN & CHỈ THỊ THỰC THI (MANDATORY DIRECTIVE)

1. **Đối với các Project Managers (NODE_02):**
   * Tuyệt đối cấm giao việc liên dự án bằng một mẩu tin chat sơ sài hay tự ý nạp vào DB riêng của mình rồi hy vọng đối tác "tự biết mà làm".
   * Bắt buộc áp dụng Giao thức Kép: Lưu vết Persistent File/API + Bắn Fast-Path P2P Notification.
2. **Đối với các Worker Hạ Tầng & Partner:**
   * Tuyệt đối cấm đề xuất hoặc chấp nhận giải pháp "kết nối trực tiếp DB nội bộ" của dự án đối tác.
   * Mọi yêu cầu kết nối phải đi qua cổng chuẩn hóa (Mailbox Bridge hoặc REST API Contract).
3. **Đối với Bộ Daemon (`swarm-watch.js` & `swarm_self_healing_reaper.js`):**
   * Tích hợp Provider đa nguồn để sẵn sàng đón nhận sự kiện liên dự án mà không cần khởi động lại tiến trình.

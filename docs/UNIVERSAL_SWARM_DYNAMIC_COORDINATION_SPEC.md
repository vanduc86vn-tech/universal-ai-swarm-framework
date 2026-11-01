# 🌌 UNIVERSAL AI SWARM DYNAMIC COORDINATION & TOPOLOGY SPECIFICATION
### QUY CHUẨN ĐIỀU PHỐI LIÊN WORKER & CƠ CHẾ TÔ-PÔ ĐỘNG TỔNG QUÁT HÓA CỰC ĐẠI
**Mã tài liệu:** `UASOF-DYN-COORD-V4.2` | **Cấp thẩm quyền:** Super Master Leader & Sếp Alex  
**Kế thừa trực tiếp từ:** `UNIVERSAL_AI_SWARM_ARCHITECTURE.md` & `META_ARCHITECTURAL_PARADIGM.md`  
**Bảo mật:** Nguồn Sự Thật Duy Nhất (SSOT) — Bất biến và Áp dụng cho Mọi Dự Án

---

## 🏛️ I. NỀN TẢNG HỌC THUYẾT & TỔNG QUÁT HÓA CỰC ĐẠI (OOP SWARM THEORY)

Hệ thống AI Swarm không vận hành theo lối phân công công việc ad-hoc (chắp vá tùy tiện), mà được mô hình hóa theo **Tư duy Lập trình Hướng đối tượng thuần khiết (Pure OOP for Swarm Agents)**:

```text
 ┌──────────────────────────────────────────────────────────────────────────┐
 │                  LEAD EXECUTIVE ARCHITECT (NODE_01)                      │
 │    - Giữ vai trò Chiến lược cấp cao & Trao đổi trực tiếp với Sếp Alex    │
 │    - Bảo vệ Hiến pháp SSOT, Giám sát vĩ mô qua CSDL vật lý               │
 │    - Tuyệt đối KHÔNG ôm việc, KHÔNG làm thay việc của PM và Workers      │
 └────────────────────────────────────┬─────────────────────────────────────┘
                                      │ (Mệnh lệnh Chiến lược & Quy chế)
                                      ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │                  AI-PROJECT-MANAGER ORCHESTRATOR (NODE_02)               │
 │    - Chỉ huy trưởng hiện trường, điều phối State Machine của Task        │
 │    - Phân bổ slot, duy trì Daemons tuần tra ngầm (Watch & Reaper)        │
 │    - Kích hoạt Chuỗi Phối Hợp Liên Worker (Chain of Responsibility)      │
 └────────────────────────────────────┬─────────────────────────────────────┘
                                      │ (P2P Mesh Dispatch theo Slot)
                                      ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │              DYNAMIC WORKER POOL (MẠNG LƯỚI TÔ-PÔ ĐỘNG)                  │
 │  Slot ARCHITECT  │  Slot DATA  │  Slot CORE_BE  │  Slot UI  │  Slot QA  │
 │  Slot BROWSER    │  Slot DOMAIN│  Slot INFRA    │  Slot ... │ (Slot N+1)│
 └──────────────────────────────────────────────────────────────────────────┘
```

### 1. Bốn Nguyên Lý OOP Cốt Lõi Vận Hành Tổ Chức Swarm:
1. **Tính Bao Đóng (Encapsulation):**
   - Mỗi Worker sở hữu một không gian trách nhiệm (`exclusive_boundaries`), thư mục làm việc và công cụ độc lập. 
   - Không Worker nào được can thiệp vào mã nguồn hoặc tài liệu độc quyền của Worker khác mà chưa qua giao ước API/Artifact.
2. **Tính Kế Thừa (Inheritance):**
   - Mọi Worker tự động kế thừa bộ Hiến chương bất biến: Zero-Hardcode, Zero-Mock Deliverables, Chuẩn giao tiếp 4 khối OOP (`[TARGET]`, `[INPUT/STATE]`, `[ACTION/METHOD]`, `[OUTPUT/ASSERTION]`).
3. **Tính Đa Hình (Polymorphism):**
   - Khi nhận cùng một tín hiệu `EXECUTE_TASK`, mỗi Worker phản ứng theo đúng chuyên môn sâu của mình (DB Researcher xuất DDL 3NF; Backend xuất API Service; UI xuất Component; QA xuất Biên bản kiểm toán; Browser xuất Evidence CDP).
4. **Tính Trừu Tượng Hóa (Abstraction):**
   - Toàn bộ sự phức tạp của OS, Linux, Git, MySQL được trừu tượng hóa qua giao diện Task State Machine và REST API Endpoint của Cổng Quản trị (`gov-client.js`).

---

## 🔄 II. QUY TRÌNH PHỐI HỢP LIÊN WORKER TỔNG QUÁT (UNIVERSAL E2E VALUE CHAIN)

Mọi yêu cầu nghiệp vụ phát sinh trong bất kỳ dự án nào (ERP, CRM, WMS, POS, AI Platform) đều bắt buộc phải chuyển trạng thái qua **Máy trạng thái hữu hạn khép kín (Finite State Machine - FSM)**:

$$\text{OPEN} \xrightarrow{\text{Dispatch}} \text{IN\_PROGRESS} \xrightarrow{\text{Deliver}} \text{INTERNAL\_VERIFIED} \xrightarrow{\text{Audit}} \text{QA\_PASSED} \xrightarrow{\text{E2E Real Flow}} \text{BROWSER\_PASSED} \xrightarrow{\text{Sign}} \text{COMPLETED}$$

### 1. Phân Tầng Trách Nhiệm Phối Hợp (Separation of Concerns):

| Tầng Phối Hợp | Meta-Role Đảm Nhiệm | Input Yêu Cầu | Output (Deliverable Vật Lý) | Tiêu Chí Chuyển Tầng |
| :--- | :--- | :--- | :--- | :--- |
| **Tầng 1: Blueprint & Architecture** | `ARCHITECT` & `DOMAIN_SPECIALIST` | Yêu cầu của Sếp Alex | Bản đặc tả RFC, Domain Model, Luồng dữ liệu | Kiến trúc được phê duyệt, 0% xung đột |
| **Tầng 2: Data Persistence** | `DATA_TIER_ARCHITECT` | Blueprint RFC Tầng 1 | DDL 3NF, Stored Procedures, Migration SAFE | Không có lệnh `DROP`, toàn vẹn khóa ngoại |
| **Tầng 3: Implementation** | `BACKEND` & `FRONTEND_UI` | Schema Tầng 2 & RFC Tầng 1 | Mã nguồn API, Controller, Màn hình giao diện | Biên dịch dist không lỗi, kết nối API 200 |
| **Tầng 4: Independent Quality Gate** | `QA_SECURITY_AUDITOR` | Deliverables Tầng 3 | Báo cáo `QA_AUDIT_...md`, Quét OWASP | 0% Mock code, 0% Leak thông tin, Test PASS |
| **Tầng 5: Physical E2E Gatekeeper** | `BROWSER_E2E_AUDITOR` | Hệ thống triển khai thực địa | Ảnh chụp Chrome CDP, Log Network, User Journey | 100% Flow thực tế chạy trên trình duyệt thật |

> ⚠️ **ĐIỀU LỆ THÉP:** Một task KHÔNG BAO GIỜ được phép đóng sang `COMPLETED` nếu thiếu chốt chặn **Tầng 5 (Browser E2E Auditor)** đối với các tính năng có giao diện người dùng. Mọi nghiệm thu chỉ dừng ở Tầng 4 đều bị coi là "nghiệm thu trên giấy".

---

## 🔌 III. CƠ CHẾ TÔ-PÔ ĐỘNG: CẮM RÚT THÀNH VIÊN MỚI (DYNAMIC TOPOLOGY & EXTENSIBILITY)

Thiết kế tuân thủ nghiêm ngặt **Nguyên lý Đóng/Mở (Open-Closed Principle - OCP)**: Hệ thống mở rộng đón nhận thành viên mới mà không làm sửa đổi quy trình cốt lõi.

```text
               ┌──────────────────────────────────────────────┐
               │         UNIVERSAL SLOTS CATALOGUE            │
               │  - CONVERSATION_ID_1: System Lead (Fixed)    │
               │  - CONVERSATION_ID_2: PM Orchestrator (Fixed)│
               │  - CONVERSATION_ID_3 .. 12: Core Workers     │
               │  - CONVERSATION_ID_N+1: Dynamic Extension    │
               └──────────────────────┬───────────────────────┘
                                      │ Plug-in New Worker
                                      ▼
               ┌──────────────────────────────────────────────┐
               │  BƯỚC 1: ĐĂNG BẠ VÀO AI_SWARM_REGISTRY.json  │
               │  - Cấp Slot ID, UUID session, Meta-role      │
               │  - Thiết lập exclusive_boundaries            │
               └──────────────────────┬───────────────────────┘
                                      │
                                      ▼
               ┌──────────────────────────────────────────────┐
               │  BƯỚC 2: KHỞI TẠO RUNTIME README CÔ LẬP      │
               │  - Nạp template: <ROLE>-runtime-readme.md    │
               │  - Kích hoạt Daemon: swarm-watch.js --role   │
               └──────────────────────┬───────────────────────┘
                                      │
                                      ▼
               ┌──────────────────────────────────────────────┐
               │  BƯỚC 3: KẾ THỪA CHUỖI PHỐI HỢP (PIPELINE)   │
               │  - Tự động map Input Artifacts từ Tầng K-1   │
               │  - Tự động nộp Output Artifacts cho Tầng K+1 │
               └──────────────────────────────────────────────┘
```

### Quy Tắc Cắm Rút Thành Viên (Hot-Plug Protocol):
1. **Khi thêm Worker Chuyên ngành Mới (Ví dụ: `AI-LOGISTICS-SPECIALIST`, `AI-SECURITY-PENTESTER`):**
   - PM không cần viết lại quy chế điều phối.
   - Chỉ cần thêm 1 entry vào `AI_SWARM_REGISTRY.json` với vai trò và biên giới thư mục độc quyền.
   - Định nghĩa: Worker này nhận đầu vào từ Tầng nào và bàn giao đầu ra cho Tầng nào trong chuỗi 5 tầng.
2. **Khi một Worker bị ngắt kết nối hoặc tái sinh (Worker Recycling):**
   - Quá trình tái sinh kế thừa nguyên vẹn Slot ID, cập nhật Conversation ID mới qua `pm-fast-onboard.js`.
   - Các Worker khác trong chuỗi không bị ảnh hưởng, luồng phối hợp tiếp tục chuyển giao bình thường.

---

## ⚖️ IV. PHÂN CÔNG VAI TRÒ BẤT BIẾN TẠI TẦNG THƯỢNG ĐỈNH

1. **[[ BOSS-EXECUTIVE-CHIEF ]] (NODE_01 — Lead Executive):**
   - **Đối tượng tương tác:** Duy nhất **Sếp Alex** (Project Owner).
   - **Phạm vi trách nhiệm:** 
     + Hoạch định kiến trúc chiến lược, ban hành tiêu chuẩn Framework.
     + Độc lập kiểm toán số liệu từ CSDL vật lý (MySQL SSOT) để báo cáo trung thực cho Sếp.
     + **Tuyệt đối KHÔNG ôm việc thi công:** Không viết code chi tiết, không quản lý vi mô từng task, không làm thay PM.
2. **AI-PROJECT-MANAGER (NODE_02 — Field Orchestrator):**
   - **Đối tượng tương tác:** Toàn bộ dàn **Workers** trong Swarm.
   - **Phạm vi trách nhiệm:**
     + Toàn quyền chỉ huy tác chiến hiện trường, phân bổ task theo đúng sơ đồ phối hợp 5 tầng.
     + Giám sát nhịp tim và hàng đợi của từng Worker qua 2 daemon ngầm (`swarm-watch.js` và `swarm_self_healing_reaper.js`).
     + Chịu trách nhiệm hoàn toàn về tiến độ và chất lượng bàn giao trước Lead và Sếp Alex.

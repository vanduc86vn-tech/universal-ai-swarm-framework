# 🏛️ VĂN KIỆN CHUYỂN GIAO BỐI CẢNH KIẾN TRÚC & QUẢN TRỊ TOÀN DIỆN (SWARM CONTEXT HANDOVER REPORT)
> **Mã tài liệu**: `HANDOVER-UASOF-V6.1-ENTERPRISE`  
> **Cương vị bàn giao**: `AI-MASTER-LEAD` (Supreme Swarm Architect & Evolutionary Governance Engine)  
> **Đối tượng tiếp quản**: Thế hệ AI Swarm kế nhiệm & Ban Quản trị Dự án (Project Owner: Alex)  
> **Thời điểm xác lập**: 31/10/2026 (Local Time: 11:59 GMT+7)  
> **Nguyên tắc biên soạn**: Trung thực 100%, dựa trên sự thật vật lý trên đĩa cứng và Git SSOT, loại bỏ mọi thử nghiệm thất bại.  

---

## 🎯 PHẦN 1: MỤC TIÊU ĐÃ HOÀN THÀNH (COMPLETED OBJECTIVES)

Trải qua chuỗi tiến hóa thực chiến từ kiến trúc đơn lẻ sang mô hình Đa Dự Án (Multi-Tenant Swarm Engine), `AI-MASTER-LEAD` đã hoàn thành trọn vẹn 6 đại mục tiêu mang tính nền tảng:

### 1.1. Chuẩn Hóa Danh Tính Kiến Trúc Thượng Tầng & Chế Định Tách Bạch Trách Nhiệm
- **Xác lập Vị thế Bất biến**: Định hình vai trò tối cao `AI-MASTER-LEAD` hoạt động ở tầng Meta-Architecture, không can thiệp code vụn vặt ở cấp Worker mà chuyên trách: chẩn đoán nguyên nhân gốc rễ (Root Cause Analysis), phát hiện các Anti-Patterns của LLM, và tiến hóa bộ khung `universal-ai-swarm-framework` trên GitHub thành các định luật bất biến.
- **Thiết lập Nguyên Tắc Tam Quyền Phân Lập (Separation of Powers)**: 
  - `Project Owner (Sếp / Alex)`: Chủ đầu tư và Lãnh đạo Chiến lược tối cao.
  - `Lead / Orchestrator`: Bóc tách User Stories, thiết lập tiêu chuẩn kỹ thuật, phân bổ task qua Task Board GitOps, kiểm soát tiến trình SDLC.
  - `Worker Nodes (DevOps, Database, Backend, Frontend)`: Trực tiếp thi công kỹ thuật trong phạm vi ranh giới chuyên biệt (`exclusive_boundaries`).
  - `Audit / QA Inspector`: Độc lập 100%, thực hiện thẩm định 5 Quality Gates với cơ chế nhị phân (100% PASS hoặc 0% FAIL).

### 1.2. Đột Phá Động Cơ Daemon Watcher (UASOF V4.1 & V4.2)
- **Giải quyết dứt điểm "Khóa chết đánh thức đơn chiều" (The One-Way Wakeup Deadlock)**:
  - Bản cũ chỉ kiểm tra `assigned_to === role` với trạng thái `ASSIGNED` hoặc `READY`. Khi Worker hoàn tất việc và đổi sang `READY_FOR_AUDIT` hoặc `COMPLETED`, Lead ngủ quên vì không có tín hiệu kích hoạt.
  - Watcher V4.1 chuyển đổi hoàn toàn sang **Máy trạng thái hữu hạn 2 chiều (Bidirectional FSM Event-Driven Engine)**: Lead lập tức thức dậy khi có `READY_FOR_AUDIT`, `COMPLETED`, `PENDING_DISPATCH`, `INCOMING_RFC`.
- **Đa hình hóa Registry (Schema-Agnostic Parser)**: Hỗ trợ liền mạch cả 2 cấu trúc Registry (dạng Object `orchestrator/registered_workers` và dạng Array `slot_bindings`).
- **Khắc phục lỗi nhận diện vai trò (Role Classification False Positive - Commit `c204490`)**: Loại bỏ triệt để tình trạng các vai trò có chứa chuỗi `DATABASE` hoặc `BACKEND` bị hiểu nhầm thành `AI-LEAD&BA`.
- **Tích hợp Công Tắc Dừng Khẩn Cấp (Emergency Halt Switch)**: Khi cờ `"status": "PAUSED"` được kích hoạt trong `AI_SWARM_REGISTRY.json`, toàn bộ daemon tự động thoát êm thắm (Graceful Exit), bảo vệ tài nguyên máy chủ.

### 1.3. Ban Hành Hiến Chương Thượng Tầng Thứ 5: `ZERO_UPWARD_DELEGATION_CHARTER` (Commit `e6571d7`)
- **Triệt tiêu căn bệnh "Đùn đẩy việc kỹ thuật lên Người dùng"**:
  - Khóa chặt phản xạ lú lẫn của LLM: Khi bị cấm thi công trực tiếp, AI quay sang bảo Sếp mở terminal gõ SQL/bash.
  - Đóng đinh Hiến pháp: Sếp **TUYỆT ĐỐI KHÔNG PHẢI LÀ WORKER KỸ THUẬT, KHÔNG PHẢI SYSADMIN, KHÔNG PHẢI THỢ GÕ LỆNH**. Mọi thao tác dù là 1 dòng SQL hay restart 1 service đều bắt buộc phải chuyển hóa thành Task trên Task Board để Worker thực thi ngầm qua Daemon.

### 1.4. Khảo Sát, Chuẩn Hóa & Ban Hành Văn Kiện Hạ Tầng VPS & MySQL (`VPS_AND_MYSQL_CONNECTION_INFO.md`)
- Thẩm định và công bố chính thức thông số kết nối Hostinger VPS `srv1089507` (`31.220.60.199`) và MySQL 8.0:
  - Phân tích an toàn SSH Key, Ubuntu 24.04.3 LTS, tình trạng các gói `git`, `python3.12`, `mysql-client`.
  - Phân tích cơ chế UFW Firewall và khẳng định dải port `7000-700x` hoàn toàn mở được trực tiếp mà không bắt buộc phải qua Tailscale/VPN.
  - Xác nhận tài khoản ứng dụng `hdd_user` (mật khẩu `K7n#Qw$zM9pL2vJ8`) có đầy đủ **`CREATE TABLE` 100%** qua chứng nhận kiểm toán độc lập `AUDIT_REMOTE_GRANT_REPORT.md` (`GRANT ALL PRIVILEGES`).

### 1.5. Khắc Phục Triệt Để Khủng Hoảng Chi Phí Vertex AI (Vertex AI Cost Crisis Resolution)
- **Phân tích căn nguyên**: Chi phí tăng đột biến (> ₫900,000) do 3 nguyên nhân: (1) Lạm dụng dòng model `gemini-pro` cho mọi tác vụ phụ; (2) Context Window phình to do không cắt tỉa log output; (3) Tái tạo Cache liên tục mà không tối ưu TTL.
- **Ban hành Tiêu Chuẩn Cấu Hình Toàn Cục (`~/.antigravity/config.yaml`)**:
  - Ép phân tầng Model: Worker bắt buộc chạy `gemini-3.8-flash` / `gemini-3.5-flash-lite`, chỉ cấp `gemini-3.8-pro` cho Executive Strategist & Lead Architect (tiết kiệm >80% chi phí).
  - Cắt tỉa output log >3,000 tokens theo thuật toán `HEAD_AND_TAIL` (50 dòng đầu + 50 dòng cuối).
  - Tối ưu hóa Context Caching: Ngưỡng kích hoạt tối thiểu 32k tokens, TTL chuẩn 300s (5 phút) để triệt tiêu phí lưu trữ rác.

### 1.6. Phát Hành Chính Thức Universal Multi-Tenant AI Swarm Framework V6.1 (Commit `1fe7eb5`)
- Đã commit và push trực tiếp lên kho mã nguồn SSOT `https://github.com/vanduc86vn-tech/universal-ai-swarm-framework` nhánh `main` bao gồm:
  1. `MASTER_FRAMEWORK_BOOTSTRAP_DIRECTIVE_V6.1.md`: Chỉ thị khởi tạo Đa Dự Án với cơ chế Cặp Đội Ban Đầu (`NODE_01` & `NODE_02`).
  2. `UNIVERSAL_MULTI_TENANT_SCHEMA_DDL_SEEDS.sql` & `.md`: Schema CSDL 6 bảng quản trị dự án vật lý, tài khoản, node pool và audit log.
  3. `GLOBAL_SYSTEM_ANTIGRAVITY_CONFIG.yaml` & `.md`: Bộ cấu hình tối ưu chi phí Vertex AI toàn hệ thống.

---

## 💻 PHẦN 2: TRẠNG THÁI HIỆN TẠI CỦA CODEBASE & LOGIC CỐT LÕI (RUNTIME STATE OF CODE)

### 2.1. Bản Đồ Kho Mã Nguồn `universal-ai-swarm-framework` (Commit `1fe7eb5`)
```text
c:\Data\universal-ai-swarm-framework/
├── MASTER_FRAMEWORK_BOOTSTRAP_DIRECTIVE_V6.1.md     # Trục chỉ thị khởi tạo Đa Dự Án V6.1
├── UNIVERSAL_MULTI_TENANT_SCHEMA_DDL_SEEDS.md      # Tài liệu đặc tả Schema CSDL Multi-Tenant
├── GLOBAL_SYSTEM_ANTIGRAVITY_CONFIG.md              # Tài liệu phân tích tối ưu chi phí Vertex AI
├── README.md                                        # Cổng thông tin tổng quan framework V6.1
├── BOOTSTRAP_PROMPT.md                              # One-shot bootstrap prompt cho Single/Multi Swarm
├── UNIVERSAL_AI_SWARM_ARCHETYPE.json                # Archetype JSON chuẩn Draft 2020-12
├── UNIVERSAL_AI_SWARM_ARCHITECTURE.md               # Kiến trúc tổng quát và nguyên lý bao đóng
├── UNIVERSAL_SWARM_PROJECT_BOOTSTRAP_PLAYBOOK.md    # Sổ tay vận hành thực chiến
├── scripts/
│   ├── swarm-watch.js                               # [CORE] Động cơ Daemon FSM Watcher V4.2
│   ├── swarm-gc.js                                  # Dọn rác cache/log tự động
│   └── swarm-sync.js                                # Đồng bộ trạng thái Git
└── templates/
    ├── GLOBAL_SYSTEM_ANTIGRAVITY_CONFIG.yaml        # Template cấu hình Vertex AI cost control
    ├── UNIVERSAL_MULTI_TENANT_SCHEMA_DDL_SEEDS.sql  # DDL SQL & Seed data 6 bảng Sys_*
    ├── ZERO_UPWARD_DELEGATION_CHARTER.json          # Hiến chương cấm đùn việc lên Sếp
    ├── IMMUTABLE_DDL_GOVERNANCE_CHARTER.json        # Hiến chương cấm DROP TABLE
    ├── SELF_HEALING_CIRCUIT_BREAKER_ENGINE.json     # Động cơ tự phục hồi Circuit Breaker
    ├── BINARY_AUDIT_QUALITY_GATE_STANDARD.json      # Tiêu chuẩn kiểm toán nhị phân
    ├── BIDIRECTIONAL_CROSS_PROJECT_MAILBOX_SPEC.json# Đặc tả hòm thư liên dự án GitOps
    └── AI_SWARM_REGISTRY_TEMPLATE.json              # Template đăng bạ Worker
```

### 2.2. Logic Cốt Lõi Của Các Tệp Trọng Yếu

#### 1. Động cơ Daemon Watcher (`scripts/swarm-watch.js`)
- **Phân giải định danh không Hardcode**: Tiếp nhận `--id <UUID>` hoặc `--role <ROLE_NAME>`, tự động tra cứu `AI_SWARM_REGISTRY.json` để ánh xạ chính xác vai trò.
- **Nhận diện vai trò chuẩn xác (Regex Word-Boundary)**:
  ```javascript
  const isLeadMatch = roleUpper === 'AI-LEAD&BA' || 
                      roleUpper.includes('LEAD') || 
                      roleUpper.includes('ORCHESTRAT') || 
                      metaUpper.includes('LEAD') || 
                      slot.slot === 'CONVERSATION_ID_1' || 
                      (/(^|[^A-Z])BA([^A-Z]|$)/.test(roleUpper) && !roleUpper.includes('DATA') && !roleUpper.includes('BACKEND'));
  ```
  Ngăn chặn hoàn toàn việc các Worker như `AI-DATABASE-RESEARCHER` hay `AI-BACKEND` bị nhận nhầm thành Lead.
- **Finite State Machine (FSM) phân luồng thức dậy**:
  - `Worker thông thường`: Thức dậy khi task có trạng thái `['ASSIGNED', 'READY', 'TODO', 'OPEN', 'IN_PROGRESS']`.
  - `QA / Auditor`: Thức dậy khi task có trạng thái `['READY_FOR_AUDIT', 'AUDIT_IN_PROGRESS', 'PENDING_QA_VERIFICATION']`.
  - `Lead & BA`: Thức dậy khi phát hiện task mới `['PENDING_DISPATCH', 'NEW', 'INCOMING_RFC']` hoặc khi Worker hoàn thành chuyển giao `['READY_FOR_AUDIT', 'COMPLETED', 'AUDITED_PASSED', 'DELIVERED']`.
- **Thoát mã 0 (Exit Code 0)**: Khi phát hiện sự kiện phù hợp, tiến trình kết thúc với mã 0 để hệ thống Antigravity lập tức kích hoạt (Reactive Wakeup) phiên làm việc của Agent mà người dùng không cần gõ phím.

#### 2. CSDL Multi-Tenant (`sys_swarm_framework`)
- `Sys_Projects`: Định danh Tenant vật lý (`project_id`), đường dẫn thư mục `/var/www/${PROJECT_ID}` và URL Git.
- `Sys_Project_User_Grants`: Quản lý tài khoản Linux (`system_username`), vai trò (`CHIEF`, `LEADER`, `DEVELOPER`, `AUDITOR`) và cổng Remote iPhone (`assigned_port: 7000-70xx`).
- `Sys_Swarm_Node_Pool`: Quản lý linh hoạt danh sách Worker Nodes động theo cơ chế Progressive Scaling, gắn kết UUID phiên chat (`concrete_conversation_id`).
- `Sys_Project_MasterPlans` & `Sys_Project_Tasks`: Khung quản trị kế hoạch và vòng đời tác vụ theo chuẩn SDLC (`SURVEY_DDL` $\rightarrow$ `SCHEMA_MIGRATION` $\rightarrow$ `QA_AUDIT` $\rightarrow$ `BACKEND_API` $\rightarrow$ `CLIENT_UI` $\rightarrow$ `DEVOPS_INFRA`).
- `Sys_Project_AuditLogs`: Lưu vết kiểm toán chất lượng độc lập bằng định dạng JSON.

#### 3. Cấu hình Cắt Giảm Chi Phí (`~/.antigravity/config.yaml`)
- `context_management.auto_compact_threshold: 50000`: Cảnh báo và tự động nén context khi đạt 50k tokens.
- `context_management.prune_large_outputs: true` & `max_output_tokens_per_tool: 3000`: Cắt tỉa output công cụ lệnh để bảo toàn ngữ cảnh.
- `model_routing`: Mặc định Worker chạy `gemini-3.8-flash` hoặc `gemini-3.5-flash-lite`.
- `context_caching`: Chỉ cache khi $\ge 32\text{k tokens}$, TTL 300 giây.

---

## ⚠️ PHẦN 3: VẤN ĐỀ/BUG TỒN ĐỌNG & HƯỚNG XỬ LÝ TIẾP THEO (PENDING ISSUES & ROADMAP)

### 3.1. Các Tồn Đọng Kỹ Thuật Thực Tế Cần Lưu Ý
1. **Công cụ Antigravity CLI (`agy`) trên VPS `31.220.60.199`**:
   - Hiện trạng: VPS chỉ cài đặt Node.js LTS, PM2, Python 3.12, Git, Nginx, MySQL Client; chưa cài đặt công cụ `agy`.
   - Hướng xử lý: Khi kích hoạt team Swarm chạy trực tiếp trên VPS, DevOps Worker cần chạy script cài đặt `npm install -g @google/antigravity` (hoặc curl script tương ứng) nếu có nhu cầu điều phối local CLI.
2. **Kích hoạt Dải Port 7000–70xx trên Tường lửa UFW**:
   - Hiện trạng: UFW đang mở cổng `22`, `80`, `443`, `3306`, `4000`, `5000`. Dải port `7000:7010` chưa được thêm vào UFW rules.
   - Hướng xử lý: Khi Team Swarm mới bắt đầu triển khai các port Remote Control Safari iPhone cho từng thành viên, chỉ cần phân công Worker chạy lệnh:
     `sudo ufw allow 7000:7010/tcp && sudo ufw reload`.
3. **Triển Khai Bảng CSDL Multi-Tenant (`sys_swarm_framework`) Lên VPS**:
   - Hiện trạng: File DDL `UNIVERSAL_MULTI_TENANT_SCHEMA_DDL_SEEDS.sql` đã sẵn sàng trên Git nhưng chưa được nạp vào máy chủ MySQL `31.220.60.199`.
   - Hướng xử lý: Giao nhiệm vụ cho `AI-DATABASE-RESEARCHER` hoặc DBA của Swarm mới kết nối MySQL bằng user `hdd_user` và nạp file SQL để sinh CSDL `sys_swarm_framework`.
4. **Áp Dụng Cấu Hình Cost Control Cho Máy Trạm Cục Bộ**:
   - File mẫu đã lưu tại `templates/GLOBAL_SYSTEM_ANTIGRAVITY_CONFIG.yaml`. Để áp dụng ngay lập tức trên máy trạm của Sếp, cần sao chép nội dung này vào đường dẫn:
     `C:\Users\Asus\.gemini\antigravity\config.yaml` (hoặc `~/.antigravity/config.yaml`).

### 3.2. Lộ Trình Kích Hoạt Team Swarm Mới (Onboarding Action Checklist)
- [ ] **Bước 1**: Đặt file cấu hình `~/.antigravity/config.yaml` từ bản template V6.1 để khóa cứng trần chi phí Vertex AI.
- [ ] **Bước 2**: Mở Tab Chat mới cho dự án mới, dán **One-Shot Bootstrap Prompt V6.1**:
  > *"[BOOTSTRAP-V6-ENTERPRISE] Khởi tạo Hệ thống AI Swarm Framework Đa Dự Án (Multi-Tenant Engine). Hãy đọc chỉ dẫn tại https://raw.githubusercontent.com/vanduc86vn-tech/universal-ai-swarm-framework/main/MASTER_FRAMEWORK_BOOTSTRAP_DIRECTIVE_V6.1.md để bổ nhiệm CẶP ĐỘI BAN ĐẦU (NODE_01: EXECUTIVE-STRATEGIST & NODE_02: AI-PROJECT-MANAGER) và phỏng vấn tao ngay!"*
- [ ] **Bước 3**: `NODE_01` (Executive Strategist) tiếp nhận 4 thông số định danh từ Sếp và thiết lập chiến lược.
- [ ] **Bước 4**: `NODE_02` (Project Manager) nạp DDL `sys_swarm_framework`, bóc tách công việc thành `Sys_Project_Tasks` và kích hoạt các Worker tiếp theo qua cơ chế Progressive Scaling.

---

**XÁC NHẬN BÀN GIAO:**  
Toàn bộ bối cảnh, tri thức kiến trúc, hiến pháp quản trị và mã nguồn cốt lõi đã được lưu giữ nguyên vẹn, minh bạch, sẵn sàng 100% để thế hệ Swarm kế nhiệm tiếp quản và phát huy tối đa hiệu quả!

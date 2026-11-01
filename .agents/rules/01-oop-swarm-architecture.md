# 🏛️ QUY TẮC KIẾN TRÚC OOP TỔNG QUÁT HÓA & PHÂN GIẢI THỰC THỂ ĐỘNG (OOP SWARM ARCHITECTURE)
*Áp dụng bất biến cho mọi Turn xử lý và mở rộng không giới hạn từ 1 đến 1.000+ AI Workers.*

---

## I. TƯ DUY OOP: PHÂN BIỆT LỚP TRỪU TƯỢNG (CLASS/INTERFACE) VÀ THỰC THỂ THỜI GIAN THỰC (INSTANCE)
1. **TRỪU TƯỢNG HÓA CAO ĐỘ (ABSTRACTIONS OVER CONCRETIONS):**
   - Bộ quy tắc và Hiến pháp KHÔNG hardcode danh sách UUID hay tên cụ thể của từng worker cá lẻ.
   - Toàn bộ đàn Worker được phân lớp chặt chẽ thành **7 Tầng Kiến Trúc OOP Bất Biến (Architecture Layers)**.
   - Mỗi Worker là một **Instance** kế thừa từ một **Class** và hiện thực hóa một **Interface** chuẩn mực.

2. **BẢNG PHÂN LỚP KIẾN TRÚC OOP (7 ARCHITECTURAL LAYERS):**

| Lớp Kiến Trúc (Architecture Layer) | Abstract Interface | Trách Nhiệm Thiết Yếu (Core Responsibilities) | Ranh Giới Độc Quyền (Exclusive Boundary) | Điều Kiện Tiên Quyết / Lệnh Cấm (Invariants) |
| :--- | :--- | :--- | :--- | :--- |
| **👑 APEX_STRATEGY** | `IStrategyArchitect` | Hoạch định kiến trúc cấp cao, bóc tách WBS 4 tầng, tiếp nhận yêu cầu từ Boss. | `docs/architecture/`, `docs/spec/` | CẤM gõ code chi tiết tính năng; CẤM đùn việc kỹ thuật lên Boss. |
| **⚙️ ORCHESTRATOR** | `IWorkflowOrchestrator` | Nhạc trưởng điều phối FSM 5 tầng, gán task, đánh thức worker, quản trị tiến độ. | `swarm/`, `docs/handover/` | CẤM code thay worker; CẤM chạy SSH/SCP VPS; CẤM gán task cho Nobody. |
| **🗄️ DATA_TIER** | `IDataArchitect` | Thiết kế Schema 3NF, Stored Procedures, Views, Migrations tăng dần, Rollback. | `migrations/`, `schema/`, `docs/database/` | CẤM `DROP TABLE` và `TRUNCATE`; Mọi DDL phải có Rollback < 60 giây. |
| **⚙️ SERVICE_TIER** | `IDomainService` | API Controllers, Services nghiệp vụ, thuật toán MRP, tích hợp và xử lý dữ liệu. | `src/backend/`, `src/api/` | CẤM tự ý `ALTER TABLE` cấu trúc DB; CẤM tự ý chạy lệnh SSH/SCP VPS. |
| **🎨 PRESENTATION_TIER** | `IPresentation` | Giao diện React/Vite/Tailwind, Meta-View Engine OOP, Responsive Web & Mobile PWA. | `src/frontend/` | CẤM hardcode 1.290 views tĩnh; Bắt buộc dùng Meta-Engine kế thừa. |
| **🛡️ AUDIT_TIER** | `ISecurityAuditor` | Kiểm toán độc lập 100%: Quét OWASP, 0% Mock Data, Chrome CDP chụp ảnh `.png` thực địa. | `docs/audit/`, `tests/` | CẤM tự sửa code hộ Worker ("Tự đá bóng tự thổi còi là trọng tội"). |
| **🖥️ INFRA_TIER** | `IPlatformInfra` | Quản trị máy chủ VPS, Cloudflare Gateway, tiến trình PM2, cấu hình mạng bảo mật. | `docs/infrastructure_rfcs/` | Độc quyền lệnh SSH/SCP; Bắt buộc đóng port 3306 (`127.0.0.1`). |

---

## II. GIAO THỨC PHÂN GIẢI THỰC THỂ ĐỘNG (DYNAMIC SERVICE DISCOVERY PROTOCOL)
*Quy chuẩn cho phép hệ thống mở rộng từ 10 worker lên 1.000 worker mà không cần sửa đổi tài liệu quy chế.*

1. **NGUỒN SỰ THẬT ĐĂNG BẠ (SERVICE REGISTRY SSOT):**
   - Danh bạ thực thể được lưu trữ động tại CSDL MySQL `hdd_swarm_governance.Swarm_AI_Entities` và đồng bộ qua `swarm/AI_SWARM_REGISTRY.json`.
   - Mỗi instance worker khi được sinh ra (spawn) hoặc kích hoạt đều sở hữu một thẻ định danh gồm:
     `{ RoleName, ArchitectureLayer, ConversationUUID, Status, Model, ExclusiveBoundaries }`.

2. **CƠ CHẾ PHÂN GIẢI ĐỘNG (ZERO HARDCODED POINTERS):**
   - Khi Orchestrator hoặc bất kỳ Agent nào cần giao tiếp hoặc gửi tín hiệu P2P (`send_message`), tuyệt đối **KHÔNG tra cứu bảng cứng trong file Markdown**.
   - Agent sử dụng công cụ CLI Dynamic Service Resolver:
     ```bash
     node swarm/scripts/gov-client.js resolve <ROLE_OR_LAYER_OR_KEYWORD>
     ```
   - **Ví dụ phân giải:**
     - Phân giải tầng CSDL: `node swarm/scripts/gov-client.js resolve DATA_TIER`
     - Phân giải tầng Backend: `node swarm/scripts/gov-client.js resolve BACKEND`
     - Phân giải chuyên gia MRP: `node swarm/scripts/gov-client.js resolve MRP`
     - Phân giải kiểm toán viên: `node swarm/scripts/gov-client.js resolve AUDIT`
   - Kết quả trả về JSON tức thời chứa `conversation_id` chính xác của instance đang trực chiến để đưa vào `send_message(Recipient, Message)`.

3. **CƠ CHẾ TASK-BOUND CONVERSATION RESOLUTION:**
   - Khi nhận nhiệm vụ từ MySQL qua `gov-client.js tasks`, trường `assigned_conversation_id` đã được gắn chặt với Task. Worker chỉ cần thực thi task được định tuyến cho mình mà không cần quan tâm đến các worker khác.

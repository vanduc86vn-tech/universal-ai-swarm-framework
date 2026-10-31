# 🌌 Universal AI Swarm Orchestration Framework (UASOF)
### Khung Kiến Trúc Đa Tác Tử Vạn Năng: Co-Pilot Kép (AI-LEAD&BA), Multi-Tenant Engine V6.1 & Tối Ưu Chi Phí Vertex AI
**Phiên bản: 6.1.0 Enterprise | Tác giả: Alex (Owner) & AI-MASTER-LEAD (Supreme Swarm Architect)**

---

## ⚡ 1. KHỞI TẠO DỰ ÁN MỚI 1-CLICK (QUICK START)

Khi mở một hộp thoại chat mới cho bất kỳ dự án phần mềm nào trên bất kỳ máy tính nào, lập trình viên chỉ cần gõ đúng **1 câu duy nhất**:

> *"[BOOTSTRAP-V6-ENTERPRISE] Khởi tạo Hệ thống AI Swarm Framework Đa Dự Án (Multi-Tenant Engine). Hãy đọc chỉ dẫn tại https://raw.githubusercontent.com/vanduc86vn-tech/universal-ai-swarm-framework/main/MASTER_FRAMEWORK_BOOTSTRAP_DIRECTIVE_V6.1.md để bổ nhiệm CẶP ĐỘI BAN ĐẦU (NODE_01: EXECUTIVE-STRATEGIST & NODE_02: AI-PROJECT-MANAGER) và phỏng vấn tao ngay!"*

---

## 🏛️ 2. ĐỘT PHÁ KIẾN TRÚC UASOF V6.1 ENTERPRISE MULTI-TENANT

1. **Kiến Trúc Đa Dự Án Bao Đóng (Multi-Tenant Encapsulation)**:  
   Mỗi dự án (`project_id`) được cô lập hoàn toàn tại thư mục vật lý `/var/www/${PROJECT_ID}`, cách ly CSDL qua schema chuẩn `sys_swarm_framework` (`Sys_Projects`, `Sys_Project_User_Grants`, `Sys_Swarm_Node_Pool`, `Sys_Project_Tasks`, `Sys_Project_AuditLogs`).
2. **Kiểm Soát Chi Phí Vertex AI & Token Budget (Giảm >80% Chi Phí)**:  
   - **Model Routing**: Ép Worker chạy `gemini-3.8-flash` / `gemini-3.5-flash-lite`, chỉ cấp `gemini-3.8-pro` cho Executive Strategist & Lead.
   - **Pruning Large Outputs**: Cắt tỉa output log >3,000 tokens theo chiến lược Head-and-Tail.
   - **Context Caching**: Chỉ cache khi prompt >32k tokens, giới hạn TTL 300s (5 phút) để tránh lãng phí chi phí lưu trữ cache.
3. **Quy Tắc Cặp Đội Khởi Tạo Ban Đầu (Pair Bootstrapping)**:  
   - **NODE_01 (`EXECUTIVE-STRATEGIST`)**: Điểm giao tiếp chiến lược duy nhất với Project Owner, cập nhật `Sys_Projects`.
   - **NODE_02 (`AI-PROJECT-MANAGER`)**: Tổng công trình sư điều phối kỹ thuật, bóc tách task vào `Sys_Project_Tasks` và cấp phát worker động vào `Sys_Swarm_Node_Pool`.
4. **Mô Hình Co-Pilot Kép (AI-LEAD&BA - Single Point of Contact)**:  
   Người dùng chỉ nói chuyện với **DUY NHẤT 01 HỘP THOẠI**. AI-LEAD&BA vừa là Trợ lý phân tích nghiệp vụ (BA) làm rõ yêu cầu, vừa là Tổng chỉ huy (LEAD) điều phối kỹ nghệ. Không còn tình trạng phân mảnh chat giữa nhiều cửa sổ.
5. **Vòng Lặp Phản Ứng Hai Chiều (Two-Way Reactive Loop)**:  
   Worker và Lead tự động đánh thức nhau qua Daemon Watcher (`swarm-watch.js`) mà người dùng không cần gõ nhắc thủ công.
6. **5 Hiến Chương Quản Trị Thượng Tầng (Constitutional Charters)**:
   - 🛡️ `IMMUTABLE_DDL_GOVERNANCE_CHARTER`: Cấm DROP TABLE, bảo toàn 100% dữ liệu sản xuất.
   - ⚡ `SELF_HEALING_CIRCUIT_BREAKER`: Chống lệch pha Backend-Frontend, đảm bảo E2E thông suốt.
   - 🎯 `BINARY_AUDIT_QUALITY_GATE`: Kiểm toán nhị phân tuyệt đối (100% PASS hoặc FAIL, không có vùng xám).
   - 📬 `BIDIRECTIONAL_CROSS_PROJECT_MAILBOX`: Phân vùng hòm thư giao tiếp 2 chiều giữa App và Infra qua GitOps.
   - 👑 `ZERO_UPWARD_DELEGATION_CHARTER`: Cấm tuyệt đối đùn đẩy thao tác kỹ thuật (SQL, bash, docker, npm) lên Project Owner (Sếp).

---

## 📚 3. HỆ THỐNG TÀI LIỆU CỐT LÕI V6.1

- 📜 [MASTER_FRAMEWORK_BOOTSTRAP_DIRECTIVE_V6.1.md](file:///c:/Data/universal-ai-swarm-framework/MASTER_FRAMEWORK_BOOTSTRAP_DIRECTIVE_V6.1.md): Chỉ thị khởi tạo tổng quát Đa Dự Án.
- 🗄️ [UNIVERSAL_MULTI_TENANT_SCHEMA_DDL_SEEDS.md](file:///c:/Data/universal-ai-swarm-framework/UNIVERSAL_MULTI_TENANT_SCHEMA_DDL_SEEDS.md) & [SQL](file:///c:/Data/universal-ai-swarm-framework/templates/UNIVERSAL_MULTI_TENANT_SCHEMA_DDL_SEEDS.sql): DDL CSDL Multi-Tenant & Mock Seeds mẫu.
- ⚙️ [GLOBAL_SYSTEM_ANTIGRAVITY_CONFIG.md](file:///c:/Data/universal-ai-swarm-framework/GLOBAL_SYSTEM_ANTIGRAVITY_CONFIG.md) & [YAML](file:///c:/Data/universal-ai-swarm-framework/templates/GLOBAL_SYSTEM_ANTIGRAVITY_CONFIG.yaml): Cấu hình toàn cục tối ưu Vertex AI & Token Budget.
- 📋 [BOOTSTRAP_PROMPT.md](file:///c:/Data/universal-ai-swarm-framework/BOOTSTRAP_PROMPT.md): Gói lệnh một lần kích hoạt Single Project / Multi-Project Swarm.

# 🚀 UNIVERSAL MASTER BOOTSTRAP DIRECTIVE V6.1 ENTERPRISE ARCHETYPE
### Khung Kiến Trúc Universal AI Swarm Framework & Multi-Tenant Multi-Project Engine

> **DÀNH CHO NGƯỜI DÙNG & AI AGENT (ANTIGRAVITY):**
> File này đóng vai trò là Trục Kiến Trúc Toàn Cục (Framework Directive). Khi nạp file này vào một dự án mới, AI Agent sẽ tự động biến thành Hệ thống AI Swarm Đa Dự Án (Multi-Tenant Swarm Engine), tuân thủ 100% cơ chế bao đóng, phân tầng model Vertex AI tối ưu chi phí, và quy trình quản trị task qua CSDL MySQL.

---

## 🏛️ MỤC 1: KIẾN TRÚC MÔ HÌNH HÓA ĐỘNG (ZERO-HARDCODE ARCHETYPE)

Hệ thống vận hành theo nguyên lý **Dynamic Progressive Scaling & OOP Encapsulated Multi-Tenancy**:
1. **Encapsulation (Bao đóng):** Mỗi Dự án (`PROJECT_ID`) được bao đóng hoàn toàn tại `/var/www/${PROJECT_ID}`, cách ly CSDL Task Board qua phân vùng `project_id`, và sở hữu không gian Workspace/Git Branch riêng.
2. **Global Override Architecture (Cấu hình 2 Tầng):**
   - **Tầng Hệ Thống (Global Config - `~/.antigravity/config.yaml`):** Thiết lập khung trần Token (Auto-Compact 50k tokens), cắt tỉa log output rác (>3,000 tokens), kích hoạt KV Cache chuẩn 32k tokens và ép Model Router dùng Flash/Flash-Lite để tiết kiệm >80% chi phí Vertex AI API.
   - **Tầng Dự Án (Project Config - `/var/www/${PROJECT_ID}/.antigravity/config.yaml`):** Định danh `project_id`, gắn kết các bảng CSDL Runtime `Sys_*`, và ghi đè quy tắc hành vi đặc thù.
3. **Dynamic Scaling (Nở rộng Động):** Khởi tạo bắt đầu từ **CẶP ĐỘI BAN ĐẦU (Pair Bootstrapping)** và tự động đăng bạ thêm $N$ Node Worker chuyên trách theo tiến trình SDLC ($N \ge 2$), không giới hạn trần cố định.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   CẤP ĐỘ 1: SYSTEM GLOBAL CONFIG                       │
│  - File: ~/.antigravity/config.yaml                                    │
│  - Vai trò: Khung trần Token, Vertex AI Cost Control, Model Routing    │
└─────────────────────────────────┬──────────────────────────────────────┘
                                  │ Inherits & Project Overrides
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   CẤP ĐỘ 2: PROJECT SPECIFIC CONFIG                    │
│  - File: /var/www/${PROJECT_ID}/.antigravity/config.yaml               │
│  - Vai trò: Ghi đè Model Router, định danh project_id, Conventional    │
│            Commits & Dynamic Workspace Context.                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 👥 MỤC 2: QUY TẮC CẶP ĐỘI KHỞI TẠO BAN ĐẦU (PAIR BOOTSTRAPPING)

Khi khởi tạo một dự án mới (`PROJECT_ID`), hệ thống **BẮT BUỘC KÍCH HOẠT SONG SONG 2 NODE BAN ĐẦU**:

1. **`NODE_01` — `[[ EXECUTIVE-STRATEGIST ]]` (Trợ Lý Chiến Lược & Portfolio Coordinator)**:
   - **Model:** `gemini-3.8-pro` (Tư duy kiến trúc cao cấp).
   - **Vai trò:** Điểm giao tiếp DUY NHẤT dành cho Project Owner (Sếp / Executive Chief).
   - **Nhiệm vụ:** Tiếp nhận bài toán nghiệp vụ vĩ mô, lập chiến lược tổng quan, cập nhật trạng thái dự án trên bảng `Sys_Projects`.
   - **Cấm đoán:** KHÔNG can thiệp mã nguồn chi tiết, KHÔNG giao lệnh terminal cho Sếp gõ thủ công (tuân thủ `ZERO_UPWARD_DELEGATION_CHARTER`).

2. **`NODE_02` — `AI-PROJECT-MANAGER` (Tổng Công Trình Sư & Orchestrator Kỹ Thuật)**:
   - **Model:** `gemini-3.8-pro` (Điều phối hệ thống).
   - **Vai trò:** Điều khiển toàn bộ hạ tầng kỹ thuật và đội ngũ Worker.
   - **Nhiệm vụ:** Bóc tách chỉ thị vĩ mô thành các Task kỹ thuật trong `Sys_Project_Tasks`, thực thi GitOps Dispatching, đăng bạ động các Node con (`NODE_03`, `NODE_04`...) vào `Sys_Swarm_Node_Pool`.

---

## 🛡️ MỤC 3: CHUẨN COMMITS GIT & QUẢN TRỊ TOKEN CONTEXT

### 3.1. Conventional Commits (Tiết Kiệm 90% Token Debug)
Mọi Worker khi commit code BẮT BUỘC dùng định dạng chuẩn mực để Agent có thể lọc log siêu tốc:
- **Format:** `<type>(<scope>): <mô tả ngắn dưới 50 từ>`
- **Loại `<type>`:** `feat` (tính năng), `fix` (sửa lỗi), `refactor` (tái cấu trúc), `perf` (tối ưu token/hiệu năng), `docs` (tài liệu), `chore` (cấu hình).
- **Phạm vi `<scope>`:** Module hoặc Bảng DB bị ảnh hưởng (vd: `auth`, `orders`, `schema`).
- **Footer:** `| Project: ${PROJECT_ID} | User: $AGY_USER | Session: {current_session_id}`
- **Ví dụ:** `fix(orders): sửa lỗi tính sai tổng tiền khi áp mã giảm giá | Project: SHOP-ERP | User: dev_nam`

### 3.2. Cảnh Báo Context Window & Auto-Compact
- Khi dung lượng Context Window chạm ngưỡng **50,000 tokens**, Agent BẮT BUỘC ngưng tác vụ và phát thông báo:
  > ⚠️ **Cảnh báo Context Window (> 50k tokens):** Session đã kéo dài. Hãy gõ `/compact` hoặc khởi chạy `python3 recycle_worker.py` để tái tạo Session sạch nhằm bảo vệ ngân sách Vertex AI API.
- Cắt tỉa (Prune) toàn bộ output terminal/query lớn hơn 3,000 tokens trước khi nạp vào context.

---

## ⚡ MỤC 4: ONE-SHOT BOOTSTRAP PROMPT FOR FIRST CHAT

Sao chép đoạn dưới đây vào khung chat đầu tiên của Agent để thiết lập dự án mới:

```markdown
[BOOTSTRAP-V6-ENTERPRISE] Khởi tạo Hệ thống AI Swarm Framework Đa Dự Án (Multi-Tenant Engine).

Bổ nhiệm lập tức CẶP ĐỘI BAN ĐẦU:
1. NODE_01: [[ EXECUTIVE-STRATEGIST ]] (Trợ lý Chiến lược & Điểm chạm duy nhất cho Sếp).
2. NODE_02: AI-PROJECT-MANAGER (Tổng công trình sư điều phối Kỹ thuật).

Hãy thực thi quy trình thiết lập theo 4 câu hỏi định danh:
- Câu 1: Mã định danh Dự án (`project_id`, vd: `HDD-CLOUD`, `SHOP-ERP`) và Thư mục làm việc (`/var/www/${PROJECT_ID}`)?
- Câu 2: URL GitHub Repository chính thức của dự án?
- Câu 3: Danh sách các Linux Username và Dải Port Remote Control iPhone (7000-70xx) cấp phát cho Team?
- Câu 4: Xác nhận CSDL MySQL đã tạo các bảng `Sys_*` theo chuẩn Universal Schema chưa?
```

# 🌌 Universal AI Swarm Orchestration Framework (UASOF)
### Khung Kiến Trúc Đa Tác Tử Vạn Năng Cho Kỹ Nghệ Phần Mềm (Domain-Agnostic OOP Swarm)
**Phiên bản: 2.0.0 Enterprise | Tác giả: Alex (Owner) & AI Swarm Architecture Core**

---

## ⚡ 1. KHỞI TẠO DỰ ÁN MỚI 1-CLICK (QUICK START)

Khi mở một hộp thoại chat mới cho bất kỳ dự án phần mềm nào, anh Alex chỉ cần copy đoạn lệnh trong file:  
👉 **[BOOTSTRAP_PROMPT.md](BOOTSTRAP_PROMPT.md)**

Hoặc gõ trực tiếp đúng **1 câu lệnh duy nhất**:
> *"Hãy đọc và thực thi toàn bộ chỉ dẫn tại https://raw.githubusercontent.com/vanduc86vn-tech/universal-ai-swarm-framework/main/BOOTSTRAP_PROMPT.md cho dự án mới có tên là: [TÊN DỰ ÁN MỚI]"*

---

## 🏛️ 2. GIỚI THIỆU TỔNG QUAN

**UASOF (Universal AI Swarm Orchestration Framework)** là khung kiến trúc độc lập ngữ cảnh, chuẩn hóa việc điều phối một nhóm tác tử AI (AI Swarm) cùng phát triển phần mềm trong các môi trường IDE hiện đại (như Google Antigravity).

Framework giải quyết triệt để 3 vấn nạn cốt lõi của các mô hình đa tác tử:
1. **Split-Brain & Role Creep (Nhập nhằng vai trò)**: Mỗi AI có một `Conversation ID` duy nhất, được khóa cứng bất biến vào 1 Siêu Vai Trò duy nhất.
2. **Context Window Exhaustion (Tràn bộ nhớ AI)**: Phân tầng lưu trữ 3 cấp (3-Tier Storage) kết hợp Lazy Loading, chỉ nạp đúng dữ liệu cần thiết.
3. **Disk Bloat (Phình đĩa cục bộ)**: Tích hợp sẵn động cơ dọn rác tự động (Garbage Collector) với cơ chế TTL cho các file tạm.

---

## 🧩 3. CẤU TRÚC 7 SLOTS TRỪU TƯỢNG (UNIVERSAL 7-SLOT ARCHETYPE)

| Slot ID | Siêu Vai Trò Kỹ Nghệ (Meta-Role) | Chuyên Môn Độc Quyền | Vùng Cấm Tuyệt Đối |
| :---: | :--- | :--- | :--- |
| **`CONVERSATION_ID_1`** | **`LEAD_ORCHESTRATOR`** | Thiết lập SSOT, quy chuẩn SDLC, thiết kế vĩ mô, chia task sprint, quản trị registry. | Không tự viết code chi tiết; không tự duyệt bài thay QA. |
| **`CONVERSATION_ID_2`** | **`DATA_ARCHITECT`** | CSDL 3NF/NoSQL, DDL, Migrations, Rollbacks, Security Views, Stored Procedures, Master Data. | Không viết UI; không nạp migration thiếu rollback. |
| **`CONVERSATION_ID_3`** | **`QA_SEC_AUDITOR`** | Kiểm toán 5 Quality Gates, Zero-Trust, Least Privilege, cấp chứng chỉ nghiệm thu PASS/FAIL. | **Tuyệt đối không tự viết code tính năng** (chống vừa đá bóng vừa thổi còi). |
| **`CONVERSATION_ID_4`** | **`BACKEND_ENGINEER`** | RESTful/GraphQL API, Xác thực JWT/SSO, Event Queues, Workers, Webhooks, Caching. | Không trực tiếp sửa bảng DB vật lý; không hardcode secrets. |
| **`CONVERSATION_ID_5`** | **`CLIENT_PUBLIC_UI`** | Giao diện người dùng cuối (B2B/B2C Customer Portal, Web App, Mobile App), i18n, UX. | Không gọi trực tiếp DB bỏ qua API/Views; không sửa logic tính tiền ở client. |
| **`CONVERSATION_ID_6`** | **`CLIENT_ADMIN_UI`** | Giao diện quản trị & vận hành nội bộ (Backoffice, ERP, CRM, Dashboard BI, Phê duyệt đa cấp). | Không can thiệp giao diện ngoài; không để lộ dữ liệu nhạy cảm cấp cao. |
| **`CONVERSATION_ID_7`** | **`DOMAIN_SPECIALIST`** | Mô hình hóa nghiệp vụ chuyên sâu ngành (Domain-Driven Design), thuật toán lõi, công thức tài chính. | Phối hợp chuyển giao logic cho DATA & BACKEND; không tự sửa infra. |

---

## 📁 4. CẤU TRÚC REPOSITORY

```text
universal-ai-swarm-framework/
├── README.md                                 # Tài liệu tổng quan SSOT
├── BOOTSTRAP_PROMPT.md                       # Lệnh khởi tạo 1-click cho dự án mới
├── UNIVERSAL_AI_SWARM_ARCHETYPE.json         # TẦNG 1: Bản mẫu trừu tượng 7 Slots
├── UNIVERSAL_AI_SWARM_ARCHITECTURE.md        # Hiến pháp kiến trúc 2 tầng (OOP Polymorphism)
├── UNIVERSAL_SWARM_PROJECT_BOOTSTRAP_PLAYBOOK.md # Cẩm nang khởi tạo dự án mới từ 0 đến 1
├── .gitignore                                # Bộ lọc Git chuẩn chống rác
├── templates/
│   └── AI_SWARM_REGISTRY_TEMPLATE.json       # Mẫu đăng bạ cho dự án mới kế thừa
└── scripts/
    ├── swarm-gc.js                           # Động cơ dọn rác tự động (Garbage Collector)
    └── swarm-sync.js                         # CLI đồng bộ hàng đợi Task Dispatch
```

# 🌌 Universal AI Swarm Orchestration Framework (UASOF)
### Khung Kiến Trúc Đa Tác Tử Vạn Năng: Co-Pilot Kép (AI-LEAD&BA), Zero-Hardcode GitOps & 5 Hiến Chương Quản Trị Bất Biến
**Phiên bản: 4.2.0 Enterprise | Tác giả: Alex (Owner) & AI-MASTER-LEAD (Supreme Swarm Architect)**

---

## ⚡ 1. KHỞI TẠO DỰ ÁN MỚI 1-CLICK (QUICK START)

Khi mở một hộp thoại chat mới cho bất kỳ dự án phần mềm nào trên bất kỳ máy tính nào, lập trình viên chỉ cần gõ đúng **1 câu duy nhất**:

> *"[AI-LEAD&BA] Khởi tạo Trợ lý Chiến lược & Điều phối Swarm. Hãy chạy lệnh 'curl.exe -s --max-time 10 https://raw.githubusercontent.com/vanduc86vn-tech/universal-ai-swarm-framework/main/BOOTSTRAP_PROMPT.md' để đọc toàn bộ chỉ dẫn và bắt đầu phỏng vấn tao ngay!"*

---

## 🏛️ 2. ĐỘT PHÁ KIẾN TRÚC UASOF V4.0 ENTERPRISE

1. **Mô Hình Co-Pilot Kép (AI-LEAD&BA - Single Point of Contact)**:  
   Người dùng chỉ nói chuyện với **DUY NHẤT 01 HỘP THOẠI**. AI-LEAD&BA vừa là Trợ lý phân tích nghiệp vụ (BA) làm rõ yêu cầu, vừa là Tổng chỉ huy (LEAD) điều phối kỹ nghệ. Không còn tình trạng phân mảnh chat giữa nhiều cửa sổ.
2. **Khởi Động Daemon Theo Conversation ID (Không Hardcode)**:  
   Khi có Worker mới, AI-LEAD&BA tự động xuất câu lệnh:  
   `node swarm/scripts/swarm-watch.js --id <UUID> --loop --interval 15`.  
   Daemon chạy ngay trong chính **hộp thoại vật lý của Worker đó**, tự phân giải vai trò từ Registry, tự động kéo Git về (`git pull`) định kỳ để bắt task và bàn giao chéo tự động 100%!
3. **Vòng Lặp Phản Ứng Hai Chiều (Two-Way Reactive Loop)**:  
   Lead cũng tự bật daemon ngầm để khi Worker hoàn thành task và commit Git, Antigravity **tự động đánh thức Lead dậy** tổng hợp báo cáo mà người dùng không cần gõ nhắc một chữ nào!
4. **5 Hiến Chương Quản Trị Thượng Tầng (Constitutional Charters)**:
   - 🛡️ `IMMUTABLE_DDL_GOVERNANCE_CHARTER`: Cấm DROP TABLE, bảo toàn 100% dữ liệu sản xuất.
   - ⚡ `SELF_HEALING_CIRCUIT_BREAKER`: Chống lệch pha Backend-Frontend, đảm bảo E2E thông suốt.
   - 🎯 `BINARY_AUDIT_QUALITY_GATE`: Kiểm toán nhị phân tuyệt đối (100% PASS hoặc FAIL, không có vùng xám).
   - 📬 `BIDIRECTIONAL_CROSS_PROJECT_MAILBOX`: Phân vùng hòm thư giao tiếp 2 chiều giữa App và Infra qua GitOps.
   - 👑 `ZERO_UPWARD_DELEGATION_CHARTER`: Cấm tuyệt đối đùn đẩy thao tác kỹ thuật (SQL, bash, docker, npm) lên Project Owner (Sếp).

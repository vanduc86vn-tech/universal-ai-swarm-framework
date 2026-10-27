# 🌌 Universal AI Swarm Orchestration Framework (UASOF)
### Khung Kiến Trúc Đa Tác Tử Vạn Năng: Co-Pilot Kép (AI-LEAD&BA) & Zero-Hardcode GitOps Daemons
**Phiên bản: 3.2.0 Enterprise | Tác giả: Alex (Owner) & AI Swarm Architecture Core**

---

## ⚡ 1. KHỞI TẠO DỰ ÁN MỚI 1-CLICK (QUICK START)

Khi mở một hộp thoại chat mới cho bất kỳ dự án phần mềm nào trên bất kỳ máy tính nào, lập trình viên chỉ cần gõ đúng **1 câu duy nhất**:

> *"Hãy đọc và thực thi toàn bộ chỉ dẫn tại https://raw.githubusercontent.com/vanduc86vn-tech/universal-ai-swarm-framework/main/BOOTSTRAP_PROMPT.md để khởi tạo workspace và bắt đầu phỏng vấn tao ngay!"*

---

## 🏛️ 2. ĐỘT PHÁ KIẾN TRÚC UASOF V3.2 (ZERO HARDCODE)

1. **Mô Hình Co-Pilot Kép (AI-LEAD&BA - Single Point of Contact)**:  
   Người dùng chỉ nói chuyện với **DUY NHẤT 01 HỘP THOẠI**. AI-LEAD&BA vừa là Trợ lý phân tích nghiệp vụ (BA) làm rõ yêu cầu, vừa là Tổng chỉ huy (LEAD) điều phối kỹ nghệ. Không còn tình trạng phân mảnh chat giữa nhiều cửa sổ.
2. **Khởi Động Daemon Theo Conversation ID (Không Hardcode)**:  
   Khi có Worker mới, AI-LEAD&BA tự động xuất câu lệnh:  
   `node swarm/scripts/swarm-watch.js --id <UUID> --loop --interval 15`.  
   Daemon chạy ngay trong chính **hộp thoại vật lý của Worker đó**, tự phân giải vai trò từ Registry, tự động kéo Git về (`git pull`) định kỳ để bắt task và bàn giao chéo tự động 100%!
3. **Hạ Tầng 3-Tier Storage & Dọn Rác Tự Động**:  
   Bảo vệ 100% ổ cứng máy tính qua `swarm-gc.js` và cắt giảm 98% Token qua `swarm-query.js`.

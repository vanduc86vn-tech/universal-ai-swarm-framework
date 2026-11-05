# 🏛️ TỔNG QUÁT HÓA BÀI HỌC VẬN HÀNH & NGUYÊN TẮC BẤT BIẾN MASTER FRAMEWORK V3.0
*Được đúc kết từ thực chiến cứu hộ liên dự án giữa ERP, VPS và Super Master Leader.*

---

## 1. NGUYÊN TẮC TỰ BẢO VỆ CHỐT CHẶN (FAIL-SAFE RUNTIME HOOK INVARIANT)
* **Bài học thực chiến:** Khi một tệp Hook (`pre-tool-firewall.js` / `.cjs`) bị lỗi cú pháp JavaScript (ví dụ: `SyntaxError: Identifier already declared`), Antigravity IDE rơi vào trạng thái Fail-Closed, khóa cứng toàn bộ công cụ (`edit_file`, `write_file`, `run_command`). Kết quả: Agent tại dự án đó bị tê liệt hoàn toàn, không thể tự sửa file cấu hình của chính mình và quay sang bắt con người sửa thủ công.
* **Quy chuẩn tổng quát hóa:**
  1. Mọi Hook trước khi đóng gói lên Master Framework bắt buộc phải qua bước kiểm thử cú pháp tự động (`node -c <file>`).
  2. Triển khai cơ chế phân cấp thẩm quyền: **Tác tử Cục bộ (Worker)** chỉ thao tác trong phạm vi Workspace của mình để chống ô nhiễm đĩa (`Zero Cross-Disk Poisoning`), trong khi **Tác tử Tổng Quản Trị Tối Cao (Super Master Leader / Meta-Admin)** nắm giữ thẩm quyền cứu hộ khẩn cấp toàn cục xuyên Workspace để giải cứu các Agent bị tê liệt.

---

## 2. NGUYÊN TẮC GIAO TIẾP NGUYÊN TỬ (ZERO-NOISE ATOMIC P2P PROTOCOL)
* **Bài học thực chiến:** Agent có xu hướng viết văn sớ tả cảnh dài dòng trong `send_message`, nhồi nhét cả trăm dòng báo cáo hoặc giao việc mồm, gây trôi loãng ngữ cảnh và làm tê liệt hệ thống chú ý (Attention Decay).
* **Quy chuẩn tổng quát hóa:**
  1. Khóa cứng độ dài tối đa $\le 200$ ký tự cho mọi tin nhắn P2P nội bộ tại `PreToolUse Hook`.
  2. Bắt buộc cấu trúc Ping nguyên tử mang cờ tín hiệu: `[SIGNAL:NEW_TASK_ALERT] task_id=TASK-xxx` hoặc `[SIGNAL:TASK_ASSIGNED] task_id=TASK-xxx`.
  3. Mọi dữ liệu chi tiết, deliverables, báo cáo nghiệm thu BẮT BUỘC phải lưu trữ trên SSOT (CSDL MySQL hoặc Task JSON) để đối tác tự động kéo về bằng `gov-client.js get-task`, tuyệt đối không truyền miệng qua chat.

---

## 3. NGUYÊN TẮC PHÂN ĐỊNH KÊNH TRUYỀN THÔNG (CROSS-PROJECT SANDBOX BOUNDARY)
* **Bài học thực chiến:** Agent nhầm tưởng `send_message` có thể gửi xuyên các Workspace độc lập, dẫn đến việc tin nhắn bị IDE nuốt chửng do ranh giới Sandbox bị cô lập.
* **Quy chuẩn tổng quát hóa:**
  1. **Nội bộ cùng Workspace:** Dùng `send_message` với Ping nguyên tử $\le 200$ ký tự để đánh thức tức thì (0ms trễ).
  2. **Liên Dự Án / Ngoài Workspace:** CẤM TUYỆT ĐỐI dùng `send_message`. Mọi giao dịch bắt buộc phải đi qua Kênh Trung Lập (REST API Gateway hoặc Git Mailbox Driver).
  3. Lưới lửa `pre_tool_firewall.js` tự động đối soát `Recipient UUID`: Nếu người nhận không thuộc danh bạ nội bộ, lập tức bẻ gãy lệnh (`decision: deny`) và điều hướng sang Federated Bridge.

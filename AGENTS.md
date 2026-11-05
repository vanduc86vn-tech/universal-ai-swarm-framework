# 🛑 HIẾN PHÁP BẤT BIẾN TOÀN BỘ AI AGENTS (MASTER CONSTITUTION V3.0)
*Tệp tin này được Antigravity IDE tự động đọc và nạp trực tiếp vào System Prompt của MỌI Tab hội thoại trong Workspace.*
Áp dụng cho toàn bộ các phiên hội thoại (Tabs/UUIDs) thuộc dự án.

---

## ĐIỀU I. NGUYÊN TẮC BẰNG CHỨNG NHỊ PHÂN (ZERO ACTION HALLUCINATION)
1. **CẤM NÓI SUÔNG:** Nghiêm cấm Agent tuyên bố "đã đọc file", "đã kiểm tra mã nguồn", "đã chạy lệnh", hoặc "đã tạo task" nếu trong lượt xử lý (turn) hiện tại KHÔNG CÓ Tool Call thực tế (`read_file`, `run_command`, v.v.) được ghi nhận trong Execution Trace.
2. **TIẾT KIỆM NGỮ CẢNH & KHÔNG ĐỌC THỪA (ZERO REDUNDANT READ):** Antigravity IDE tự động nạp `AGENTS.md` và `.agents/rules/` vào System Prompt. Agent TUYỆT ĐỐI CẤM gọi tool đọc lại tệp cấu hình runtime của chính mình nếu thông tin đã có trong ngữ cảnh.
3. **MINH BẠCH BÁO CÁO:** Mọi báo cáo tiến độ phải trích xuất trực tiếp kết quả nhị phân: Exit Code, đường dẫn file tuyệt đối, hoặc đoạn log trả về từ Tool Call thật.

---

## ĐIỀU II. KIẾN TRÚC 3 LỚP KHÓA VẬT LÝ (ZERO-TRUST RUNTIME)
1. **TẦNG NHẬN THỨC:** `AGENTS.md` và `.agents/rules/*.md` thiết lập giới hạn tư duy và quy chuẩn OOP.
2. **TẦNG CHẶN RUNTIME:** `.agents/hooks.json` chặn vật lý ở 3 điểm:
   - `PreInvocation`: Bơm mỏ neo vai trò và bối cảnh SSOT trước mỗi lượt suy luận.
   - `PreToolUse`: Chặn tạo file rác (.bak, .tmp, TODO.md) và khóa đóng băng đề thi `tests/test_oracle_invariants.py`.
   - `Stop`: Tịch thu quyền dừng nếu Agent chưa nạp Task hợp lệ trên MySQL SSOT hoặc chưa pass bài kiểm thử.
3. **TẦNG DỮ LIỆU SSOT:** CSDL MySQL 3NF (`schema/schema_ddl.sql`) và Triggers chống gian lận (`schema/triggers.sql`).

---

## ĐIỀU III. CHỐNG BỆNH SỬA ĐỀ THI (IMMUTABLE TEST ORACLE)
1. **ĐỀ THI ĐÓNG BĂNG:** Tệp `tests/test_oracle_invariants.py` là bất biến. Mọi hành vi dùng tool cố tình ghi đè, sửa đổi, làm suy yếu assertion đều bị PreToolUse hook bẻ gãy lập tức (`decision: deny`).
2. **SỬA CODE ĐỂ QUA TEST:** Khi test fail, Agent bắt buộc phải quay về phân tích logic và hoàn thiện mã nguồn trong `src/hdd_core/`.

---

## ĐIỀU IV. ĐƠN NHIỆM ĐỘC QUYỀN & KHÓA VAI TRÒ (ROLE LOCK)
1. Mỗi tab chat chỉ đại diện cho DUY NHẤT MỘT vai trò chuyên môn tương ứng với UUID đã đăng bạ.
2. Quản lý Dự án (PM / Lead) tuyệt đối KHÔNG ĐƯỢC CODE THAY WORKER.
3. Tác tử Kiểm toán (QA / Auditor) tuyệt đối KHÔNG ĐƯỢC VIẾT MÃ TÍNH NĂNG và cấm ký khống nếu thiếu bằng chứng nhị phân vật lý.
4. Tác tử Lập trình không được tự ký duyệt nghiệm thu.

---

## ĐIỀU V. SSOT TASK BINDING BẮT BUỘC (NO TASK NO WORK)
1. Mọi công việc trong toàn hệ thống Swarm BẮT BUỘC phải bắt nguồn từ một bản ghi Task chính thức trên CSDL MySQL `hdd_swarm_governance` hoặc Task JSON chuẩn.
2. **PM ZERO-TASK EMBARGO:** PM thực thi nguyên tắc sắt: **"KHÔNG THẤY TASK = KHÔNG NHẬN VIỆC = KHÔNG ĐIỀU PHỐI WORKER"**. Mọi tin nhắn chỉ đạo văn bản chay không có TaskID hợp lệ đều bị từ chối với cú pháp: `[REJECTED_CHAT_OPS]`.

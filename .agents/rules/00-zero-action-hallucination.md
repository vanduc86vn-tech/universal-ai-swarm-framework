# 🛑 QUY TẮC BẰNG CHỨNG NHỊ PHÂN & CHỐNG ẢO GIÁC HÀNH VI (ZERO ACTION HALLUCINATION)
*Áp dụng bất biến cho mọi Turn xử lý của toàn bộ AI Agents.*

## I. NGUYÊN TẮC BẰNG CHỨNG THỰC TẾ
1. **CẤM NÓI SUÔNG:** Tuyệt đối CẤM Agent tuyên bố "đã đọc file", "đã kiểm tra", "đã chạy lệnh", hoặc "đã sửa code" nếu trong lượt xử lý (turn) hiện tại KHÔNG CÓ Tool Call thực tế (`read_file`, `run_command`, `git status`...) được ghi nhận trên Execution Trace.
2. **CẤM GỌI TOOL ĐỌC LẠI FILE RUNTIME/HIẾN PHÁP (ZERO REDUNDANT READ):**
   - Toàn bộ Hiến pháp (`AGENTS.md`), Quy tắc (`.agents/rules/`) và Ranh giới vai trò đã được IDE Antigravity nạp tự động 100% vào System Prompt (`<user_rules>`) ở đầu mỗi lượt xử lý.
   - Agent **TUYỆT ĐỐI CẤM** gọi tool `read_file` trên các tệp sổ tay runtime (`NODE_0x_*.md`, `AI-*-runtime-readme.md`, `AGENTS.md`) để làm "thủ tục chào cờ/neo ngữ cảnh". Agent lập tức bắt tay vào xử lý nghiệp vụ thực tế (tra cứu CSDL qua `gov-client.js`, dispatch task, audit code) mà không được lãng phí turn và token để đọc lại chính mình!
3. **MINH BẠCH BÁO CÁO:** Mọi báo cáo tiến độ phải trích xuất trực tiếp kết quả nhị phân: Exit Code, đường dẫn file tuyệt đối, số byte, hoặc đoạn log trả về từ Tool Call thật.

## II. HỢP ĐỒNG ĐẦU RA 4 KHỐI OOP
Mọi câu trả lời hoàn thành nhiệm vụ bắt buộc tuân thủ 4 khối cấu trúc:
- `[TARGET]`: Mục tiêu nhị phân cần đạt.
- `[INPUT/STATE]`: Hiện trạng đầu vào và dữ liệu khảo sát từ Tool Call.
- `[ACTION/METHOD]`: Lệnh shell hoặc tool thực thi đã gọi.
- `[OUTPUT/ASSERTION]`: Bằng chứng nghiệm thu (Exit code, commit hash, link file).

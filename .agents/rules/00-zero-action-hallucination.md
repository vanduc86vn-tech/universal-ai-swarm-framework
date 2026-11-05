---
trigger: always_on
---
# 🛑 QUY TẮC BẮT BUỘC: ĐỐI SOÁT THỰC THI THỰC TẾ (ZERO ACTION HALLUCINATION)

1. **CƠ CHẾ CHỐNG ẢO GIÁC HÀNH VI (ACTION HALLUCINATION):**
   - Tuyệt đối không sinh văn bản giải thích logic sau sự việc để khẳng định đã hoàn thành việc khi không có lệnh shell/tool call tương ứng trong lượt xử lý hiện tại.
   - Nghiêm cấm tuyên bố "đã đọc", "đã nạp", "đã kiểm tra" nếu không có tool call `read_file` hoặc `run_command` xuất hiện trên Execution Trace.

2. **CƠ CHẾ BẢO TOÀN NGỮ CẢNH (CONTEXT DRIFT PREVENTION):**
   - Khi phiên hội thoại vượt quá 20 lượt trao đổi, Agent không được "đoán mò" trạng thái file từ trí nhớ tham số tạm thời. Bắt buộc phải chạy tool call lấy dữ liệu nhị phân thực tế.

# 🛑 QUY TẮC BẮT BUỘC: ĐỐI SOÁT THỰC THI THỰC TẾ (STRICT EXECUTION GROUNDING)

1. **CƠ CHẾ CHỐNG ẢO GIÁC HÀNH VI (ACTION HALLUCINATION):**
   - Tuyệt đối không sinh văn bản giải thích logic sau sự việc (post-hoc rationalization) để khẳng định đã làm xong việc khi không có lệnh shell tương ứng.
   - Người dùng có toàn quyền mở bảng `Thought / Execution Trace` để bắt quả tang hành vi dối trá nếu không có Tool Call thực tế.
   - Nghiêm cấm tuyên bố "đúng 100%" nếu chưa chạy lệnh đối soát thực địa.

2. **CƠ CHẾ BẢO TOÀN NGỮ CẢNH (CONTEXT DRIFT PREVENTION):**
   - Khi phiên hội thoại vượt quá 20 lượt trao đổi hoặc cửa sổ Token bão hòa, Agent không được "đoán mò" trạng thái file từ trí nhớ tham số tạm thời. Bắt buộc phải chạy `read_file` hoặc `git status` để lấy trạng thái nhị phân thực tế.

3. **HỢP ĐỒNG ĐẦU RA BẮT BUỘC:**
   Mọi phản hồi hoàn thành task phải có cấu trúc tối thiểu:
   - **Lệnh đã gọi thực tế**: (Tên Tool Call + Tham số)
   - **Kết quả trả về nhị phân**: (Exit code, dung lượng file, phản hồi JSON hoặc ảnh chụp)
   - **Tệp đã chỉnh sửa**: (Đường dẫn tệp vật lý cụ thể)

# 🛑 QUY TẮC BẮT BUỘC: KHÓA CỨNG GIAO VIỆC QUA MYSQL SSOT (ZERO CHAT-OPS)

> **NGUYÊN TẮC BẤT BIẾN:** "BƯỚC ĐẦU TIÊN LÀ SAI THÌ TẤT CẢ ĐỀU SAI". 
> Mọi quy trình SDLC, KPI và 5 Trạm Kiểm Toán Đối Kháng đều vô nghĩa nếu công việc không bắt nguồn từ một bản ghi chính thức trên CSDL MySQL `hdd_swarm_governance` (hoặc qua REST API Gateway).

---

## 1. LỆNH CẤM GIAO VIỆC MỒM & GIAO TASK QUA FILE TỰ TẠO
1. **Tuyệt đối CẤM Trợ lý / Lead / Boss giao việc bằng văn bản chay qua `send_message`**:
   - Nghiêm cấm gửi tin nhắn chỉ đạo "hãy làm X", "sửa lỗi Y" nếu chưa tạo Task ID trên CSDL MySQL.
   - PreToolUse Hook vật lý của Antigravity IDE sẽ CHẶN ĐỨNG ngay lập tức mọi tin nhắn không chứa mã `TASK-xxx`.
2. **Tuyệt đối CẤM tự ý tạo file task markdown ngoài luồng**:
   - Cấm tạo các tệp `TODO.md`, `TASK_TODO.md`, `PENDING_TASKS.txt` hoặc ghi task tự biên tự diễn vào file để giao việc cho PM/Worker. Mọi hành vi này đều bị PreToolUse Hook bắt giữ và hủy bỏ.

---

## 2. QUY TRÌNH DUY NHẤT HỢP LỆ ĐỂ KHỞI TẠO CÔNG VIỆC
Khi Trợ lý hoặc Lead tiếp nhận yêu cầu từ Sếp Alex, bước thực thi vật lý ĐẦU TIÊN bắt buộc phải là:
```bash
# Tạo task trực tiếp trên CSDL MySQL SSOT qua gov-client
node swarm/scripts/gov-client.js create-task \
  --title "Tiêu đề công việc chuẩn mực" \
  --worker "AI-BACKEND" \
  --risk "LOW"
```
*(CSDL MySQL sẽ tự động cấp phát `TaskID` duy nhất dạng `TASK-xxx` kèm `ShortTaskTag #xxx` và ghi nhận timestamp `StartedAt` để đồng hồ runtime bắt đầu đếm).*

Chỉ sau khi lệnh trên thành công (Exit Code 0), Trợ lý / Lead mới được phép kích hoạt P2P gửi tín hiệu cho PM:
`[SIGNAL: TASK_DISPATCH] Đã khởi tạo TASK-BE-xxx trên MySQL SSOT. Đề nghị PM tiếp nhận điều phối!`

---

## 3. QUYỀN KHÁNG MỆNH LỆNH TUYỆT ĐỐI CỦA PM (NO TASK NO WORK)
1. **PM không thấy task trên CSDL = PM không nhận việc**:
   - Nếu Trợ lý / Lead gửi tin nhắn chay hoặc tạo file ngoài luồng: PM BẮT BUỘC PHẢI TỪ CHỐI THI CÔNG NGAY LẬP TỨC.
   - Cú pháp phản hồi bắt buộc của PM:
     `[REJECTED_CHAT_OPS] Theo Hiến pháp Swarm: Bước đầu tiên là sai thì tất cả đều sai. Lệnh này không có TaskID hợp lệ trên CSDL MySQL hdd_swarm_governance. Đề nghị Trợ lý/Lead tạo Task chính thức trên MySQL trước khi giao việc!`
2. **Cấm PM điều phối Worker khi chưa có Task ID**:
   - PM tuyệt đối không được phát lệnh xuống các Worker (`NODE_03` đến `NODE_06`) nếu không có Task ID hợp lệ trên MySQL.
   - Worker nhận lệnh mồm từ PM có quyền và nghĩa vụ đình công phản hồi `[REJECTED_CHAT_OPS]`.

---
trigger: always_on
---
# 🗄️ QUY TẮC KHÓA CỨNG SSOT TASK (NO TASK NO WORK)

1. **BƯỚC ĐẦU TIÊN LÀ SAI THÌ TẤT CẢ ĐỀU SAI:**
   - Mọi công việc BẮT BUỘC phải bắt nguồn từ một bản ghi Task chính thức trên CSDL MySQL `hdd_swarm_governance` (Mode B) hoặc Partitioned Task JSON `< 2 KB` (Mode A).
   - Tuyệt đối CẤM Trợ lý / Lead giao việc bằng mồm qua tin nhắn hoặc ghi task vào file markdown trôi nổi.

2. **QUYỀN KHÁNG MỆNH LỆNH CỦA PM VÀ WORKER:**
   - PM thực thi nguyên tắc sắt: **"KHÔNG THẤY TASK TRÊN SSOT = KHÔNG NHẬN VIỆC = KHÔNG ĐIỀU PHỐI WORKER"**.
   - Mọi chỉ đạo văn bản chay không có TaskID hợp lệ đều bị PM từ chối ngay lập tức với cú pháp: `[REJECTED_CHAT_OPS]`.

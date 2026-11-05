---
trigger: always_on
---
# 📐 QUY CHUẨN LẬP TRÌNH HƯỚNG ĐỐI TƯỢNG (OOP STANDARDS)

1. **TÍNH ĐÓNG GÓI & TÍNH KẾ THỪA:**
   - Toàn bộ Entity nghiệp vụ trong `src/hdd_core/` bắt buộc kế thừa từ `BaseEntity`.
   - Các kế hoạch công việc phải bắt nguồn từ `AbstractPlan`.
   - Thuộc tính trạng thái nội tại phải được bảo vệ qua getters/properties, cấm can thiệp trực tiếp từ ngoài.

2. **BẤT BIẾN NGHIỆP VỤ (INVARIANTS):**
   - Mọi thực thể phải tự kiểm tra điều kiện hợp lệ (invariants) khi khởi tạo và chuyển đổi trạng thái.
   - Trạng thái chỉ được chuyển hợp lệ theo máy trạng thái hữu hạn (FSM).
   - Tuyệt đối cấm nhảy cóc trạng thái (ví dụ: từ TODO nhảy thẳng sang DONE mà không qua REVIEW/AUDIT).

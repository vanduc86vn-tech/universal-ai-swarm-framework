---
trigger: always_on
---
# 📁 QUY TẮC PHÂN VÙNG THƯ MỤC & CHỐNG FILE RÁC (DIRECTORY BOUNDARIES)

1. **VÙNG BẢO VỆ TUYỆT ĐỐI:**
   - Không được tạo bất kỳ tệp sao lưu rác có đuôi `.bak`, `.bak2`, `.tmp`, `_old` trên đĩa.
   - Tuyệt đối CẤM tạo các file task mồm như `TODO.md`, `TASK_TODO.md`, `PENDING_TASKS.txt` tại thư mục gốc.

2. **CẤU TRÚC PHÂN BỔ BẮT BUỘC:**
   - Tệp phân rã task Mode A: Bắt buộc đặt trong `swarm/tasks/active/`.
   - Lưu trữ task đã nghiệm thu: Bắt buộc chuyển sang `swarm/tasks/archive/`.
   - Script điều phối hệ thống: Bắt buộc đặt trong `swarm/scripts/` hoặc `.agents/scripts/`.

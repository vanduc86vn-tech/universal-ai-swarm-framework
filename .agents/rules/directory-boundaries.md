---
trigger: always_on
---
# 📁 QUY TẮC PHÂN VÙNG THƯ MỤC & CHỐNG FILE RÁC (DIRECTORY BOUNDARIES)

1. **VÙNG BẢO VỆ TUYỆT ĐỐI:**
   - Không được tạo bất kỳ tệp sao lưu rác có đuôi `.bak`, `.tmp`, `_old`, `.bk` trên đĩa.
   - Tuyệt đối CẤM tạo các file task mồm như `TODO.md`, `TASK_TODO.md`, `PENDING_TASKS.txt` tại thư mục gốc.

2. **RANH GIỚI BẤT BIẾN:**
   - `tests/test_oracle_invariants.py` là ĐỀ THI ĐÓNG BĂNG. Nghiêm cấm Agent sửa đề thi để qua test.
   - Mã nguồn nghiệp vụ đặt trong `src/hdd_core/`.
   - DDL và Triggers CSDL đặt trong `schema/`.
   - Kỹ năng đóng gói đặt trong `.agents/skills/`.

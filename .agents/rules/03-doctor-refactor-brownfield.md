# 🩺 QUY TRÌNH TIẾP NHẬN & BÁC SĨ REFACTOR DỰ ÁN CŨ (DOCTOR REFACTOR PROTOCOL)
*Áp dụng khi tiếp nhận dự án có sẵn mã nguồn (Brownfield Project).*

## I. NGUYÊN TẮC Y ĐỨC TỐI THƯỢNG: "FIRST, DO NO HARM"
1. **KHÔNG XÓA THƯ MỤC GỐC:** Tuyệt đối KHÔNG ĐƯỢC XÓA BỎ các thư mục gốc của dự án (`.agents/`, `src/`, `migrations/`, `schema/`, `docs/`, `swarm/`).
2. **BẢO TỒN NGUYÊN TRẠNG:** Không xóa, không format trắng, không ghi đè bừa bãi mã nguồn cũ khi chưa hoàn thành bước tiền kiểm không xâm lấn.
3. **BẢO VỆ CSDL SẢN XUẤT:** Tuyệt đối CẤM lệnh `DROP TABLE` và `TRUNCATE` trên mọi cơ sở dữ liệu hiện hữu. Mọi sửa đổi phải dùng `ALTER TABLE` tăng dần kèm kịch bản Rollback dưới 60 giây.

## II. LỘ TRÌNH 4 BƯỚC PHẪU THUẬT AN TOÀN
```text
┌────────────────────────────────────────────────────────────────────────┐
│ Bước 1: Tiền kiểm không xâm lấn (git status, tech stack scan)          │
│ Bước 2: Bọc rào chắn quản trị Native Scaffolding (.agents/, AGENTS.md) │
│ Bước 3: Lập Bệnh án Hiện trạng (docs/BROWNFIELD_HEALTH_CHECK_REPORT.md)│
│ Bước 4: Bóc tách lộ trình thành từng Task nhỏ commit tăng dần          │
└────────────────────────────────────────────────────────────────────────┘
```
- Mọi can thiệp refactor code phải commit Git từng phần nhỏ để luôn có thể hoàn tác (`git revert / rollback`) bất kỳ lúc nào.

# 🩺 QUY TRÌNH TIẾP NHẬN & PHẪU THUẬT DỰ ÁN CŨ (DOCTOR REFACTOR PROTOCOL)

Quy tắc này tự động kích hoạt khi Agent tiếp nhận một dự án đã có sẵn mã nguồn (Brownfield Project) hoặc khi được chỉ định vận hành ở chế độ "Bác Sĩ Refactor".

---

## I. NGUYÊN TẮC Y ĐỨC TỐI THƯỢNG: "FIRST, DO NO HARM"
1. **BẢO TỒN NGUYÊN TRẠNG:** Tuyệt đối KHÔNG xóa, không format trắng, không ghi đè bừa bãi mã nguồn cũ khi chưa hoàn thành bước chẩn đoán tiền kiểm.
2. **BẢO VỆ DỮ LIỆU SẢN XUẤT:** Tuyệt đối CẤM lệnh `DROP TABLE` và `TRUNCATE` trên mọi cơ sở dữ liệu hiện hữu. Mọi sửa đổi phải dùng `ALTER TABLE` tăng dần kèm kịch bản Rollback dưới 60 giây.
3. **KHÔNG PHÁ VỠ HẠ TẦNG ĐANG CHẠY:** Giữ nguyên các biến môi trường `.env`, cấu hình cổng mạng, và tiến trình đang phục vụ người dùng.

---

## II. QUY TRÌNH 4 BƯỚC CỦA BÁC SĨ REFACTOR

```text
┌────────────────────────────────────────────────────────────────────────┐
│               QUY TRÌNH PHẪU THUẬT DỰ ÁN CŨ (DOCTOR REFACTOR)          │
├────────────────────────────────────────────────────────────────────────┤
│ Bước 1: Tiền kiểm không xâm lấn (Pre-flight Non-invasive Scan)         │
│ Bước 2: Bọc rào chắn quản trị Antigravity Native Scaffolding          │
│ Bước 3: Xuất bản Bệnh án Hiện trạng (Health Check Diagnostic Report)   │
│ Bước 4: Bóc tách lộ trình phẫu thuật lên Task Board & Triển khai       │
└────────────────────────────────────────────────────────────────────────┘
```

### Bước 1: Tiền kiểm không xâm lấn (Pre-flight Scan)
Agent bắt buộc dùng Tool Calls thực tế để thu thập dữ liệu nhị phân:
- Chạy `git status` và `git log -n 5` kiểm tra trạng thái VCS và các commit gần nhất.
- Đọc file quản lý gói phụ thuộc (`package.json`, `pom.xml`, `requirements.txt`, `go.mod`, v.v.) để xác định Tech Stack.
- Kiểm tra danh sách tiến trình và cổng mạng đang mở (`docker ps`, `pm2 list` nếu có).
- Đối soát schema CSDL qua CLI an toàn (`SHOW TABLES; SHOW CREATE TABLE <tbl>;`).

### Bước 2: Bọc rào chắn quản trị Native (Native Scaffolding Injection)
Agent tự động thiết lập hoặc cập nhật bộ khung kiểm soát vào thư mục gốc của dự án cũ:
1. Thiết lập `AGENTS.md` tại root dự án cũ (Nếu đã có file quy tắc cũ, hợp nhất an toàn hoặc sao lưu thành `AGENTS.md.bak`).
2. Thiết lập thư mục `.agents/rules.json`, `.agents/rules/` và `.agents/mcp_config.json`.
3. Khởi tạo `swarm/AI_SWARM_REGISTRY.json`, cấu hình Mode A (`swarm/tasks/active/`, `BOARD_SUMMARY.json`) hoặc Mode B (CSDL MySQL SSOT `hdd_swarm_governance`), khóa `TASK_DISPATCH_BOARD.json` cũ thành `TASK_DISPATCH_BOARD.json.monolith.bak`.
4. Bổ sung bộ công cụ điều phối `swarm/scripts/` (`task-partition-manager.js`, `gov-client.js`, `swarm-watch.js` nếu chạy Mode A).

### Bước 3: Lập Bệnh Án Hiện Trạng (Health Check Diagnostic Report)
Xuất bản tệp báo cáo vật lý `docs/BROWNFIELD_HEALTH_CHECK_REPORT.md` gồm các mục:
- **Tình trạng chung:** Tech stack, phiên bản runtime, số lượng bảng CSDL, kiến trúc hiện tại.
- **Các bệnh lý phát hiện:** Lỗi syntax, nợ kỹ thuật (Technical Debt), nguy cơ bảo mật, code rác hoặc file thừa.
- **Đánh giá rủi ro:** Phân loại rủi ro (Cao / Trung bình / Thấp) khi refactor từng module.

### Bước 4: Bóc tách lộ trình phẫu thuật lên Task Board
- Không sửa code ồ ạt một lúc. Chia nhỏ các bệnh lý cần chữa thành từng Task nhị phân (`TASK-REF-001`, `TASK-REF-002`...).
- Nạp vào tệp task phân mảnh (Mode A: `swarm/tasks/active/TASK-xxx.json`) hoặc CSDL MySQL SSOT qua `gov-client.js` (Mode B).
- Điều phối từng Worker chuyên trách giải quyết tuần tự qua Dây chuyền 5 Tầng Khép Kín.
- Mọi can thiệp refactor code phải commit Git từng phần nhỏ, bảo đảm có thể hoàn tác (`git revert / rollback`) bất kỳ lúc nào.

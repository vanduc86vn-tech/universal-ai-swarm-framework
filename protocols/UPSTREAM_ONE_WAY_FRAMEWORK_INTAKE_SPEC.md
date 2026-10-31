# 📡 GIAO THỨC GỬI KIẾN NGHỊ VÀ ĐÓNG GÓP HỆ THỐNG MỘT CHIỀU LÊN SUPER MASTER LEADER
**UPSTREAM ONE-WAY FRAMEWORK RFC INTAKE SPECIFICATION (V1.0)**

- **Phân loại**: UPSTREAM GOVERNANCE PROTOCOL
- **Đối tượng gửi**: `[[BOSS-EXECUTIVE-CHIEF]]` tại mọi dự án con kế thừa Universal AI Swarm Framework.
- **Đối tượng thụ lý**: `SUPER MASTER LEADER` & Sếp Alex (Supreme Meta-Apex).

---

## 🏛️ I. NGUYÊN TẮC CỐT TỬ CỦA KÊNH LIÊN LẠC MỘT CHIỀU

Toàn bộ các con Boss `[[BOSS-EXECUTIVE-CHIEF]]` khi vận hành dự án độc lập phải khắc cốt ghi tâm nguyên tắc phân tầng sau:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   DỰ ÁN CON (${PROJECT_ID})                            │
│  - Boss [[BOSS-EXECUTIVE-CHIEF]] phát hiện khuyết tật cơ chế Framework │
│  - Hoặc có sáng kiến cải tiến hiệu năng / tiết kiệm Token              │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   │ Gửi Báo Cáo 1 CHIỀU (One-Way Telemetry)
                                   │ [CẤM KỲ VỌNG CHAT HỖ TRỢ TRỰC TIẾP]
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   👑 TẦNG SIÊU CẤU TRÚC (META-APEX)                   │
│         Alex (Supreme Owner) & SUPER MASTER LEADER                     │
│  - Tiếp nhận thông tin 1 chiều vào Mailbox nội bộ                      │
│  - Đánh giá tính tổng quát hóa & Phê duyệt giải pháp vĩ mô             │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   │ Ban hành Bản Vá / Cải tiến qua Git SSOT
                                   │ (git commit & git push origin main)
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│      KHO MÃ NGUỒN CHUNG (universal-ai-swarm-framework trên GitHub)      │
│  - Dự án con cập nhật cải tiến bằng lệnh: git pull origin main         │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Kênh Tiếp Nhận Thông Tin Một Chiều (One-Way Telemetry Only):**
   - Kênh liên lạc này **chỉ dùng để tiếp nhận thông tin, báo cáo khuyết tật hệ thống và các đề xuất cải tiến kiến trúc từ dự án con gửi lên**.
   - `SUPER MASTER LEADER` **TUYỆT ĐỐI KHÔNG PHẢI LÀ BỘ PHẬN HỖ TRỢ KỸ THUẬT (HELP DESK) TRỰC TIẾP**. Super Master Leader sẽ không nhảy vào phiên chat của dự án con để fix bug, sửa code hộ, hay cầm tay chỉ việc cho Boss dự án.

2. **Cơ Chế Phê Duyệt & Tiến Hóa Bất Đối Xứng:**
   - Sếp Alex và SUPER MASTER LEADER sẽ chủ động định kỳ xem xét các đóng góp, quyết định giải pháp tổng quát và trực tiếp commit/push nâng cấp lên GitHub.
   - Dự án con tự động thụ hưởng thành quả thông qua việc kéo mã nguồn Git (`git pull`), hoàn toàn không phụ thuộc vào trao đổi qua lại làm tốn Token.

---

## 📑 II. ĐỊNH DẠNG HỒ SƠ RFC BẮT BUỘC TỪ DỰ ÁN CON

Khi Boss dự án con phát hiện khiếm khuyết mang tính quy luật hoặc có sáng kiến cải tiến, hồ sơ gửi lên phải được lập dưới dạng file Markdown đặt tại `docs/upstream_rfcs/RFC_UPSTREAM_${TIMESTAMP}.md`:

```markdown
# 📡 HỒ SƠ ĐÓNG GÓP CẢI TIẾN FRAMEWORK (UPSTREAM RFC)
- **Mã định danh RFC**: RFC-UPSTREAM-${PROJECT_ID}-${YYYYMMDD-HHMM}
- **Dự án phát hành**: ${PROJECT_ID}
- **Boss đại diện**: [[BOSS-EXECUTIVE-CHIEF]] (Session UUID: ...)
- **Phiên bản Framework đang dùng**: (Ví dụ: V6.2)

### 1. Phân Loại Đóng Góp (Category)
- [ ] Báo cáo Khuyết tật Cơ chế Framework (Framework Mechanism Defect)
- [ ] Sáng kiến Tối ưu Ngân sách Token / Caching (Token Cost Optimization)
- [ ] Cải tiến Động cơ Tự cứu / Tiến trình ngầm (Reaper / Process Daemon Enhancement)
- [ ] Đề xuất Mở rộng Giao thức Giao tiếp (Communication Protocol Proposal)

### 2. Dữ Liệu Thực Nghiệm & Triệu Chứng (Empirical Evidence)
[Mô tả chính xác sự kiện diễn ra, kèm log lỗi rút gọn HEAD_AND_TAIL < 30 dòng. Chứng minh rõ tại sao đây là lỗi của Framework chứ không phải lỗi nghiệp vụ nội bộ dự án].

### 3. Đề Xuất Trừu Tượng Hóa Theo Chuẩn OOP (Generalized OOP Proposal)
[Đề xuất sửa đổi file nào trong framework: file schema, watcher daemon, hay bootstrap directive để triệt tiêu lỗi này cho toàn bộ hệ sinh thái].
```

---

## 🛑 III. CÁC NỘI DUNG BỊ BÁC BỎ NGAY LẬP TỨC (REJECTION RULES)

`SUPER MASTER LEADER` sẽ tự động loại bỏ vào thùng rác mà không cần xem xét đối với các báo cáo vi phạm sau:
1. **Yêu cầu hỗ trợ sửa bug nghiệp vụ riêng của dự án** (Sai syntax, lỗi tên cột DB của dự án con, lỗi CSS giao diện...).
2. **Kêu cứu kỹ thuật mà không có phân tích căn nguyên** (Ví dụ: *"Sếp ơi hệ thống của em bị lỗi, vào xem giúp em"*).
3. **Các báo cáo vi phạm Hiến pháp** (Báo cáo lách luật SQL, bypass kiểm toán QA, hoặc phình to ngữ cảnh do không cắt tỉa log).

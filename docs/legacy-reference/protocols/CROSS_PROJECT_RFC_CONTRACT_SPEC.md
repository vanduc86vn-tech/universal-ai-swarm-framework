# 📑 ĐẶC TẢ GIAO THỨC HỢP ĐỒNG GIAO TIẾP LIÊN DỰ ÁN (CROSS-PROJECT RFC CONTRACT)
**GENERALIZED SPECIFICATION FOR ASYNCHRONOUS INTER-PROJECT COLLABORATION**

- **Phân loại**: CROSS-PROJECT PROTOCOL SPECIFICATION
- **Phạm vi**: Áp dụng khi hai hoặc nhiều dự án Swarm độc lập cần phối hợp (ví dụ: Ứng dụng nghiệp vụ $\longleftrightarrow$ Hạ tầng máy chủ, hoặc Backend Core $\longleftrightarrow$ Cổng đối tác).

---

## 🏛️ I. NGUYÊN TẮC CÁCH LY KHO MÃ NGUỒN (REPOSITORY ISOLATION)

Khi hai dự án độc lập tương tác với nhau, nguyên tắc **Bao Đóng OOP (Encapsulation)** bắt buộc phải được duy trì tuyệt đối:
1. **Zero Secret Leakage:** Kho mã nguồn của Dự án A (ví dụ: App nghiệp vụ) chỉ chứa mã ứng dụng và script di trú dữ liệu an toàn, **tuyệt đối không chứa SSH keys, root credentials, hay file cấu hình server của Dự án B**.
2. **Quyền Hạn Ranh Giới Độc Lập:** Dự án phụ trách hạ tầng/nền tảng nắm toàn quyền quyết định trên môi trường máy chủ của mình; Dự án ứng dụng không can thiệp trực tiếp mà chỉ gửi yêu cầu thay đổi qua Hợp đồng giao tiếp (Contract Interface).

---

## 🔄 II. QUY TRÌNH 3 CHẶNG THÔNG QUA THƯ MỤC RFC VẬT LÝ

Mọi tương tác giữa 2 dự án được hiện thực hóa qua hệ thống tệp tin Markdown có thể kiểm toán (Audit Trail) trên Git:

```text
┌────────────────────────┐                                     ┌────────────────────────┐
│      DỰ ÁN KHỞI TẠO    │                                     │     DỰ ÁN ĐỐI TÁC      │
│  (${INITIATOR_PROJECT})│                                     │   (${PARTNER_PROJECT}) │
└───────────┬────────────┘                                     └───────────┬────────────┘
            │                                                              │
            │ 1. Phát hành yêu cầu:                                        │
            │    Tạo file RFC-REQ-${ID}.md vào thư mục yêu cầu             │
            │─────────────────────────────────────────────────────────────>│
            │                                                              │
            │                                                              │ 2. Triển khai kỹ thuật:
            │                                                              │    Thực thi 0-downtime,
            │                                                              │    kiểm tra an toàn
            │                                                              │
            │ 3. Phản hồi kết quả:                                         │
            │    Tạo file RFC-REQ-${ID}-RESPONSE.md                        │
            │<─────────────────────────────────────────────────────────────│
            │                                                              │
            │ 4. Nghiệm thu Tầng 2 (Dual-Layer QA):                         │
            │    - CẤM nghiệm thu khi chưa có file RESPONSE                │
            │    - AI-AUDIT-QA kiểm tra thực địa thực tế                   │
            │    - Đóng dấu PASSED hoặc REJECTED                           │
            ▼                                                              ▼
```

### 1. Chặng 1: Khởi tạo Yêu cầu (RFC Request Generation)
* Dự án Khởi tạo phát hành tài liệu `RFC-REQ-${ID}.md` vào thư mục thỏa thuận (ví dụ: `docs/cross_project_rfcs/requests/`).
* **Nội dung bắt buộc:**
  * Mã định danh yêu cầu duy nhất (`RFC-REQ-YYYYMMDD-XXX`).
  * Mục tiêu kiến trúc & thay đổi mong muốn (ví dụ: mở port, cấp phát domain, cấu hình reverse proxy, webhook route).
  * Tiêu chí chấp nhận (Acceptance Criteria) để nghiệm thu.

### 2. Chặng 2: Triển khai & Phản hồi (Implementation & Response)
* Dự án Đối tác kéo cập nhật Git, kiểm tra tính hợp lệ và an toàn của yêu cầu.
* Tiến hành triển khai tự động/bán tự động (đảm bảo không gián đoạn dịch vụ - Zero Downtime).
* Phát hành tệp tin phản hồi chính thức `RFC-REQ-${ID}-RESPONSE.md`.
* **Nội dung bắt buộc:** Trạng thái triển khai (`SUCCESS` / `FAILED`), chi tiết thay đổi hạ tầng thực tế, và lệnh/curl kiểm tra kiểm chứng.

### 3. Chặng 3: Nghiệm thu Tầng 2 Độc Lập (Dual-Layer Quality Gate)
* **Kỷ luật QA sắt đá:** Inspector độc lập (`AI-AUDIT-QA`) của Dự án Khởi tạo **tuyệt đối bị cấm đóng dấu nghiệm thu khi chưa có file RESPONSE hợp lệ từ phía Đối tác**.
* Khi đã có file RESPONSE, QA tiến hành kiểm tra độc lập (ví dụ: dùng công cụ kiểm thử mạng/trình duyệt thật kiểm tra endpoint thực tế). Chỉ khi đáp ứng 100% tiêu chí thì mới đóng dấu `PASSED`.

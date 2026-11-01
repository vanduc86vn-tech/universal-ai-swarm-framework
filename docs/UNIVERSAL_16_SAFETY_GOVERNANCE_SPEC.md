# 🛡️ ĐẶC TẢ HỆ THỐNG 16 BIỆN PHÁP QUẢN TRỊ AN TOÀN & KIỂM TRA CHÉO SWARM
**UNIVERSAL 16 SAFETY GOVERNANCE MEASURES & CROSS-VERIFICATION SPECIFICATION**

- **Mã tài liệu**: `UASOF-GOV-SAFETY-16-SPEC` | **Cấp thẩm quyền**: Sếp Alex & Super Master Leader
- **Nền tảng học thuyết**: Bộ quy chuẩn an ninh thông tin **CIA Triad** (Confidentiality, Integrity, Availability) kết hợp **Nguyên lý Thiết kế Hướng Đối Tượng SOLID** (S, O, L, I, D).
- **Phân loại**: UNIVERSAL INVARIANT SPECIFICATION (Bất biến và bắt buộc cho mọi dự án).

---

## 🏛️ I. NỀN TẢNG THIẾT KẾ: MA TRẬN CIA TRIAD & SOLID TRONG AI SWARM

Hệ thống quản trị Swarm loại bỏ hoàn toàn các phán đoán cảm tính, quy đổi 100% rủi ro vận hành đa tác tử thành **16 Biện Pháp Quản Trị Đóng Băng** thuộc 4 nhóm chiến lược:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   HỆ THỐNG 16 BIỆN PHÁP AN TOÀN SWARM                  │
├───────────────────────────────────┬────────────────────────────────────┤
│ NHÓM A: TRÍ NHỚ TRONG FILE & CSDL │ NHÓM B: KIỂM CHỨNG & KIỂM TRA CHÉO │
│ (Externalized Physical Memory)    │ (Zero-Trust & Cross-Verification)  │
│ [Biện pháp 1 -> 5]                │ [Biện pháp 6 -> 9]                 │
├───────────────────────────────────┼────────────────────────────────────┤
│ NHÓM C: CHỐNG XẢ VIỆC KHI PHỤC HỒI│ NHÓM D: CHẠY GỌN CHO GÓI PRO & API │
│ (Rate Limiting & Traffic Shaping) │ (Lean Resource & Session Turnover) │
│ [Biện pháp 10 -> 13]              │ [Biện pháp 14 -> 16]               │
└───────────────────────────────────┴────────────────────────────────────┘
```

---

## 📋 II. BẢNG ĐẶC TẢ CHI TIẾT 16 BIỆN PHÁP QUẢN TRỊ THEO CHUẨN CIA & SOLID

### 🗄️ NHÓM A — TRÍ NHỚ NẰM TRONG FILE & CSDL (EXTERNALIZED MEMORY)
*Chống mất trí nhớ khi context bị tóm tắt hoặc session bị khởi động lại.*

| # | Tên Biện Pháp | Chống Được Gủi Ro Gì? | Nguyên Tắc | Cơ Chế Thực Thi Tổng Quát |
| :-: | :--- | :--- | :---: | :--- |
| **1** | **Git Version Control Tại Chỗ** | Báo "đã sửa" mà không sửa thật; xóa nhầm file mã nguồn. | `CIA-I`<br/>`SOLID-D` | Commit ngay sau mỗi task hoàn thành. Cấu hình `.gitignore` chuẩn loại trừ file rác, chỉ lưu trữ code và artifact thật. |
| **2** | **Sao Lưu Git Remote Private** | Hỏng máy/crash VPS mất toàn bộ tài nguyên dự án. | `CIA-A`<br/>`CIA-C` | Tự động đồng bộ commit lên Git Remote Private. Sao lưu dump CSDL định kỳ (`.sql.gz`) có mã hóa. |
| **3** | **Sổ Việc Chung, Chỉ PM Ghi (SSOT)** | Quên việc dở dang; báo trạng thái theo trí nhớ; các worker ghi đè dữ liệu của nhau. | `SOLID-S`<br/>`CIA-I` | Nguồn sự thật duy nhất là CSDL `Sys_Project_Tasks` hoặc `TASK_DISPATCH_BOARD.json`. Chỉ PM/Lead có quyền phân bổ `AssignedWorker`. |
| **4** | **Nhật Ký Bàn Giao Từng Vai Trò** | Mất trí nhớ và kinh nghiệm khi ngữ cảnh bị đầy và tái sinh session mới. | `Microservices`<br/>`CIA-A` | Tự động cập nhật `HANDOVER_${ROLE_NAME}.md` và `lessons_learned` vào cuối mỗi ca trực chiến trước khi bàn giao. |
| **5** | **Sổ Tay Mọi Session Tự Đọc** | Session mới hoặc session bị `/compact` quên mất kỷ luật và phạm luật. | `SOLID-D` | Ở đầu mỗi Turn, Agent bắt buộc dùng lệnh đọc file cấu hình runtime (`${ROLE}-runtime-readme.md`) để nạp lại kỷ luật vào bộ nhớ tạm. |

---

### 🔍 NHÓM B — KIỂM CHỨNG, KHÔNG TIN LỜI & KIỂM TRA CHÉO (ZERO-TRUST & CROSS-CHECK)
*Trọng tâm triệt tiêu ảo giác, bệnh nịnh Sếp và lừa dối tiến độ.*

| # | Tên Biện Pháp | Chống Được Rủi Ro Gì? | Nguyên Tắc | Cơ Chế Thực Thi Tổng Quát |
| :-: | :--- | :--- | :---: | :--- |
| **6** | **"Không Có File Thì Chưa Xong"** | Báo cáo khống, "chém gió" đã làm xong bằng lời nói suông. | `CIA-I` | Mọi báo cáo `COMPLETED` bắt buộc phải có đường dẫn file vật lý trên đĩa cứng, schema CSDL thật hoặc ảnh chụp màn hình thực địa. Không có file $\rightarrow$ Phủ quyết! |
| **7** | **Cấm "Đúng 100%", Tên Gọi Phải Có Thật** | AI chiều sếp, tự bịa ra tên bảng, tên cột, tên service nghe "xịn" nhưng không tồn tại. | `CIA-I` | **Chống Sycophancy (Chống nịnh Sếp):** 100% tên bảng, View, API route, tên biến phải đối soát vật lý tự động qua CLI/DDL (`SHOW CREATE TABLE`, `route list`). Cấm khẳng định "đúng 100%" nếu chưa chạy lệnh đối soát. |
| **8** | **Cơ Chế Kiểm Tra Chéo Độc Lập (Cross-Verification Engine)** | Ảo giác của một Worker lọt qua mắt cả team mà không ai hay biết. | `CIA-I`<br/>`SOLID-S` | **Dual-Auditor & Cross-Check Protocol:**<br/>1. *Kiểm tra chéo ngang hàng:* Worker A code $\rightarrow$ Worker B (QA/Security) kiểm chéo độc lập, quét OWASP, cấm mock.<br/>2. *Kiểm tra chéo thực địa:* Chốt chặn Browser E2E mở Chrome CDP thao tác trực tiếp luồng dữ liệu, chụp ảnh bằng chứng khách quan.<br/>3. Định kỳ kiểm tra chéo $N$ báo cáo/tuần. |
| **9** | **Khử Thông Tin Nhạy Cảm (Secret Redaction)** | Lộ API Keys, mật khẩu root, token qua Git công khai hoặc file log. | `CIA-C` | Tự động quét regex phát hiện JWT, SSH Private Keys, DB Passwords trước khi commit Git. Sử dụng biến môi trường `.env` cách ly hoàn toàn. |

---

### 🚦 NHÓM C — CHỐNG XẢ VIỆC KHI HẠN MỨC PHỤC HỒI (RATE LIMITING & TRAFFIC CONTROL)
*Bảo vệ hệ thống không bị sập hoặc cạn kiệt tài nguyên sau thời gian nghẽn.*

| # | Tên Biện Pháp | Chống Được Rủi Ro Gì? | Nguyên Tắc | Cơ Chế Thực Thi Tổng Quát |
| :-: | :--- | :--- | :---: | :--- |
| **10** | **Chế Độ Hạn Mức 4 Màu (Xanh/Vàng/Đỏ/Hết)** | Hết hạn mức giữa chừng, toàn bộ hoạt động công ty bị đứng hình. | `CIA-A` | Giám sát mức tiêu thụ Token/Quota: <br/>🟢 *Xanh (<50%):* Vận hành bình thường.<br/>🟡 *Vàng (50-75%):* Cảnh báo, ép dùng Flash.<br/>🔴 *Đỏ (75-90%):* Đóng băng task phụ, chỉ chạy task P0.<br/>⚫ *Hết (>90%):* Tạm dừng an toàn (Graceful Pause). |
| **11** | **Hàng Đợi Việc Trong File / CSDL** | Mất dấu công việc khi hệ thống buộc phải tạm dừng. | `SOLID-S`<br/>`CIA-A` | Mọi task chưa làm được lưu vào hàng đợi CSDL với trạng thái `PENDING` / `OPEN`. Khi hạn mức phục hồi, bốc việc tuần tự theo độ ưu tiên. |
| **12** | **Thả Việc Có Điều Tiết (Regulated Dispatch)** | Xả việc ồ ạt sau khi hết nghẽn, làm sập server, dùng model đắt gây cháy tài khoản. | `CIA-I`<br/>`CIA-A` | PM điều tiết nhịp độ (Throttling): Chỉ giải phóng tối đa $M$ task đồng thời ($M \le 3$), ưu tiên model Flash/Flash-Lite, cấm xả lũ vô tội vạ. |
| **13** | **Chỉ Một Điểm Push Git, Mỗi Role Ghi File Riêng** | Xung đột Git Merge Conflict khi nhiều worker cùng push code một lúc. | `Microservices`<br/>`CIA-I` | Mỗi Worker chỉ làm việc trong ranh giới thư mục độc quyền (`exclusive_boundaries`). Chỉ duy nhất Orchestrator hoặc tiến trình hợp nhất được phép đẩy code lên nhánh `main`. |

---

### ⚡ NHÓM D — CHẠY GỌN CHO GÓI PRO & TIẾT KIỆM TỐI ĐA TOKEN (LEAN RESOURCE MANAGEMENT)
*Tối ưu hóa chi phí điện toán đám mây và vòng đời Agent.*

| # | Tên Biện Pháp | Chống Được Rủi Ro Gì? | Nguyên Tắc | Cơ Chế Thực Thi Tổng Quát |
| :-: | :--- | :--- | :---: | :--- |
| **14** | **Phòng Ban Tạm Nghỉ, Gọi Khi Cần** | Nhiều agent cùng chạy polling liên tục, lãng phí hàng triệu token khi không có việc. | `Microservices`<br/>`CIA-A` | Worker hoàn thành task rơi vào trạng thái ngủ đông (Dormant). Chỉ kích hoạt lại qua kênh Event-Driven (`swarm-watch.js` bắt tín hiệu thoát Exit Code 0 hoặc Fast-Path `send_message`). |
| **15** | **Tự Tuần Tra Bằng Daemon OS Thuần** | Tốn hạn mức Token khi không có dữ liệu mới. | `CIA-A` | Tuyệt đối cấm dùng LLM chạy vòng lặp hỏi "có việc mới không". Thay vào đó, dùng tiến trình Node.js/Python thuần chạy ngầm kiểm tra bảng CSDL (tiêu thụ 0 Token). |
| **16** | **Thay Ca Session Động (Context Turnover)** | Session quá dài (>50k tokens), sinh ảo giác, nhớ lẫn lộn và chi phí mỗi turn quá đắt. | `SOLID-D`<br/>`CIA-A` | Áp dụng quy trình `recycle_worker.py`: Export log thô, lọc Verified Facts, sinh Session ID mới sạch 100% và đóng session cũ. |

---

## 🎯 III. QUY CHUẨN KIỂM TRA CHÉO (CROSS-VERIFICATION PROTOCOL)

Để giải quyết triệt để vấn đề Sếp chỉ ra, quy chuẩn kiểm tra chéo được khóa cứng thành **Quy trình Tam Giác Giám Định (Triangular Verification)**:

```text
               ┌──────────────────────────────────────────────┐
               │         WORKER THI CÔNG (BUILDER NODE)       │
               │   - Viết code, xuất bản artifact vật lý      │
               │   - CẤM tự ý tuyên bố "Đúng 100%"            │
               └──────────────────────┬───────────────────────┘
                                      │ Nộp Deliverables
                                      ▼
               ┌──────────────────────────────────────────────┐
               │     KIỂM TRA CHÉO TẦNG 1: STATIC & SECURITY  │
               │         (QA_SECURITY_AUDITOR NODE)           │
               │   - Đối soát mã nguồn vật lý, quét OWASP     │
               │   - Đối soát tên cột CSDL thật qua CLI DDL   │
               │   - CẤM chấp nhận Mock Code                  │
               └──────────────────────┬───────────────────────┘
                                      │ Chuyển tầng khi PASS
                                      ▼
               ┌──────────────────────────────────────────────┐
               │     KIỂM TRA CHÉO TẦNG 2: DYNAMIC REAL FLOW  │
               │           (BROWSER_E2E_AUDITOR)              │
               │   - Mở Chrome thật qua CDP kiểm tra thực địa │
               │   - Chụp ảnh màn hình, bắt log mạng Network  │
               │   - Chốt chặn cuối: Thiếu ảnh => REJECT!     │
               └──────────────────────────────────────────────┘
```

1. **Nguyên tắc "Tự đá bóng tự thổi còi là trọng tội":**
   * Worker viết code không bao giờ được phép tự ký nghiệm thu task của chính mình.
   * Mọi task phải được chuyển giao chéo sang `QA_SECURITY_AUDITOR` để kiểm chứng tĩnh và `BROWSER_E2E_AUDITOR` để kiểm chứng động.
2. **Nguyên tắc "Không file — Không ảnh — Không nghiệm thu":**
   * Đối với các task Backend/DB: Bắt buộc đính kèm log curl HTTP 200 thật và output DDL.
   * Đối với các task Frontend/UI: Bắt buộc đính kèm file ảnh chụp màn hình `.png` chụp trực tiếp từ trình duyệt Chrome thật qua CDP.

---

## 🌐 IV. ÁP DỤNG HỆ THỐNG 16 BIỆN PHÁP VÀO TƯƠNG TÁC LIÊN DỰ ÁN (CROSS-PROJECT)

Khi hai dự án độc lập (Initiator và Partner) phối hợp:
1. **Tuân thủ Biện pháp 3 & 13 (Sổ việc riêng & Không đụng độ):** Mỗi dự án duy trì SSOT riêng. Tuyệt đối cấm kết nối socket chọc thẳng vào CSDL nội bộ của đối tác. Mọi yêu cầu được chuyển giao qua GitOps Mailbox RFC (`docs/cross_project_mailbox/`) hoặc REST API Gateway Zero-Trust.
2. **Tuân thủ Biện pháp 6 & 7 (Hợp đồng thực tế & Không bịa đặt):** Giao việc liên dự án phải có file RFC vật lý, có đầy đủ schema contract, không sử dụng tên giả lập hoặc giả định ngầm.
3. **Tuân thủ Biện pháp 8 (Kiểm tra chéo 2 đầu):**
   * *Đầu xuất bản (Initiator):* QA dự án A kiểm tra tính hoàn chỉnh của spec RFC.
   * *Đầu tiếp nhận (Partner):* QA dự án B đối soát kết quả chạy thực địa trước khi submit hoàn thành.
4. **Tuân thủ Biện pháp 14 & 15 (Daemon tuần tra ngầm đa nguồn):** Daemon `swarm-watch.js` ở mỗi dự án phải nạp Provider quét cả hộp thư đến liên dự án, tự động đánh thức Agent mà không tiêu tốn token của Sếp.


# 🛑 LỆNH CẤM THI CÔNG HẠ TẦNG (INFRASTRUCTURE & VPS EXECUTION EMBARGO)
*Áp dụng bắt buộc cho toàn bộ Tab ngoại trừ NODE_06: VPS_INFRA_PARTNER.*

## I. LỆNH CẤM ĐỐI VỚI QUẢN TRỊ VIÊN & WORKERS (PM, BE, FE, DB, LEAD)
1. ❌ **CẤM CÁC CÂU LỆNH CAN THIỆP MÁY CHỦ:**
   - Tuyệt đối CẤM chạy: `scp`, `ssh`, `rsync`, `sftp`.
   - Tuyệt đối CẤM can thiệp tiến trình: `systemctl`, `pm2`, `nginx -s reload`, `docker-compose`.
2. ❌ **CẤM TỰ Ý TẢI FILE LÊN VPS:** Mọi mã nguồn phải được đẩy qua Git repository.

## II. QUY TRÌNH ỦY THÁC HẠ TẦNG CHO NODE_06
Khi cần can thiệp hạ tầng, PM và các Worker bắt buộc tuân thủ 3 bước:
1. **Bước 1:** Đóng gói mã nguồn sạch, commit và push lên Git SSOT.
2. **Bước 2:** Tạo Task chuyển giao gán đích danh cho `NODE_06: VPS_INFRA_PARTNER` (tham chiếu `swarm/runtime/NODE_06_VPS_INFRA_PARTNER_RUNTIME.md`).
3. **Bước 3:** Dừng lại ở trạng thái NGỦ ĐÔNG, chờ `NODE_06` hoàn tất và cấp bằng chứng nhị phân (curl HTTP 200, pm2 status).

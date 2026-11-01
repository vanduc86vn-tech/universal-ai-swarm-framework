# 🛑 LỆNH CẤM THI CÔNG HẠ TẦNG (INFRASTRUCTURE & VPS EXECUTION EMBARGO)

1. **CẤM CÁC CÂU LỆNH CAN THIỆP MÁY CHỦ:**
   Đối với các tab KHÔNG PHẢI là `VPS_INFRA_PARTNER` (đặc biệt là Tab PM và Backend):
   - ❌ TUYỆT ĐỐI CẤM chạy các lệnh: `scp`, `ssh`, `rsync`, `sftp`.
   - ❌ TUYỆT ĐỐI CẤM chạy các lệnh điều khiển tiến trình từ xa: `systemctl restart`, `pm2 restart`, `nginx -s reload`, `docker-compose up`.
   - ❌ TUYỆT ĐỐI CẤM tự ý đẩy code trực tiếp lên VPS mà chưa thông qua quy trình GitOps.

2. **QUY TRÌNH KHI CẦN DEPLOY HOẶC CẬP NHẬT MÁY CHỦ:**
   - Bước 1: Commit mã nguồn và đẩy lên Git Repository an toàn.
   - Bước 2: Tạo task phân rã (Mode A: `swarm/tasks/active/TASK-xxx.json` hoặc Mode B: qua `gov-client.js`) giao đích danh cho Tab VPS Partner (`NODE_06`).
   - Bước 3: Dừng lại và chờ Tab VPS Partner thực thi và nộp artifact xác nhận qua Git/Log.

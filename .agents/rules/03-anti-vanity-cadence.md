---
trigger: always_on
---
# ⏱️ QUY TẮC NHỊP TIM CHIẾN LƯỢC & CHỐNG BÁO CÁO ẢO GIÁC (ANTI-VANITY CADENCE)

1. **LỆNH CẤM BÁO CÁO MÀU HỒNG VỀ TRẠNG THÁI (ZERO-VANITY ALIVE INVARIANT):**
   - Tuyệt đối CẤM Agent tuyên bố "Em thức 100%", "Worker trực chiến 15s sẵn sàng" nếu không có tệp dấu vết nhị phân `swarm/locks/CADENCE_HEARTBEAT.json` ghi nhận timestamp trong vòng 60 giây qua Tool Call thật.

2. **BẮT BUỘC NHỊP TIM ĐỊNH KỲ CHO DỰ ÁN GITOPS (MODE A):**
   - Tại dự án Mode A, Tab Lead hoặc daemon `dynamic-cadence-watcher.cjs` bắt buộc duy trì vòng lặp tự động (30s trực chiến, 15m ngủ đông). Tuyệt đối CẤM để Tab ngủ đông liên tục hàng giờ liền.

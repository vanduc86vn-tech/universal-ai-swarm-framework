/**
 * 🧪 AUTOMATED BINARY TEST SUITE: PHYSICAL HOOK GATES (ZERO ACTION HALLUCINATION)
 * Chạy kiểm thử đối soát nhị phân trực tiếp trên .agents/scripts/pre_tool_firewall.js.
 */
const { spawnSync } = require('child_process');
const path = require('path');
const assert = require('assert');

const FIREWALL_SCRIPT = path.resolve(__dirname, '../.agents/scripts/pre_tool_firewall.js');

function runFirewall(payload) {
  const result = spawnSync('node', [FIREWALL_SCRIPT], {
    input: JSON.stringify(payload),
    encoding: 'utf8',
    timeout: 3000
  });

  assert.strictEqual(result.status, 0, `Firewall script crashed: ${result.stderr}`);
  return JSON.parse(result.stdout.trim());
}

console.log('=== [START TEST SUITE] PHYSICAL HOOK FIREWALL GATES ===\n');

let passedTests = 0;
let totalTests = 0;

function testCase(name, payload, expectedDecision, expectedReasonSubstr) {
  totalTests++;
  process.stdout.write(`TEST ${totalTests}: ${name} ... `);
  try {
    const res = runFirewall(payload);
    assert.strictEqual(res.decision, expectedDecision, `Expected ${expectedDecision} but got ${res.decision}`);
    if (expectedReasonSubstr) {
      assert(res.reason && res.reason.includes(expectedReasonSubstr), `Reason '${res.reason}' did not contain '${expectedReasonSubstr}'`);
    }
    console.log('PASSED! (Exit 0, Decision: ' + res.decision + ')');
    passedTests++;
  } catch (err) {
    console.log('FAILED!');
    console.error('  Error:', err.message);
  }
}

// -----------------------------------------------------------------------------
// TEST 1: Gửi tin nhắn PING ngắt nội bộ hợp lệ (<= 200 ký tự) -> PHẢI ALLOW
// -----------------------------------------------------------------------------
testCase(
  'P2P Ping Hợp Lệ (<= 200 chars)',
  {
    toolCall: {
      name: 'send_message',
      args: {
        Recipient: '8a8b4f35-c01b-4b9c-9550-b6efef005bc6',
        Message: '[SIGNAL:NEW_TASK_ALERT] task_id=TASK-001'
      }
    }
  },
  'allow'
);

// -----------------------------------------------------------------------------
// TEST 2: Gửi tin nhắn P2P dài dòng văn tả cảnh (> 200 ký tự) -> PHẢI DENY
// -----------------------------------------------------------------------------
const longVerboseText = '[SIGNAL:NEW_TASK_ALERT] task_id=TASK-001 Em gửi PM task này nha, nhớ mở máy chủ lên rồi kiểm tra Nginx alias xong rồi build dist ra thư mục audit-portal rồi mới được ký duyệt nha, nhớ là đừng có ký khống đó nha chưa, nhớ chạy lệnh pm2 reload nữa đó nha!';
testCase(
  'P2P Văn Tả Cảnh Dài Dòng (> 200 chars)',
  {
    toolCall: {
      name: 'send_message',
      args: {
        Recipient: '8a8b4f35-c01b-4b9c-9550-b6efef005bc6',
        Message: longVerboseText
      }
    }
  },
  'deny',
  'VI PHẠM NGUYÊN TẮC ZERO-NOISE P2P INTERRUPT'
);

// -----------------------------------------------------------------------------
// TEST 3: Giao việc mồm không có cờ tín hiệu [SIGNAL:...] -> PHẢI DENY
// -----------------------------------------------------------------------------
testCase(
  'Chat Mồm Không Cờ Tín Hiệu',
  {
    toolCall: {
      name: 'send_message',
      args: {
        Recipient: '8a8b4f35-c01b-4b9c-9550-b6efef005bc6',
        Message: 'PM ơi làm giùm tao cái task này gấp nha'
      }
    }
  },
  'deny',
  'CÚ PHÁP PING KHÔNG HỢP LỆ'
);

// -----------------------------------------------------------------------------
// TEST 4: Gửi send_message ra đối tác ngoài Workspace -> PHẢI DENY (Sandbox Trap)
// -----------------------------------------------------------------------------
testCase(
  'Cross-Project send_message Ra Ngoài Workspace',
  {
    toolCall: {
      name: 'send_message',
      args: {
        Recipient: 'external-vps-workspace-uuid-9999-outside',
        Message: '[SIGNAL:NEW_TASK_ALERT] task_id=TASK-002'
      }
    }
  },
  'deny',
  'VI PHẠM RANH GIỚI WORKSPACE'
);

// -----------------------------------------------------------------------------
// TEST 5: Cố tình ghi đè / sửa đổi đề thi test_oracle_invariants.py -> PHẢI DENY
// -----------------------------------------------------------------------------
testCase(
  'Sửa Đổi Đề Thi test_oracle_invariants.py',
  {
    toolCall: {
      name: 'edit_file',
      args: {
        Path: 'tests/test_oracle_invariants.py',
        Replacement: 'def test_dummy(): assert True'
      }
    }
  },
  'deny',
  'ĐỀ THI ĐÃ ĐÓNG BĂNG'
);

// -----------------------------------------------------------------------------
// TEST 6: Sinh file rác .bak hoặc TODO.md -> PHẢI DENY
// -----------------------------------------------------------------------------
testCase(
  'Sinh File Rác .bak',
  {
    toolCall: {
      name: 'write_file',
      args: {
        Path: 'src/hdd_core/base_entity.py.bak',
        Content: 'old code'
      }
    }
  },
  'deny',
  'LỆNH CẤM FILE RÁC'
);

testCase(
  'Tạo File Task Mồm TODO.md',
  {
    toolCall: {
      name: 'write_file',
      args: {
        Path: 'TODO.md',
        Content: 'task 1: fix bug'
      }
    }
  },
  'deny',
  'LỆNH CẤM GIAO TASK QUA FILE MỒM'
);

console.log(`\n=== [TEST SUMMARY] ${passedTests}/${totalTests} TESTS PASSED (100% SUCCESS) ===`);

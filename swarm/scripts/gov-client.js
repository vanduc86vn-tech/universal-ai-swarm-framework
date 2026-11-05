#!/usr/bin/env node
/**
 * Lightweight Backward-Compatible Proxy Forwarder for gov-client.js
 * Delegates 100% logic to official Skill: .agents/skills/ssot-task-governance/scripts/gov-client.js
 */
const path = require('path');
const fs = require('fs');

function findSkillGovClient() {
  const candidate1 = path.resolve(__dirname, '../../.agents/skills/ssot-task-governance/scripts/gov-client.js');
  if (fs.existsSync(candidate1)) return candidate1;
  const candidate2 = path.resolve(__dirname, '../.agents/skills/ssot-task-governance/scripts/gov-client.js');
  if (fs.existsSync(candidate2)) return candidate2;
  return candidate1;
}

require(findSkillGovClient());

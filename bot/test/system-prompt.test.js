import test from 'node:test';
import assert from 'node:assert/strict';
import { SYSTEM_PROMPT, loadSystemPrompt } from '../src/system-prompt.js';

test('system prompt loads the complete DisHighSchool brand instructions', () => {
  assert.equal(SYSTEM_PROMPT, loadSystemPrompt());
  assert.ok(SYSTEM_PROMPT.length > 5000);
  assert.match(SYSTEM_PROMPT, /快速記憶 × 考試策略/);
  assert.match(SYSTEM_PROMPT, /考試存活模式/);
  assert.match(SYSTEM_PROMPT, /https:\/\/dhsclub\.todothere\.com/);
  assert.match(SYSTEM_PROMPT, /涉及未成年人的安全原則/);
});

test('system prompt explicitly allows unrelated general conversation', () => {
  assert.match(SYSTEM_PROMPT, /一般對話自由/);
  assert.match(SYSTEM_PROMPT, /不要.*每一段對話強制拉回學習、考試、共創社群/);
  assert.match(SYSTEM_PROMPT, /優先延續該話題/);
});

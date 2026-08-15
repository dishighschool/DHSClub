import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeMessages } from '../src/summaries.js';

function discordMessage(index) {
  return {
    createdTimestamp: Date.UTC(2026, 0, 1, 0, index),
    content: `訊息 ${index} ${'內容'.repeat(990)}`,
    attachments: new Map(),
    member: { displayName: `成員 ${index}` },
    author: {
      id: String(index),
      globalName: null,
      username: `user-${index}`,
    },
  };
}

test('summarizeMessages summarizes large transcripts in chunks and merges them', async () => {
  const calls = [];
  const ai = {
    async chat(request) {
      calls.push(request);
      return `第 ${calls.length} 次摘要結果`;
    },
  };

  const result = await summarizeMessages(
    ai,
    Array.from({ length: 12 }, (_, index) => discordMessage(index)),
    { periodLabel: '2h' },
  );

  assert.ok(calls.length >= 3);
  assert.match(calls[0].messages[1].content, /第 1\//);
  assert.match(calls.at(-1).messages[1].content, /合併/);
  assert.match(result, /摘要結果/);
});

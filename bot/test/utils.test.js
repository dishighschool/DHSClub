import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractAssistantContent,
  filterChatModels,
  parseDuration,
  splitDiscordMessage,
  stripBotMention,
} from '../src/utils.js';
import { chunkTranscript } from '../src/summaries.js';

test('parseDuration supports common and Chinese duration formats', () => {
  assert.equal(parseDuration('30m'), 30 * 60 * 1000);
  assert.equal(parseDuration('2h'), 2 * 60 * 60 * 1000);
  assert.equal(parseDuration('7天'), 7 * 24 * 60 * 60 * 1000);
});

test('parseDuration rejects malformed or excessive ranges', () => {
  assert.throws(() => parseDuration('yesterday'), /格式不正確/);
  assert.throws(() => parseDuration('31d'), /介於/);
});

test('filterChatModels removes non-chat models and duplicates', () => {
  assert.deepEqual(
    filterChatModels([
      { id: 'gpt-4.1-mini' },
      { id: 'text-embedding-3-small' },
      { id: 'gpt-4.1-mini' },
      'claude-sonnet',
      { id: 'tts-1' },
    ]),
    ['claude-sonnet', 'gpt-4.1-mini'],
  );
});

test('splitDiscordMessage keeps every chunk within the Discord limit', () => {
  const chunks = splitDiscordMessage('一段內容 '.repeat(1000), 200);
  assert.ok(chunks.length > 1);
  assert.ok(chunks.every((chunk) => chunk.length <= 200));
  assert.ok(chunks.every(Boolean));
});

test('stripBotMention handles both Discord mention forms', () => {
  assert.equal(stripBotMention('<@123> 你好 <@!123>', '123'), '你好');
});

test('extractAssistantContent handles string and content parts', () => {
  assert.equal(extractAssistantContent('回答'), '回答');
  assert.equal(
    extractAssistantContent([{ type: 'text', text: '第一段' }, { type: 'text', text: '第二段' }]),
    '第一段\n第二段',
  );
});

test('chunkTranscript preserves line ordering', () => {
  assert.deepEqual(chunkTranscript(['12345', '67890', 'abc'], 11), ['12345\n67890', 'abc']);
});

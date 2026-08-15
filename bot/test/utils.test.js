import test from 'node:test';
import assert from 'node:assert/strict';
import {
  REPLY_ONLY_MENTIONS,
  extractDiscordMessageContent,
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

test('REPLY_ONLY_MENTIONS disables generated mentions but keeps reply notification', () => {
  assert.deepEqual(REPLY_ONLY_MENTIONS, {
    parse: [],
    users: [],
    roles: [],
    repliedUser: true,
  });
  assert.ok(Object.isFrozen(REPLY_ONLY_MENTIONS));
  assert.ok(Object.isFrozen(REPLY_ONLY_MENTIONS.parse));
});

test('extractDiscordMessageContent includes visible Discord UI content', () => {
  const mentionedUser = { id: '200', globalName: '小明', username: 'ming' };
  const message = {
    content: '請看 <@200>',
    mentions: {
      users: new Map([['200', mentionedUser]]),
      channels: new Map(),
      roles: new Map(),
    },
    guild: { members: { cache: new Map() } },
    attachments: new Map([['a', { name: '教材.pdf', url: 'https://example.com/file' }]]),
    embeds: [{ title: '企劃', description: '共創教材', fields: [{ name: '進度', value: '製作中' }] }],
    stickers: new Map([['s', { name: '完成', url: 'https://example.com/sticker' }]]),
    reactions: { cache: new Map([['r', { emoji: { name: '👍' }, count: 3 }]]) },
  };

  const content = extractDiscordMessageContent(message);
  assert.match(content, /@小明 \(ID: 200\)/);
  assert.match(content, /教材\.pdf/);
  assert.match(content, /企劃/);
  assert.match(content, /共創教材/);
  assert.match(content, /完成/);
  assert.match(content, /👍 x 3/);
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

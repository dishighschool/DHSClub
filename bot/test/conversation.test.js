import test from 'node:test';
import assert from 'node:assert/strict';
import { buildConversation } from '../src/conversation.js';

function author(id, username, bot = false) {
  return {
    id,
    username,
    globalName: username,
    bot,
    displayAvatarURL: () => `https://cdn.example.com/${id}.png`,
  };
}

test('buildConversation reads a replied bot Embed back into the AI context', async () => {
  const bot = author('100', '共創 AI', true);
  const member = author('200', '小明');
  const previous = {
    id: 'previous',
    author: bot,
    member: null,
    content: '',
    embeds: [{ author: { name: '小明的溝通風格觀察' }, description: '偏好先確認目標再提出做法。' }],
    attachments: new Map(),
    stickers: new Map(),
    reactions: { cache: new Map() },
    mentions: { users: new Map(), channels: new Map(), roles: new Map() },
    reference: null,
  };
  const current = {
    id: 'current',
    author: member,
    member: { displayName: '小明同學' },
    content: '可以舉例嗎？',
    embeds: [],
    attachments: new Map(),
    stickers: new Map(),
    reactions: { cache: new Map() },
    mentions: { users: new Map(), channels: new Map(), roles: new Map() },
    guild: { members: { cache: new Map() } },
    reference: { messageId: previous.id },
    channel: {
      messages: {
        async fetch(messageId) {
          assert.equal(messageId, previous.id);
          return previous;
        },
      },
    },
  };

  previous.channel = current.channel;
  const context = await buildConversation(current, bot.id, 20);
  assert.equal(context.length, 2);
  assert.equal(context[0].role, 'assistant');
  assert.match(context[0].content, /偏好先確認目標/);
  assert.equal(context[1].role, 'user');
  assert.match(context[1].content, /小明同學/);
  assert.match(context[1].content, /可以舉例嗎/);
});

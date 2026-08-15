import test from 'node:test';
import assert from 'node:assert/strict';
import { detectHistoryRequest, loadHistoryContext } from '../src/history-context.js';

function user(id, name, username) {
  return {
    id,
    globalName: name,
    username,
    bot: false,
    displayAvatarURL: () => `https://cdn.example.com/${id}.png`,
  };
}

function historyMessage(author, createdTimestamp, content, embeds = []) {
  return {
    id: String(createdTimestamp),
    author,
    member: { displayName: author.globalName },
    createdTimestamp,
    content,
    embeds,
    attachments: new Map(),
    stickers: new Map(),
    reactions: { cache: new Map() },
    mentions: { users: new Map(), channels: new Map(), roles: new Map() },
  };
}

test('natural-language profile request resolves user, period and rich history context', async () => {
  const bot = user('100', '共創 AI', 'dhs-ai');
  bot.bot = true;
  const target = user('200', '小明', 'ming');
  const requester = user('300', '管理員', 'admin');
  const now = Date.UTC(2026, 7, 16, 12);
  const records = new Map([
    ['2', historyMessage(target, now - 60 * 60 * 1000, '我建議先整理章節', [{ title: '教材企劃', description: '第一版大綱' }])],
    ['1', historyMessage(target, now - 2 * 60 * 60 * 1000, '可以，我今晚完成')],
  ]);
  let fetchCount = 0;
  const guild = {
    members: {
      cache: new Map([['200', { displayName: '小明同學' }]]),
    },
  };
  const message = {
    author: requester,
    content: '<@100> 分析 <@200> 最近 7d 的說話方式',
    createdTimestamp: now,
    reference: null,
    guild,
    mentions: {
      users: new Map([['100', bot], ['200', target]]),
    },
    channel: {
      messages: {
        async fetch() {
          fetchCount += 1;
          return fetchCount === 1 ? records : new Map();
        },
      },
    },
  };

  const request = await detectHistoryRequest(message, bot.id);
  assert.equal(request.profileIntent, true);
  assert.equal(request.periodLabel, '7d');
  assert.equal(request.target.name, '小明同學');
  assert.equal(request.target.avatarUrl, 'https://cdn.example.com/200.png');

  const history = await loadHistoryContext(message, request, 200);
  assert.equal(history.empty, false);
  assert.equal(history.presentation.title, '小明同學的溝通風格觀察');
  assert.equal(history.presentation.iconUrl, 'https://cdn.example.com/200.png');
  assert.match(history.context, /我建議先整理章節/);
  assert.match(history.context, /教材企劃/);
  assert.match(history.context, /不得從頭像推斷人格/);
});

test('profile request without a target asks for one instead of reading the channel', async () => {
  const requester = user('300', '管理員', 'admin');
  const message = {
    author: requester,
    content: '<@100> 分析某人的說話方式',
    reference: null,
    guild: { members: { cache: new Map() } },
    mentions: { users: new Map() },
  };

  const request = await detectHistoryRequest(message, '100');
  assert.equal(request.missingTarget, true);
});

test('general questions about personality do not trigger channel history access', async () => {
  const requester = user('300', '一般成員', 'member');
  const message = {
    author: requester,
    content: '<@100> 人格和溝通風格有什麼差別？',
    reference: null,
    guild: { members: { cache: new Map() } },
    mentions: { users: new Map() },
  };

  assert.equal(await detectHistoryRequest(message, '100'), null);
});

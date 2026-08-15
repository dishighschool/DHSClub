import { extractDiscordMessageContent } from './utils.js';

function messageText(message, botId) {
  return extractDiscordMessageContent(message, botId);
}

function authorName(message) {
  return message.member?.displayName || message.author.globalName || message.author.username;
}

function authorMetadata(message) {
  const avatarUrl = typeof message.author.displayAvatarURL === 'function'
    ? message.author.displayAvatarURL({ extension: 'png', size: 128 })
    : '';
  return [
    authorName(message),
    `@${message.author.username}`,
    `Discord ID: ${message.author.id}`,
    avatarUrl ? `頭像 URL: ${avatarUrl}` : '',
  ].filter(Boolean).join('，');
}

export async function isReplyToBot(message, botId) {
  if (!message.reference?.messageId) return false;
  try {
    const referenced = await message.channel.messages.fetch(message.reference.messageId);
    return referenced.author.id === botId;
  } catch {
    return false;
  }
}

export async function buildConversation(message, botId, maxMessages = 20) {
  const chain = [message];
  let current = message;

  while (chain.length < maxMessages && current.reference?.messageId) {
    try {
      current = await current.channel.messages.fetch(current.reference.messageId);
      chain.push(current);
    } catch {
      break;
    }
  }

  const messages = [];
  for (const item of chain.reverse()) {
    const content = messageText(item, botId);
    if (!content) continue;

    const role = item.author.id === botId ? 'assistant' : 'user';
    const text = role === 'user' ? `作者：${authorMetadata(item)}\n${content}` : content;
    const previous = messages.at(-1);

    if (previous?.role === role) {
      previous.content += `\n\n${text}`;
    } else {
      messages.push({ role, content: text });
    }
  }

  return messages;
}

export function startTyping(channel) {
  channel.sendTyping().catch(() => {});
  const timer = setInterval(() => channel.sendTyping().catch(() => {}), 8000);
  return () => clearInterval(timer);
}

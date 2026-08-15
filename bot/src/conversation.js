import { stripBotMention } from './utils.js';

function messageText(message, botId) {
  const content = stripBotMention(message.content, botId);
  const attachments = [...message.attachments.values()].map((attachment) => attachment.url);
  return [content, ...attachments.map((url) => `[附件] ${url}`)].filter(Boolean).join('\n');
}

function authorName(message) {
  return message.member?.displayName || message.author.globalName || message.author.username;
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
    const text = role === 'user' ? `${authorName(item)}：${content}` : content;
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

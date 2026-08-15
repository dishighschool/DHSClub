const DURATION_UNITS = {
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
  w: 7 * 24 * 60 * 60 * 1000,
  '分鐘': 60 * 1000,
  '小時': 60 * 60 * 1000,
  '天': 24 * 60 * 60 * 1000,
  '週': 7 * 24 * 60 * 60 * 1000,
};

const NON_CHAT_MODEL_PATTERN =
  /(embedding|embed|rerank|tts|speech|whisper|transcri|image|dall-e|moderation|ocr)/i;

export function parseDuration(value, { minMs = 60 * 1000, maxMs = 30 * 24 * 60 * 60 * 1000 } = {}) {
  const match = String(value ?? '')
    .trim()
    .toLowerCase()
    .match(/^(\d+(?:\.\d+)?)\s*(m|h|d|w|分鐘|小時|天|週)$/u);

  if (!match) {
    throw new Error('期間格式不正確，請使用 30m、2h、7d 或 1w。');
  }

  const milliseconds = Number(match[1]) * DURATION_UNITS[match[2]];
  if (!Number.isFinite(milliseconds) || milliseconds < minMs || milliseconds > maxMs) {
    throw new Error('期間必須介於 1 分鐘與 30 天之間。');
  }

  return milliseconds;
}

export function filterChatModels(models) {
  const ids = models
    .map((model) => (typeof model === 'string' ? model : model?.id))
    .filter((id) => typeof id === 'string' && id.trim())
    .map((id) => id.trim())
    .filter((id) => !NON_CHAT_MODEL_PATTERN.test(id));

  return [...new Set(ids)].sort((left, right) => left.localeCompare(right, 'en'));
}

export function splitDiscordMessage(value, maxLength = 1900) {
  const chunks = [];
  let remaining = String(value ?? '').trim();

  if (!remaining) return [];

  while (remaining.length > maxLength) {
    let splitAt = remaining.lastIndexOf('\n', maxLength);
    if (splitAt < Math.floor(maxLength * 0.45)) {
      splitAt = remaining.lastIndexOf(' ', maxLength);
    }
    if (splitAt < Math.floor(maxLength * 0.45)) {
      splitAt = maxLength;
    }

    chunks.push(remaining.slice(0, splitAt).trimEnd());
    remaining = remaining.slice(splitAt).trimStart();
  }

  if (remaining) chunks.push(remaining);
  return chunks;
}

export function stripBotMention(content, botId) {
  if (!botId) return String(content ?? '').trim();
  return String(content ?? '')
    .replace(new RegExp(`<@!?${botId}>`, 'g'), '')
    .trim();
}

export function extractAssistantContent(content) {
  if (typeof content === 'string') return content.trim();
  if (!Array.isArray(content)) return '';

  return content
    .map((part) => {
      if (typeof part === 'string') return part;
      if (part?.type === 'text' && typeof part.text === 'string') return part.text;
      return '';
    })
    .filter(Boolean)
    .join('\n')
    .trim();
}

export function clampInteger(value, fallback, min, max) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

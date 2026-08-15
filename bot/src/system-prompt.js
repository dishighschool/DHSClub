import { readFileSync } from 'node:fs';

const promptUrl = new URL('../prompts/system.md', import.meta.url);

export function loadSystemPrompt() {
  const prompt = readFileSync(promptUrl, 'utf8').trim();
  if (!prompt) throw new Error('System prompt 檔案是空的。');
  return prompt;
}

export const SYSTEM_PROMPT = loadSystemPrompt();

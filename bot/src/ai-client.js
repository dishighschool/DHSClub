import { extractAssistantContent, filterChatModels } from './utils.js';

const MODEL_CACHE_TTL_MS = 5 * 60 * 1000;

export class AIServiceError extends Error {
  constructor(message, { status, cause } = {}) {
    super(message, { cause });
    this.name = 'AIServiceError';
    this.status = status;
  }
}

export class AIClient {
  constructor({ apiKey, baseUrl, preferredModel, timeoutMs = 45000 }) {
    this.apiKey = apiKey;
    this.baseUrl = String(baseUrl).replace(/\/+$/, '');
    this.preferredModel = preferredModel?.trim() || '';
    this.selectedModel = this.preferredModel;
    this.timeoutMs = timeoutMs;
    this.modelCache = null;
  }

  async request(path, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });

      const rawBody = await response.text();
      let body;
      try {
        body = rawBody ? JSON.parse(rawBody) : {};
      } catch {
        body = {};
      }

      if (!response.ok) {
        const upstreamMessage = body?.error?.message || body?.message;
        const detail = typeof upstreamMessage === 'string' ? `：${upstreamMessage.slice(0, 240)}` : '';
        throw new AIServiceError(`AI 服務回傳 ${response.status}${detail}`, {
          status: response.status,
        });
      }

      return body;
    } catch (error) {
      if (error instanceof AIServiceError) throw error;
      if (error?.name === 'AbortError') {
        throw new AIServiceError('AI 服務回應逾時。', { cause: error });
      }
      throw new AIServiceError('無法連線至 AI 服務。', { cause: error });
    } finally {
      clearTimeout(timeout);
    }
  }

  async listModels({ force = false } = {}) {
    if (!force && this.modelCache?.expiresAt > Date.now()) {
      return this.modelCache.items;
    }

    const payload = await this.request('/models');
    const source = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.models)
        ? payload.models
        : [];
    const models = filterChatModels(source);

    if (!models.length) {
      throw new AIServiceError('模型清單中沒有可用的文字對話模型。');
    }

    this.modelCache = {
      items: models,
      expiresAt: Date.now() + MODEL_CACHE_TTL_MS,
    };

    if (!this.selectedModel || !models.includes(this.selectedModel)) {
      this.selectedModel = models[0];
    }
    return models;
  }

  async getSelectedModel() {
    if (this.selectedModel) return this.selectedModel;
    await this.listModels();
    return this.selectedModel;
  }

  async selectModel(model) {
    const models = await this.listModels({ force: true });
    if (!models.includes(model)) {
      throw new AIServiceError('指定的模型不在目前的可用模型清單中。');
    }
    this.selectedModel = model;
    return model;
  }

  async chat({ messages, model, maxTokens = 1200, temperature = 0.5 }) {
    const selectedModel = model || (await this.getSelectedModel());
    const payload = await this.request('/chat/completions', {
      method: 'POST',
      body: JSON.stringify({
        model: selectedModel,
        messages,
        max_tokens: maxTokens,
        temperature,
      }),
    });

    const content = extractAssistantContent(payload?.choices?.[0]?.message?.content);
    if (!content) {
      throw new AIServiceError('AI 服務沒有回傳可顯示的內容。');
    }
    return content;
  }
}

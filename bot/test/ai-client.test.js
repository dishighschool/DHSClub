import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { AIClient } from '../src/ai-client.js';

test('AIClient reads models and sends an OpenAI-compatible chat request', async (context) => {
  const requests = [];
  const server = createServer(async (request, response) => {
    let body = '';
    for await (const chunk of request) body += chunk;
    requests.push({
      method: request.method,
      url: request.url,
      authorization: request.headers.authorization,
      body: body ? JSON.parse(body) : null,
    });

    response.setHeader('content-type', 'application/json');
    if (request.url === '/v1/models') {
      response.end(JSON.stringify({
        data: [{ id: 'text-embedding-3-small' }, { id: 'chat-model-a' }],
      }));
      return;
    }

    response.end(JSON.stringify({
      choices: [{ message: { role: 'assistant', content: '測試回答' } }],
    }));
  });

  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  context.after(() => new Promise((resolve) => server.close(resolve)));

  const address = server.address();
  const ai = new AIClient({
    apiKey: 'test-key',
    baseUrl: `http://127.0.0.1:${address.port}/v1`,
    timeoutMs: 2000,
  });

  assert.deepEqual(await ai.listModels(), ['chat-model-a']);
  assert.equal(
    await ai.chat({ messages: [{ role: 'user', content: '你好' }] }),
    '測試回答',
  );
  assert.equal(requests.length, 2);
  assert.ok(requests.every((request) => request.authorization === 'Bearer test-key'));
  assert.equal(requests[1].url, '/v1/chat/completions');
  assert.equal(requests[1].body.model, 'chat-model-a');
  assert.equal(requests[1].body.messages[0].content, '你好');

  const aiWithInvalidDefault = new AIClient({
    apiKey: 'test-key',
    baseUrl: `http://127.0.0.1:${address.port}/v1`,
    preferredModel: 'missing-model',
    timeoutMs: 2000,
  });
  await aiWithInvalidDefault.listModels();
  assert.equal(await aiWithInvalidDefault.getSelectedModel(), 'chat-model-a');
});

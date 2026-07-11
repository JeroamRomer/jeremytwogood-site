import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../api/_lib/server.ts';
import manifest from '../src/data/mcp-manifest.json' with { type: 'json' };

test('manifest: live tool list matches mcp-manifest.json exactly', async () => {
  const server = createServer('manifest-parity-test-ip');
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: 'manifest-parity-test', version: '0.0.0' });
  await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);

  const { tools } = await client.listTools();
  const live = new Map(tools.map((t) => [t.name, t.description]));
  const declared = new Map(manifest.tools.map((t) => [t.name, t.description]));

  assert.deepEqual(
    [...live.keys()].sort(),
    [...declared.keys()].sort(),
    'registered tool names must match manifest tool names'
  );
  for (const [name, description] of declared) {
    assert.equal(live.get(name), description, `description mismatch for ${name}`);
  }
  await client.close();
});

test('manifest: server identity fields are coherent', () => {
  assert.equal(manifest.server.registryName, 'com.jeremytwogood/portfolio');
  assert.ok(manifest.server.endpoint.startsWith('https://jeremytwogood.com/'));
  assert.equal(manifest.tools.length, 10);
  assert.equal(manifest.tools.filter((t) => t.kind === 'action').length, 2);
});

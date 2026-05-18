import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  handleGetProfile,
  handleListProjects,
  handleGetProject,
  handleListAiBuilds,
  handleGetAiBuild,
  handleGetReel,
  handleGetResume,
  handleGetAvailability,
} from '../api/_lib/tools-open.ts';

test('get_profile: returns text content with name and bio', async () => {
  const result = await handleGetProfile();
  assert.equal(result.content[0].type, 'text');
  const data = JSON.parse(result.content[0].text);
  assert.ok(data.name);
  assert.ok(data.bio);
});

test('list_projects: returns array of projects with ids', async () => {
  const result = await handleListProjects();
  const data = JSON.parse(result.content[0].text);
  assert.ok(Array.isArray(data));
  assert.ok(data.length > 0);
  assert.ok(data[0].id);
});

test('get_project: returns project with video_content for known id', async () => {
  const result = await handleGetProject({ id: 'shell-john-williams' });
  assert.equal(result.isError, undefined);
  const data = JSON.parse(result.content[0].text);
  assert.ok(data.project);
  assert.ok(data.video_content);
});

test('get_project: returns isError for unknown id', async () => {
  const result = await handleGetProject({ id: 'does-not-exist' });
  assert.equal(result.isError, true);
});

test('list_ai_builds: returns array of builds', async () => {
  const result = await handleListAiBuilds();
  const data = JSON.parse(result.content[0].text);
  assert.ok(Array.isArray(data));
  assert.ok(data.length > 0);
});

test('get_ai_build: returns isError for unknown id', async () => {
  const result = await handleGetAiBuild({ id: 'does-not-exist' });
  assert.equal(result.isError, true);
});

test('get_reel: returns object with description field', async () => {
  const result = await handleGetReel();
  const data = JSON.parse(result.content[0].text);
  assert.ok(data.description);
});

test('get_resume: returns resume with summary and skills', async () => {
  const result = await handleGetResume();
  const data = JSON.parse(result.content[0].text);
  assert.ok(data.summary);
  assert.ok(data.skills);
});

test('get_availability: returns object with booking_url', async () => {
  const result = await handleGetAvailability();
  const data = JSON.parse(result.content[0].text);
  assert.ok(data.booking_url);
});

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { createHomeShareHandler } from '../server/home-share-handler.js';

const template = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const invoke = async (handler, method = 'GET') => {
    const response = {
        headers: {},
        setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
        end(body) { this.body = body; },
    };
    await handler({ method, query: {} }, response);
    return response;
};

test('홈 최초 HTML에 사이트 제목, 설명, 로고와 공유 URL이 들어간다', async () => {
    const handler = createHomeShareHandler({ readTemplate: async () => template });
    const response = await invoke(handler);
    assert.equal(response.statusCode, 200);
    assert.equal(response.headers['cache-control'], 'no-store');
    assert.equal(response.headers['content-type'], 'text/html; charset=utf-8');
    assert.match(response.body, /property="og:title" content="NARUBROWN의 기술 블로그"/);
    assert.match(response.body, /property="og:description" content="세상의 문제를 인공지능으로 해결하는 엔지니어입니다\./);
    assert.match(response.body, /property="og:image" content="https:\/\/na2ru2.me\/logo.png"/);
    assert.match(response.body, /property="og:url" content="https:\/\/na2ru2.me\/"/);
    assert.match(response.body, /property="og:type" content="website"/);
    assert.match(response.body, /name="twitter:title" content="NARUBROWN의 기술 블로그"/);
    assert.match(response.body, /rel="canonical" href="https:\/\/na2ru2.me\/"/);
    assert.ok(!response.body.includes('article:published_time'));
    assert.ok(response.body.includes('id="root"'));
    assert.ok(response.body.includes('/src/main.jsx'));
    assert.equal((response.body.match(/<title>/g) || []).length, 1);
});

test('홈 공유 URL과 로고에 설정한 사이트 주소를 사용한다', async () => {
    const handler = createHomeShareHandler({ readTemplate: async () => template, siteOrigin: 'https://blog.example.com/' });
    const response = await invoke(handler);
    assert.match(response.body, /property="og:url" content="https:\/\/blog.example.com\/"/);
    assert.match(response.body, /property="og:image" content="https:\/\/blog.example.com\/logo.png"/);
});

test('홈 HEAD 응답은 본문 없이 GET과 같은 헤더를 제공한다', async () => {
    const handler = createHomeShareHandler({ readTemplate: async () => template });
    const get = await invoke(handler);
    const head = await invoke(handler, 'HEAD');
    assert.equal(head.statusCode, get.statusCode);
    assert.deepEqual(head.headers, get.headers);
    assert.equal(head.body, undefined);
});

test('홈에서 지원하지 않는 요청은 템플릿을 읽지 않는다', async () => {
    const handler = createHomeShareHandler({ readTemplate: () => assert.fail('템플릿 조회 금지') });
    const response = await invoke(handler, 'POST');
    assert.equal(response.statusCode, 405);
    assert.equal(response.headers.allow, 'GET, HEAD');
});

test('홈 템플릿 누락은 캐시하지 않는 서버 오류로 응답한다', async t => {
    t.mock.method(console, 'error', () => {});
    const handler = createHomeShareHandler({ readTemplate: async () => { throw new Error('ENOENT'); } });
    const response = await invoke(handler);
    assert.equal(response.statusCode, 500);
    assert.equal(response.headers['cache-control'], 'no-store');
    assert.equal(response.headers['x-robots-tag'], 'noindex');
});

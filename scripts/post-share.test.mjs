import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { createPostShareHandler } from '../server/post-share-handler.js';
import { renderPostSharePage } from '../server/share-page.js';

const template = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const post = {
    id: 42,
    title: '새로 작성한 글',
    content: '<p>본문에서 가져온 설명</p>',
    thumbnailUrl: '/images/post.png',
    publishedAt: '2026-11-01T09:00:00',
    author: { username: '작성자' },
    category: { name: '개발' },
    tags: { tagNames: ['React', '공유'] },
};

const invoke = async (handler, id = '42', method = 'GET') => {
    const response = {
        headers: {},
        setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
        end(body) { this.body = body; },
    };
    await handler({ method, query: { id } }, response);
    return response;
};

test('빌드 이후 작성하거나 수정한 글도 같은 워커에서 바로 공유할 수 있다', async () => {
    let currentPost = null;
    const requests = [];
    const handler = createPostShareHandler({
        readTemplate: async () => template,
        apiOrigin: 'https://api.example.com',
        siteOrigin: 'https://blog.example.com',
        fetchPost: async (url, options) => {
            requests.push({ url: String(url), options });
            return currentPost ? Response.json(currentPost) : new Response(null, { status: 404 });
        },
    });

    const missing = await invoke(handler);
    assert.equal(missing.statusCode, 404);
    assert.equal(missing.headers['cache-control'], 'no-store');

    currentPost = post;
    const created = await invoke(handler);
    assert.equal(created.statusCode, 200);
    assert.match(created.body, /property="og:title" content="새로 작성한 글/);
    assert.match(created.body, /property="og:description" content="본문에서 가져온 설명"/);
    assert.match(created.body, /property="og:image" content="https:\/\/blog.example.com\/images\/post.png"/);
    assert.match(created.body, /property="og:url" content="https:\/\/blog.example.com\/post\/share\/42"/);
    assert.match(created.body, /2026-11-01T00:00:00.000Z/);
    assert.ok(created.body.includes('/src/main.jsx'));
    assert.equal(created.headers['cache-control'], 'no-store');

    currentPost = { ...post, seoTitle: '수정한 제목', seoDescription: '수정한 설명', thumbnailUrl: '/updated.png' };
    const updated = await invoke(handler);
    assert.match(updated.body, /property="og:title" content="수정한 제목/);
    assert.match(updated.body, /property="og:description" content="수정한 설명"/);
    assert.match(updated.body, /https:\/\/blog.example.com\/updated.png/);
    assert.equal(requests.length, 3);
    for (const { url, options } of requests) {
        assert.equal(url, 'https://api.example.com/api/v1/post/id/42');
        assert.equal(options.cache, 'no-store');
        assert.deepEqual(options.headers, { Accept: 'application/json' });
        assert.ok(options.signal instanceof AbortSignal);
    }
});

test('잘못된 글 번호와 지원하지 않는 요청은 API를 호출하지 않는다', async () => {
    const handler = createPostShareHandler({ fetchPost: () => assert.fail('API 호출 금지') });
    for (const id of [null, '', '0', '-1', '1.2', '../42', '42?url=x', ['42', '43']]) {
        assert.equal((await invoke(handler, id)).statusCode, 400);
    }
    const result = await invoke(handler, '42', 'POST');
    assert.equal(result.statusCode, 405);
    assert.equal(result.headers.allow, 'GET, HEAD');
});

test('HEAD는 GET과 같은 상태와 헤더를 반환하고 본문을 보내지 않는다', async () => {
    const handler = createPostShareHandler({
        readTemplate: async () => template,
        fetchPost: async () => Response.json(post),
    });
    const response = await invoke(handler, '42', 'HEAD');
    assert.equal(response.statusCode, 200);
    assert.equal(response.headers['content-type'], 'text/html; charset=utf-8');
    assert.equal(response.body, undefined);
});

test('삭제된 글은 앱을 열 수 있는 404 HTML을 반환한다', async () => {
    const handler = createPostShareHandler({
        readTemplate: async () => template,
        fetchPost: async () => new Response(null, { status: 404 }),
    });
    const response = await invoke(handler);
    assert.equal(response.statusCode, 404);
    assert.equal(response.headers['x-robots-tag'], 'noindex');
    assert.equal(response.body, template);
});

test('API 장애나 잘못된 응답을 정상 미리보기로 캐시하지 않는다', async t => {
    t.mock.method(console, 'error', () => {});
    const failures = [
        async () => new Response(null, { status: 500 }),
        async () => { throw new DOMException('요청 시간 초과', 'TimeoutError'); },
        async () => Response.json({ ...post, id: 99 }),
        async () => new Response('not json'),
    ];
    for (const fetchPost of failures) {
        const response = await invoke(createPostShareHandler({ readTemplate: async () => template, fetchPost }));
        assert.equal(response.statusCode, 503);
        assert.equal(response.headers['cache-control'], 'no-store');
        assert.equal(response.headers['retry-after'], '30');
        assert.equal(response.headers['x-robots-tag'], 'noindex');
        assert.equal(response.body, template);
    }
});

test('템플릿 누락은 서버 오류로 표시한다', async t => {
    t.mock.method(console, 'error', () => {});
    const handler = createPostShareHandler({ readTemplate: async () => { throw new Error('ENOENT'); } });
    assert.equal((await invoke(handler)).statusCode, 500);
});

test('메타데이터의 HTML과 JSON-LD는 글 내용을 안전하게 보존한다', () => {
    const unsafeTitle = '</script><script>alert("x")</script> & "제목"';
    const html = renderPostSharePage(template, { ...post, seoTitle: unsafeTitle, thumbnailUrl: 'javascript:alert(1)' });
    assert.ok(!html.includes(unsafeTitle));
    assert.match(html, /&lt;\/script&gt;&lt;script&gt;alert\(&quot;x&quot;\)/);
    assert.match(html, /property="og:image" content="https:\/\/na2ru2.me\/logo.png"/);
    const json = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1];
    assert.equal(JSON.parse(json).headline, unsafeTitle);
    assert.equal(JSON.parse(json).url, `https://na2ru2.me/post/${encodeURIComponent('새로-작성한-글')}`);
    assert.equal((html.match(/<title>/g) || []).length, 1);
});

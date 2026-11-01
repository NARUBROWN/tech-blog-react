import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { DEFAULT_SITE_ORIGIN, renderPostSharePage } from './share-page.js';

const loadTemplate = () => readFile(path.join(process.cwd(), 'dist', 'index.html'), 'utf8');

export const createPostShareHandler = ({
    fetchPost = fetch,
    readTemplate = loadTemplate,
    siteOrigin = process.env.SITE_ORIGIN || DEFAULT_SITE_ORIGIN,
    apiOrigin = process.env.API_ORIGIN || 'https://api.na2ru2.me',
} = {}) => async (request, response) => {
    // 새 글과 수정 내용을 다음 요청에 반영하고, 실패 응답도 캐시에 남기지 않습니다.
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    const send = (status, body) => {
        response.statusCode = status;
        response.end(request.method === 'HEAD' ? undefined : body);
    };

    if (!['GET', 'HEAD'].includes(request.method)) {
        response.setHeader('Allow', 'GET, HEAD');
        send(405, '허용하지 않는 요청입니다.');
        return;
    }

    const id = request.query?.id;
    if (typeof id !== 'string' || !/^[1-9]\d{0,18}$/.test(id)) {
        send(400, '올바른 게시글 번호가 필요합니다.');
        return;
    }

    let template;
    try {
        template = await readTemplate();
    } catch (error) {
        console.error('Failed to load share page template:', error);
        send(500, '공유 페이지를 불러오지 못했습니다.');
        return;
    }

    try {
        // 공개 조회 API만 호출하며 방문자의 쿠키나 인증 정보는 전달하지 않습니다.
        const result = await fetchPost(new URL(`/api/v1/post/id/${id}`, apiOrigin), {
            headers: { Accept: 'application/json' },
            signal: AbortSignal.timeout(5000),
            cache: 'no-store',
        });

        if (result.status === 404) {
            response.setHeader('X-Robots-Tag', 'noindex');
            send(404, template);
            return;
        }
        if (!result.ok) throw new Error(`Post API returned ${result.status}`);

        const post = await result.json();
        if (!post || String(post.id) !== id || typeof post.title !== 'string') {
            throw new Error('Post API returned an invalid post');
        }

        send(200, renderPostSharePage(template, post, siteOrigin));
    } catch (error) {
        console.error('Failed to render post share page:', error);
        // API 장애 중에도 앱은 열되, 크롤러가 빈 미리보기를 정상 응답으로 저장하지 않게 합니다.
        response.setHeader('Retry-After', '30');
        response.setHeader('X-Robots-Tag', 'noindex');
        send(503, template);
    }
};

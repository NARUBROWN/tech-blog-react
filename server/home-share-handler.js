import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { DEFAULT_SITE_ORIGIN, renderHomeSharePage } from './share-page.js';

export const createHomeShareHandler = ({
    readTemplate = () => readFile(path.join(process.cwd(), 'dist', 'index.html'), 'utf8'),
    siteOrigin = process.env.SITE_ORIGIN || DEFAULT_SITE_ORIGIN,
} = {}) => async (request, response) => {
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

    try {
        // 홈 공유 미리보기는 게시글 API 연결 없이 제공됩니다.
        send(200, renderHomeSharePage(await readTemplate(), siteOrigin));
    } catch (error) {
        console.error('Failed to render home share page:', error);
        response.setHeader('X-Robots-Tag', 'noindex');
        send(500, '공유 페이지를 불러오지 못했습니다.');
    }
};

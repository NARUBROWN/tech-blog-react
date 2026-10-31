import { onFCP, onINP, onLCP } from 'web-vitals';

const visits = new Map();
let activeVisit = null;
let documentVisit = null;
let initialized = false;
let flushTimer;
const initialPath = location.pathname;
let navigationIntent = null;

export function apiEndpoint(raw) {
    let url;
    try { url = new URL(raw, location.origin); } catch { return null; }
    if (url.origin !== location.origin) return null;
    const path = url.pathname;
    if (['/api/v1/post', '/api/v1/post/search/recent', '/api/v1/category/list'].includes(path)) return path;
    for (const [pattern, name] of [
        [/^\/api\/v1\/post\/id\/[^/]+$/, '/api/v1/post/id/:id'],
        [/^\/api\/v1\/post\/slug\/[^/]+$/, '/api/v1/post/slug/:slug'],
        [/^\/api\/v1\/comments\/post\/[^/]+$/, '/api/v1/comments/post/:id'],
        [/^\/api\/v1\/like\/[^/]+\/state$/, '/api/v1/like/:id/state'],
    ]) if (pattern.test(path)) return name;
    return null;
}

function sample(visit, key, metric, durationMs, endpoint = '', statusCode = 0) {
    if (!visit || visit.enabled === false || !Number.isFinite(durationMs) || durationMs < 0 || durationMs > 600_000) return;
    const previous = visit.samples.get(key);
    if (previous?.durationMs === durationMs) return;
    visit.samples.set(key, { id: previous?.id || crypto.randomUUID(), metric, durationMs,
        endpoint, statusCode, revision: (previous?.revision || 0) + 1 });
    visit.pending.add(key);
    window.clearTimeout(flushTimer);
    flushTimer = window.setTimeout(flushPerformance, 1000);
}

async function send(visit) {
    if (visit.sending || !visit.enabled || !visit.pending.size) return;
    visit.sending = true;
    const keys = [...visit.pending].slice(0, 20);
    const batch = keys.map(key => visit.samples.get(key));
    let delivered = false;
    try {
        const response = await fetch('/api/v1/analytics/events', {
            method: 'POST', credentials: 'include', keepalive: true,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ visitId: visit.id, activeMs: 0, scrollDepth: 0, events: [], performance: batch }),
        });
        if ([403, 404].includes(response.status)) { visit.enabled = false; visit.pending.clear(); }
        delivered = response.ok;
        if (response.ok || response.status === 400) keys.forEach((key, i) => {
            if (visit.samples.get(key).revision === batch[i].revision) visit.pending.delete(key);
        });
    } catch { /* 계측 장애가 페이지 이용에 영향을 주지 않도록 다음 전송에서 재시도합니다. */ }
    finally { visit.sending = false; }
    if (delivered && visit.pending.size) void send(visit);
}

export function flushPerformance() {
    visits.forEach(visit => { void send(visit); });
}

function resources(entries) {
    for (const entry of entries) {
        const endpoint = apiEndpoint(entry.name);
        if (!endpoint || !['fetch', 'xmlhttprequest'].includes(entry.initiatorType)) continue;
        const visit = [...visits.values()].find(v => entry.startTime >= v.start && entry.startTime < v.end);
        const status = entry.responseStatus;
        // 상태를 알 수 없거나 취소된 요청은 성공 표본으로 간주하지 않습니다.
        if (!visit || !status) continue;
        const key = `api:${entry.startTime}:${entry.name}`;
        sample(visit, key, 'api_response', entry.duration, endpoint, status);
        const server = entry.serverTiming?.find(timing => timing.name === 'app');
        // 브라우저 캐시 응답의 과거 Server-Timing은 새 서버 처리 표본에서 제외합니다.
        if (server && entry.transferSize > 0) sample(visit, `server:${key}`, 'server_response', server.duration, endpoint, status);
    }
}

export function initializePerformance() {
    if (initialized) return;
    initialized = true;
    const vital = metric => {
        // 표준 Web Vitals는 최초 문서 단위입니다. SPA 전환 시간과 별도로 집계합니다.
        const visit = metric.navigationType === 'back-forward-cache' ? activeVisit : documentVisit;
        sample(visit, `vital:${metric.id}`, metric.name.toLowerCase(), metric.value);
    };
    onFCP(vital);
    onLCP(vital);
    onINP(vital);
    document.addEventListener('click', event => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
        if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
        const url = new URL(link.href, location.href);
        if (url.origin === location.origin && url.pathname + url.search !== location.pathname + location.search) {
            navigationIntent = { target: url.pathname + url.search, at: performance.now() };
        }
    }, true);
    window.addEventListener('popstate', () => { navigationIntent = { target: location.pathname + location.search, at: performance.now() }; });
    if (typeof PerformanceObserver !== 'undefined') {
        try {
            new PerformanceObserver(list => resources(list.getEntries())).observe({ type: 'resource', buffered: true });
        } catch { /* 지원하지 않는 브라우저에서는 해당 지표를 비워 둡니다. */ }
    }
    // Web Vitals의 숨김 처리 콜백 이후에 마지막 표본까지 전송합니다.
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') queueMicrotask(flushPerformance);
    });
    window.addEventListener('pagehide', () => queueMicrotask(flushPerformance));
    window.setInterval(flushPerformance, 15_000);
}

export function startPerformanceTracking(path, id, ready, allowed) {
    const now = performance.now();
    if (activeVisit && activeVisit.id !== id) activeVisit.end = now;
    let visit = visits.get(id);
    if (!visit) {
        const first = !activeVisit && !documentVisit && path === initialPath;
        const intent = navigationIntent?.target === location.pathname + location.search && now - navigationIntent.at < 10_000 ? navigationIntent.at : now;
        // 클릭 시각으로 경계를 맞춰 이전 페이지와 API 표본이 겹치지 않게 합니다.
        if (activeVisit) activeVisit.end = intent;
        navigationIntent = null;
        visit = { id, path, start: first ? 0 : intent, end: Infinity, initial: first, samples: new Map(), pending: new Set(), enabled: null, sending: false };
        visits.set(id, visit);
        if (first) documentVisit = visit;
    }
    visit.end = Infinity;
    activeVisit = visit;
    ready.then(() => { visit.enabled = allowed(); if (!visit.enabled) visit.pending.clear(); flushPerformance(); });
    // 이미 완료된 최초 API 요청도 같은 방문에 포함합니다.
    resources(performance.getEntriesByType('resource'));

    let frame = 0;
    let nextFrame = 0;
    let completed = document.visibilityState !== 'visible';
    const main = document.querySelector('main');
    const check = () => {
        cancelAnimationFrame(frame); cancelAnimationFrame(nextFrame);
        if (document.visibilityState !== 'visible') completed = true;
        if (completed) return;
        const root = main?.querySelector('[data-performance-page]');
        if (root?.dataset.performancePage !== path || root.dataset.performanceReady !== 'true') return;
        const waiting = [...root.querySelectorAll('img')].some(img => {
            const rect = img.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight && rect.bottom > 0 && !img.complete;
        });
        if (waiting) return;
        frame = requestAnimationFrame(() => {
            nextFrame = requestAnimationFrame(() => {
                completed = true;
                sample(visit, 'ready', visit.initial ? 'page_ready' : 'route_ready', performance.now() - visit.start);
            });
        });
    };
    const observer = new MutationObserver(check);
    if (main) observer.observe(main, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-performance-ready', 'src'] });
    main?.addEventListener('load', check, true);
    main?.addEventListener('error', check, true);
    document.addEventListener('visibilitychange', check);
    check();
    return () => {
        visit.end = performance.now();
        observer.disconnect();
        cancelAnimationFrame(frame); cancelAnimationFrame(nextFrame);
        main?.removeEventListener('load', check, true);
        main?.removeEventListener('error', check, true);
        document.removeEventListener('visibilitychange', check);
        flushPerformance();
    };
}

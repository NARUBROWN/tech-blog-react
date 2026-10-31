// 공개 페이지에서만 사용하는 자체 계측입니다. 입력값이나 키 입력 내용은 수집하지 않습니다.
let startChain = Promise.resolve();

const uuid = () => crypto.randomUUID();
const normalize = (value, length) => Array.from(String(value || '').replace(/\s+/g, ' ').trim()).slice(0, length).join('');
const publicPage = path => path === '/' || path === '/about' || path === '/search' || (path.startsWith('/post/') && path !== '/post/create' && !path.startsWith('/post/edit/'));

function sessionId() {
    try {
        const previous = JSON.parse(sessionStorage.getItem('blog-analytics-session') || 'null');
        const id = previous && Date.now() - previous.at < 30 * 60 * 1000 ? previous.id : uuid();
        sessionStorage.setItem('blog-analytics-session', JSON.stringify({ id, at: Date.now() }));
        return id;
    } catch { return uuid(); }
}

function post(path, payload) {
    return fetch(`/api/v1/analytics/${path}`, {
        method: 'POST', credentials: 'include', keepalive: true,
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
}

export function startPageTracking(path, visitId) {
    if (!publicPage(path)) return () => {};
    let stopped = false;
    let disabled = false;
    let pending = [];
    let activeMs = 0;
    let maxScroll = 0;
    let lastTick = performance.now();
    let lastActivity = performance.now();
    let pointerStart = null;
    let sending = false;
    let currentSession = null;

    const ready = startChain.catch(() => {}).then(async () => {
        currentSession = sessionId();
        const response = await post('visits', {
            id: visitId, sessionId: currentSession, path, referrer: document.referrer,
            device: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
        });
        if (!response.ok) throw new Error('계측 시작 실패');
        const result = await response.json();
        disabled = !result.tracked;
        if (!disabled) window.dispatchEvent(new CustomEvent('analytics:visit-recorded', { detail: result }));
    }).catch(() => { disabled = true; });
    startChain = ready;

    const tick = () => {
        const now = performance.now();
        if (document.visibilityState === 'visible' && document.hasFocus() && now - lastActivity < 60_000) {
            activeMs += Math.max(0, Math.min(now - lastTick, 5000));
        }
        lastTick = now;
        const height = document.documentElement.scrollHeight;
        if (height > 0) maxScroll = Math.max(maxScroll, Math.min(100, Math.round((window.scrollY + window.innerHeight) / height * 100)));
    };
    const flush = async () => {
        if (sending) return;
        sending = true;
        try {
            await ready;
            if (disabled) return;
            if (document.visibilityState === 'visible' && performance.now() - lastActivity < 60_000) {
                try {
                    const stored = JSON.parse(sessionStorage.getItem('blog-analytics-session') || 'null');
                    if (stored?.id === currentSession) sessionStorage.setItem('blog-analytics-session', JSON.stringify({ id: currentSession, at: Date.now() }));
                } catch { /* 저장소를 사용할 수 없어도 계측은 계속합니다. */ }
            }
            const batch = pending.slice(0, 8);
            const response = await post('events', { visitId, activeMs: Math.round(activeMs), scrollDepth: maxScroll, events: batch });
            if (response.status === 403 || response.status === 404) disabled = true;
            if (response.ok || response.status === 400) {
                const ids = new Set(batch.map(event => event.id));
                pending = pending.filter(event => !ids.has(event.id));
            }
        } catch { /* 계측 실패는 페이지 이용에 영향을 주지 않습니다. */ }
        finally { sending = false; }
        if (!disabled && pending.length > 0 && !stopped) window.setTimeout(flush, 1500);
    };
    const record = event => {
        if (disabled || stopped || pending.length >= 40) return;
        pending.push({ id: uuid(), ...event });
        tick(); void flush();
    };
    const activity = () => { lastActivity = performance.now(); };
    const click = event => {
        const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
        if (!link) return;
        const type = link.dataset.analyticsEvent;
        if (type === 'snackbar_resume' || type === 'snackbar_linkedin') {
            record({ type, label: normalize(link.textContent, 120) });
            return;
        }
        if (path !== '/about' || !link.closest('.about-page')) return;
        try {
            const target = new URL(link.href, location.href);
            if ((target.protocol === 'http:' || target.protocol === 'https:') && target.origin !== location.origin || target.protocol === 'mailto:') {
                target.search = ''; target.hash = '';
                record({ type: 'resume_outbound', url: target.protocol === 'mailto:' ? 'mailto:' : target.href,
                    label: normalize(link.textContent || link.getAttribute('aria-label'), 120), section: link.closest('section[id]')?.id || 'intro' });
            }
        } catch { /* URL 형식이 없는 요소는 수집하지 않습니다. */ }
    };
    const pointerDown = event => {
        activity();
        if (path === '/about' && event.target instanceof Element && event.target.closest('.about-page') && !event.target.closest('input,textarea,[contenteditable]')) pointerStart = performance.now();
        else pointerStart = null;
    };
    const pointerUp = () => {
        if (pointerStart === null) return;
        const durationMs = Math.round(performance.now() - pointerStart); pointerStart = null;
        const selection = window.getSelection();
        if (!selection || durationMs < 500 || selection.isCollapsed) return;
        const anchor = selection.anchorNode?.parentElement;
        const focus = selection.focusNode?.parentElement;
        if (!anchor?.closest('.about-page') || !focus?.closest('.about-page') || anchor.closest('input,textarea,[contenteditable]') || focus.closest('input,textarea,[contenteditable]')) return;
        const text = normalize(selection.toString(), 600);
        if (Array.from(text).length < 8) return;
        const block = anchor.closest('p,li,h1,h2,h3,h4,blockquote');
        record({ type: 'resume_selection', text, context: normalize(block?.textContent, 1000),
            section: anchor.closest('section[id]')?.id || 'intro', durationMs });
    };
    const visibility = () => { tick(); void flush(); };
    const pagehide = () => { tick(); void flush(); };
    const heartbeat = window.setInterval(() => { tick(); void flush(); }, 15_000);
    const ticking = window.setInterval(tick, 1000);
    document.addEventListener('click', click, true);
    document.addEventListener('pointerdown', pointerDown, true);
    document.addEventListener('pointerup', pointerUp, true);
    const pointerCancel = () => { pointerStart = null; };
    document.addEventListener('pointercancel', pointerCancel, true);
    document.addEventListener('keydown', activity, { passive: true });
    window.addEventListener('scroll', activity, { passive: true });
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('pagehide', pagehide);
    return () => {
        tick(); stopped = true; void flush();
        window.clearInterval(heartbeat); window.clearInterval(ticking);
        document.removeEventListener('click', click, true);
        document.removeEventListener('pointerdown', pointerDown, true);
        document.removeEventListener('pointerup', pointerUp, true);
        document.removeEventListener('pointercancel', pointerCancel, true);
        document.removeEventListener('keydown', activity);
        window.removeEventListener('scroll', activity);
        document.removeEventListener('visibilitychange', visibility);
        window.removeEventListener('pagehide', pagehide);
    };
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, RefreshCw, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAnalytics, getAnalyticsEvents } from '../api/analytics';
import './Analytics.css';

const types = { snackbar_resume: '스낵바 → 이력서', snackbar_linkedin: '스낵바 → LinkedIn', resume_selection: '이력서 문장 선택', resume_outbound: '이력서 외부 링크' };
const number = value => Number(value || 0).toLocaleString('ko-KR');
const duration = ms => { const seconds = Math.round(Number(ms || 0) / 1000); return seconds >= 60 ? `${Math.floor(seconds / 60)}분 ${seconds % 60}초` : `${seconds}초`; };
const date = value => new Date(value).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' });
const pageName = row => row.title || ({ '/': '메인', '/about': '자기소개서', '/search': '검색' }[row.path] || row.path);

function Table({ headers, children, empty }) {
    return <div className="analytics-table-scroll"><table><thead><tr>{headers.map(header => <th key={header} scope="col">{header}</th>)}</tr></thead><tbody>{empty ? <tr><td colSpan={headers.length} className="analytics-empty">아직 수집된 데이터가 없습니다.</td></tr> : children}</tbody></table></div>;
}

export default function Analytics() {
    const { user } = useAuth();
    const [days, setDays] = useState(30);
    const [revision, setRevision] = useState(0);
    const [result, setResult] = useState({ key: '', data: null, error: '' });
    const [eventType, setEventType] = useState('');
    const [page, setPage] = useState(0);
    const [eventResult, setEventResult] = useState({ key: '', data: null, error: '' });
    const isAdmin = user?.role === 'ROLE_ADMIN';
    const queryKey = `${days}:${revision}`;
    const eventKey = `${days}:${page}:${eventType}:${revision}`;
    const dashboard = result.key === queryKey ? result.data : null;
    const loading = isAdmin && result.key !== queryKey;
    const error = result.key === queryKey ? result.error : '';
    const events = eventResult.key === eventKey ? eventResult.data : null;
    const eventError = eventResult.key === eventKey ? eventResult.error : '';

    useEffect(() => {
        if (!isAdmin) return undefined;
        const controller = new AbortController();
        getAnalytics(days, { signal: controller.signal }).then(data => setResult({ key: queryKey, data, error: '' })).catch(err => {
            if (!controller.signal.aborted) setResult({ key: queryKey, data: null, error: err.response?.status === 403 ? '관리자만 접근할 수 있습니다.' : err.response?.status === 401 ? '로그인이 만료됐습니다. 다시 로그인해 주세요.' : '통계를 불러오지 못했습니다. 다시 시도해 주세요.' });
        });
        return () => controller.abort();
    }, [isAdmin, days, queryKey]);

    useEffect(() => {
        if (!isAdmin) return undefined;
        const controller = new AbortController();
        getAnalyticsEvents(days, page, eventType, { signal: controller.signal }).then(data => setEventResult({ key: eventKey, data, error: '' })).catch(err => {
            if (!controller.signal.aborted) setEventResult({ key: eventKey, data: null, error: err.response?.status === 403 ? '관리자만 이벤트를 조회할 수 있습니다.' : '이벤트를 불러오지 못했습니다.' });
        });
        return () => controller.abort();
    }, [isAdmin, days, page, eventType, eventKey]);

    if (!isAdmin) return <div className="analytics-page"><h1>관리자 전용 계측</h1><p>관리자 계정으로 로그인하면 통계를 확인할 수 있습니다.</p><Link to="/login" className="analytics-login">로그인하기 <ArrowUpRight size={16} /></Link></div>;
    const summary = dashboard?.summary;
    const selections = dashboard?.groups.filter(row => row.type === 'resume_selection') || [];
    const outbound = dashboard?.groups.filter(row => row.type === 'resume_outbound') || [];
    const snackbar = dashboard?.groups.filter(row => row.type.startsWith('snackbar_')) || [];
    const maxViews = Math.max(1, ...(dashboard?.daily.map(row => row.views) || []));

    return <div className="analytics-page">
        <header className="analytics-header">
            <div><span className="analytics-eyebrow"><BarChart3 size={16} /> 관리자 전용</span><h1>방문과 관심의 흐름</h1><p>블로그와 자기소개서에서 어떤 내용을 읽고, 어디로 이동했는지 살펴보세요.</p></div>
            <div className="analytics-controls"><label>조회 기간<select value={days} onChange={event => { setDays(Number(event.target.value)); setPage(0); }}><option value={1}>오늘</option><option value={7}>최근 7일</option><option value={30}>최근 30일</option><option value={90}>최근 90일</option></select></label><button onClick={() => setRevision(value => value + 1)} disabled={loading}><RefreshCw size={16} /> 새로고침</button></div>
        </header>
        <p className="analytics-note">수집 시작 이후의 데이터입니다. 방문자는 브라우저 식별 기준이며 관리자 자신의 방문은 제외합니다. 체류시간은 탭이 보이고 활성화된 시간을 측정하며, 1분 이상 입력이나 스크롤이 없으면 누적을 멈춥니다.</p>
        {error && <p className="analytics-error" role="alert">{error}</p>}
        {loading && <p className="analytics-loading" role="status">통계를 불러오고 있습니다.</p>}
        {summary && <>
            <section className="analytics-kpis" aria-label="핵심 지표">{[
                ['페이지 조회', number(summary.views)], ['방문자', number(summary.visitors)], ['방문 세션', number(summary.sessions)], ['평균 활성 체류', duration(summary.averageActiveMs)], ['이력서 방문자', number(summary.resumeVisitors)], ['이력서 조회', number(summary.resumeViews)], ['이력서 문장 선택', number(summary.selections)], ['이력서 외부 이동', number(summary.outboundClicks)],
            ].map(([label, value]) => <div key={label} className="analytics-kpi"><span>{label}</span><strong>{value}</strong></div>)}</section>
            <section className="analytics-section"><h2>일별 방문</h2><p className="analytics-caption">막대는 조회 수입니다. 날짜에 마우스를 올리면 방문자 수도 볼 수 있습니다.</p>
                <div className="analytics-chart" role="img" aria-label={`최근 ${days}일 페이지 조회 수`}>
                    {dashboard.daily.map((row, index) => <div className="analytics-chart-day" key={row.date} title={`${row.date}: 조회 ${row.views}, 방문자 ${row.visitors}`}><span className="analytics-chart-value">{row.views > 0 && dashboard.daily.length <= 30 ? row.views : ''}</span><div className="analytics-chart-column"><span style={{ height: `${row.views > 0 ? Math.max(2, row.views / maxViews * 100) : 0}%` }} /></div><small>{index % Math.max(1, Math.floor(dashboard.daily.length / 7)) === 0 ? row.date.slice(5).replace('-', '/') : ''}</small></div>)}
                </div>
            </section>
            <section className="analytics-section"><h2>페이지별 조회와 체류</h2><Table headers={['페이지', '조회', '방문자', '평균 활성 체류', '평균 스크롤']} empty={!dashboard.pages.length}>{dashboard.pages.map(row => <tr key={row.path}><td><Link to={row.path}>{pageName(row)}</Link><small>{row.path}</small></td><td>{number(row.views)}</td><td>{number(row.visitors)}</td><td>{duration(row.averageActiveMs)}</td><td>{row.averageScroll}%</td></tr>)}</Table></section>
            <section className="analytics-section"><h2>게시글별 조회</h2><p className="analytics-caption">계측 조회는 선택한 기간의 데이터이며, 기존 누적 조회는 게시글에 기록된 전체 조회 수입니다.</p><Table headers={['게시글', '계측 조회', '기존 누적 조회', '평균 활성 체류']} empty={!dashboard.posts.length}>{dashboard.posts.map(row => <tr key={row.id}><td><Link to={`/post/share/${row.id}`}>{row.title}</Link></td><td>{number(row.views)}</td><td>{number(row.legacyViews)}</td><td>{duration(row.averageActiveMs)}</td></tr>)}</Table></section>
            <div className="analytics-two-column">
                <section className="analytics-section"><h2>유입 경로</h2><Table headers={['출처', '조회', '방문자']} empty={!dashboard.referrers.length}>{dashboard.referrers.map(row => <tr key={row.name}><td>{row.name || '직접 방문'}</td><td>{number(row.views)}</td><td>{number(row.visitors)}</td></tr>)}</Table></section>
                <section className="analytics-section"><h2>접속 기기</h2><Table headers={['기기', '조회', '방문자']} empty={!dashboard.devices.length}>{dashboard.devices.map(row => <tr key={row.name}><td>{{ mobile: '모바일', tablet: '태블릿', desktop: '데스크톱' }[row.name] || row.name}</td><td>{number(row.views)}</td><td>{number(row.visitors)}</td></tr>)}</Table></section>
            </div>
            <section className="analytics-section"><h2>스낵바에서 이동한 방문자</h2><div className="analytics-inline-metrics"><span>이력서 <strong>{number(summary.resumeClicks)}회</strong></span><span>LinkedIn <strong>{number(summary.linkedInClicks)}회</strong></span></div><Table headers={['버튼', '클릭', '방문자']} empty={!snackbar.length}>{snackbar.map((row, index) => <tr key={index}><td>{types[row.type]}</td><td>{number(row.count)}</td><td>{number(row.visitors)}</td></tr>)}</Table></section>
            <section className="analytics-section"><h2>길게 선택한 이력서 문장</h2><p className="analytics-caption">500ms 이상 드래그하고 8자 이상 선택한 경우입니다. 문장을 펼치면 주변 문맥을 확인할 수 있습니다.</p><Table headers={['선택 문장과 문맥', '영역', '선택', '방문자', '평균 드래그']} empty={!selections.length}>{selections.map((row, index) => <tr key={index}><td className="analytics-text-cell"><details><summary>{row.text}</summary><p>{row.context || row.text}</p></details></td><td>{row.section || 'intro'}</td><td>{number(row.count)}</td><td>{number(row.visitors)}</td><td>{(row.averageDurationMs / 1000).toFixed(1)}초</td></tr>)}</Table></section>
            <section className="analytics-section"><h2>이력서 외부 링크</h2><Table headers={['링크', '클릭', '방문자']} empty={!outbound.length}>{outbound.map((row, index) => <tr key={index}><td className="analytics-text-cell"><strong>{row.label || '외부 링크'}</strong><small>{row.url}</small></td><td>{number(row.count)}</td><td>{number(row.visitors)}</td></tr>)}</Table></section>
        </>}
        <section className="analytics-section">
            <div className="analytics-section-heading"><div><h2>방문자별 이벤트 기록</h2><p className="analytics-caption">이름이나 IP 대신 익명 식별자로 표시합니다. 동일 방문자의 클릭과 문장 선택을 함께 확인할 수 있습니다.</p></div><label>이벤트<select value={eventType} onChange={event => { setEventType(event.target.value); setPage(0); }}><option value="">전체</option>{Object.entries(types).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>
            {eventError && <p role="alert" className="analytics-error">{eventError}</p>}
            {!events && !eventError && <p role="status">이벤트를 불러오고 있습니다.</p>}
            {events && <><Table headers={['시각', '방문자', '이벤트', '페이지와 상세']} empty={!events.content.length}>{events.content.map(row => <tr key={row.id}><td className="analytics-nowrap">{date(row.at)}</td><td className="analytics-visitor">{row.visitor}</td><td>{types[row.type]}</td><td className="analytics-text-cell"><small>{row.path}</small>{row.text ? <details><summary>{row.text}</summary><p>{row.context}</p><small>{row.section}, {(row.durationMs / 1000).toFixed(1)}초 드래그</small></details> : <><strong>{row.label}</strong><small>{row.url}</small></>}</td></tr>)}</Table><nav className="analytics-pagination" aria-label="이벤트 페이지"><button disabled={page === 0} onClick={() => setPage(value => value - 1)}>이전</button><span>{events.totalPages === 0 ? 0 : page + 1} / {events.totalPages} 페이지, {number(events.totalElements)}개 이벤트</span><button disabled={page + 1 >= events.totalPages} onClick={() => setPage(value => value + 1)}>다음</button></nav></>}
        </section>
    </div>;
}

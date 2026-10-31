import { useEffect, useState } from 'react';
import { getPerformance } from '../api/analytics';

const metrics = {
    server_response: ['서버 내부 처리', '요청 처리 시작부터 응답 직전까지. 인증·DB 조회·응답 준비를 포함하며 네트워크는 제외합니다.'],
    api_response: ['브라우저 API 응답', '브라우저 요청 시작부터 응답 다운로드 완료까지. 서버 처리와 네트워크를 포함합니다.'],
    page_ready: ['첫 페이지 콘텐츠 표시', '문서 탐색 시작부터 데이터가 준비되고 화면 안의 이미지가 로드된 뒤, 다음 화면 갱신까지의 근사 시간입니다.'],
    route_ready: ['페이지 전환 콘텐츠 표시', '앱 내부 경로 전환부터 데이터와 화면 안 이미지가 준비된 뒤, 다음 화면 갱신까지의 근사 시간입니다.'],
    fcp: ['첫 콘텐츠 표시 · FCP', '문서를 열고 첫 텍스트나 이미지가 표시될 때까지의 시간입니다.'],
    lcp: ['주요 콘텐츠 표시 · LCP', '문서를 열고 화면 안에서 가장 큰 콘텐츠가 표시될 때까지의 시간입니다.'],
    inp: ['상호작용 반응 · INP', '문서 수명 동안 클릭·탭·키 입력에 대한 화면 반응 지표입니다. 상호작용이 있어야 수집됩니다.'],
};
const count = n => Number(n || 0).toLocaleString('ko-KR');
const ms = n => n == null || !Number.isFinite(Number(n)) ? '—' : `${Number(n).toLocaleString('ko-KR', { maximumFractionDigits: 1 })} ms`;

function Stats({ rows, dimension }) {
    return <>
        {!dimension && <div className="analytics-performance-cards">{rows.length ? rows.map(row => <article key={row.metric}>
            <h4>{metrics[row.metric]?.[0] || row.metric}</h4><p>{metrics[row.metric]?.[1]}</p>
            <dl>{[['p95', ms(row.p95Ms)], ['p99', ms(row.p99Ms)], ['평균', ms(row.averageMs)], ['p50', ms(row.p50Ms)], ['최대', ms(row.maxMs)], ['표본', `${count(row.count)}개`]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
            <small>{row.count < 100 ? `표본 ${count(row.count)}개: ${row.count < 20 ? 'p95·p99' : 'p99'} 해석에 주의해 주세요.` : ''}{['server_response', 'api_response'].includes(row.metric) ? ` 오류 응답 ${count(row.errors)}개` : ''}</small>
        </article>) : <p className="analytics-empty">아직 수집된 성능 표본이 없습니다. 적용 후 실제 방문부터 쌓입니다.</p>}</div>}
        {dimension && <p className="analytics-performance-scroll-hint">표를 좌우로 스크롤하면 p95·p99와 나머지 지표를 볼 수 있습니다.</p>}
        <div className={`analytics-table-scroll ${dimension ? '' : 'analytics-performance-summary-table'}`}><table className="analytics-performance-table">
        <thead><tr>{[dimension === 'endpoint' ? 'API 경로 / 지표' : dimension === 'path' ? '페이지 / 지표' : '지표', '표본', '평균', 'p50', 'p95', 'p99', '최대', '오류 응답'].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
        <tbody>{rows.length ? rows.map(row => <tr key={`${row.metric}:${row.path}:${row.endpoint}`}>
            <td><strong>{dimension ? row[dimension] : metrics[row.metric]?.[0] || row.metric}</strong>{dimension ? <small>{metrics[row.metric]?.[0] || row.metric}</small> : <small>{metrics[row.metric]?.[1]}</small>}</td>
            <td>{count(row.count)}</td><td>{ms(row.averageMs)}</td><td>{ms(row.p50Ms)}</td>
            <td>{ms(row.p95Ms)}{row.count < 20 && <small className="analytics-sample-note">20개 미만</small>}</td>
            <td>{ms(row.p99Ms)}{row.count < 100 && <small className="analytics-sample-note">100개 미만</small>}</td>
            <td>{ms(row.maxMs)}</td><td>{['server_response', 'api_response'].includes(row.metric) ? `${count(row.errors)} / ${count(row.count)}` : '—'}</td>
        </tr>) : <tr><td colSpan={8} className="analytics-empty">아직 수집된 성능 표본이 없습니다. 적용 후 실제 방문부터 쌓입니다.</td></tr>}</tbody>
    </table></div></>;
}

export default function PerformanceAnalytics({ days, revision }) {
    const key = `${days}:${revision}`;
    const [result, setResult] = useState({ key: '', data: null, error: '' });
    const [view, setView] = useState('pages');
    useEffect(() => {
        const controller = new AbortController();
        getPerformance(days, { signal: controller.signal }).then(data => setResult({ key, data, error: '' })).catch(error => {
            if (!controller.signal.aborted) setResult({ key, data: null, error: error.response?.status === 404 ? '성능 수집 API가 아직 적용되지 않았습니다. 백엔드 업데이트와 성능 테이블 준비가 필요합니다.' : '성능 지표를 불러오지 못했습니다. 새로고침해 주세요.' });
        });
        return () => controller.abort();
    }, [days, key]);
    const data = result.key === key ? result.data : null;
    const error = result.key === key ? result.error : '';
    const rows = data?.summary || [];
    return <section className="analytics-section analytics-performance" aria-labelledby="performance-heading">
        <div className="analytics-section-heading"><div><span className="analytics-eyebrow">실제 방문 성능</span><h2 id="performance-heading">응답과 화면 표시 시간</h2></div><span className="analytics-performance-period">방문 통계와 동일한 조회 기간</span></div>
        <p className="analytics-caption">p95는 표본의 95%, p99는 99%가 이 시간 이내였다는 뜻입니다. 낮을수록 빠릅니다. 표본이 적으면 최대값에 가까워져 해석에 주의가 필요합니다.</p>
        {error && <p role="alert" className="analytics-error">{error}</p>}
        {!data && !error && <p role="status" className="analytics-loading">성능 지표를 불러오고 있습니다.</p>}
        {data && <>
            <h3>백엔드와 API 응답</h3>
            <Stats rows={['server_response', 'api_response'].map(metric => rows.find(row => row.metric === metric)).filter(Boolean)} />
            <p className="analytics-caption analytics-performance-footnote">서버 값은 방문 브라우저가 수신한 Server-Timing 표본입니다. 캐시에서 꺼낸 응답은 서버 표본에서 제외합니다. API 응답은 캐시 응답과 HTTP 오류 응답도 포함하며, 취소되거나 상태를 확인할 수 없는 요청은 제외합니다. 두 지표의 백분위 차이를 네트워크 시간으로 해석할 수는 없습니다.</p>
            <h3>프론트엔드 체감 시간</h3>
            <Stats rows={['page_ready', 'route_ready', 'fcp', 'lcp', 'inp'].map(metric => rows.find(row => row.metric === metric)).filter(Boolean)} />
            <p className="analytics-caption analytics-performance-footnote">FCP·LCP·INP는 최초 문서 기준이며, 앱 내부 전환은 별도 지표로 표시합니다. 미지원 브라우저, 백그라운드 로딩, 완료 전 이탈에는 일부 표본이 없을 수 있습니다. 관리자 방문은 제외하며, 체류시간과는 다른 지표입니다.</p>
            <div className="analytics-performance-tabs" role="group" aria-label="성능 상세 보기"><button aria-pressed={view === 'pages'} onClick={() => setView('pages')}>페이지별 체감 시간</button><button aria-pressed={view === 'endpoints'} onClick={() => setView('endpoints')}>API별 응답 시간</button></div>
            <Stats rows={data[view] || []} dimension={view === 'pages' ? 'path' : 'endpoint'} />
        </>}
    </section>;
}

export const recapData = [
    {
        id: 1,
        type: 'cover',
        title: '2025년 돌아보기',
        subtitle: '기능을 더하는 해가 아니라 구조를 바로잡고 “왜 이렇게 동작하는지”를 끝까지 설명 가능하게 만든 해였습니다.',
        bgGradient: 'linear-gradient(135deg, #FF6B6B 0%, #556270 100%)',
        textColor: '#ffffff'
    },
    {
        id: 2,
        type: 'list',
        title: '숫자로 요약한 2025년',
        items: [
            '모놀리스 -> MSA 전환 1회',
            '통합 모니터링 시스템 구축 2회',
            '성능 병목 재현 -> 원인 분석 -> 구조 개선 사이클 5번',
            '레거시 코드 정리 20% 이상',
            'AOP를 응용한 관심사 분리 1번'
        ],
        note: '한 번 고치고 끝내는 게 아닌, 반복 가능한 개선 사이클을 만든 해였습니다.',
        bgGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        textColor: '#ffffff'
    },
    {
        id: 3,
        type: 'keywords',
        title: '2025년의 키워드',
        keywords: [
            { word: '관측 가능성', desc: '왜 느린지 모르겠다”는 말을 줄이기 위해 E2E 단위로 보이게 만들었습니다.' },
            { word: '동시성', desc: '여러 명이 동시에 요청할 때 왜 항상 같은 데이터가 여러 번 처리되는지 궁금했습니다.' },
            { word: '리팩터링', desc: '기능을 추가하다 보니 문제는 코드보다 구조에 먼저 생겼습니다.' },
            { word: '성능', desc: '빠른지 아닌지는 체감이 아니라 숫자로 판단했습니다.' },
            { word: '문서화', desc: '설명하다가 “아, 이건 내가 잘못 이해했네”를 여러 번 경험했습니다.' }
        ],
        bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        textColor: '#ffffff'
    },
    {
        id: 4,
        type: 'timeline',
        date: '2025.03',
        title: '통합 모니터링 시스템 도입',
        content: '서버 상태를 보려다 시스템의 전체 구조를 다시 보게 됐습니다.',
        bgGradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
        textColor: '#ffffff'
    },
    {
        id: 5,
        type: 'timeline',
        date: '2025.07',
        title: '모놀리스에서 MSA로',
        content: '서버를 늘려도 성능이 늘지 않아서, 구조를 먼저 나눴습니다.',
        bgGradient: 'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)',
        textColor: '#ffffff'
    },
    {
        id: 6,
        type: 'timeline',
        date: '2025.08',
        title: 'Slow Query 감지 시스템',
        content: '“DB가 느린 것 같다”에서 “이 쿼리가 137ms 걸린다”로 넘어갔다.',
        bgGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        textColor: '#ffffff'
    },
    {
        id: 7,
        type: 'timeline',
        date: '2025.10',
        title: 'End-to-End 트레이싱',
        content: '요청이 어디서 시작해 어디서 멈추는지 이제는 숨지 않는다.',
        bgGradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
        textColor: '#ffffff'
    },
    {
        id: 8,
        type: 'timeline',
        date: '2025.11',
        title: '분산락 기반 실시간 대기방 구축',
        content: '동시에 몰린 요청을 운에 맡기지 않고, 단 한 번만 반영되게 잠갔습니다.',
        bgGradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
        textColor: '#ffffff'
    },
    {
        id: 9,
        type: 'thought',
        title: '올해 가장 많이 했던 생각',
        quote: '이거, 코드 문제가 아니라 설계 문제 같은데?',
        items: [
            '로그인 로직이 커질 때',
            '트랜잭션 경계가 헷갈릴 때',
            '“이건 왜 여기서 처리하지?”라는 말이 나올 때'
        ],
        highlight: '대부분의 답은 코드를 더 짜는 게 아니라 경계를 다시 긋는 것이었다.',
        bgGradient: 'linear-gradient(135deg, #2af598 0%, #009efd 100%)',
        textColor: '#ffffff'
    },
    {
        id: 10,
        type: 'comparison',
        title: '작업 방식 변화',
        before: {
            label: '예전',
            items: ['일단 동작', '문제 생기면 대응', '맥락은 머릿속에만 존재']
        },
        after: {
            label: '지금',
            items: ['구조부터 생각', '지표 먼저 확인', '설명 가능한 코드 선호']
        },
        note: '코드는 줄었고, 생각할 포인트는 늘었다.',
        bgGradient: 'linear-gradient(135deg, #b721ff 0%, #21d4fd 100%)',
        textColor: '#ffffff'
    },
    {
        id: 11,
        type: 'standard',
        title: '2025년의 기준',
        heading: '이 코드, 다른 사람이 봐도 이유를 알 수 있을까?',
        content: '이 질문에 바로 답이 안 나오면 대부분 손볼 지점이 있었다.',
        bgGradient: 'linear-gradient(135deg, #209cff 0%, #68e0cf 100%)',
        textColor: '#ffffff'
    },
    {
        id: 12,
        type: 'preview',
        title: '2026 미리보기',
        items: [
            '이벤트 기반 아키텍처 더 깊게 보기',
            '상태 정합성을 감이 아닌 실험으로 다루기',
            '글을 쓰되, 정리된 형태로 남기기'
        ],
        quote: '내년에는 “왜 이렇게 설계했는지”를 더 빠르게 설명하는 사람이 되고 싶다.',
        bgGradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
        textColor: '#ffffff'
    },
    {
        id: 13,
        type: 'outro',
        title: '마무리',
        content: '이 Recap은 자랑보다는 정리에 가깝다. 2025년에 어떤 문제를 어떻게 대했는지에 대한 기록이다.',
        bgGradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        textColor: '#ffffff'
    }
];

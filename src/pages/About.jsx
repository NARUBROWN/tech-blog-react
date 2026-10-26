import React, { useEffect, useRef, useState } from 'react';
import { Mail, Github, Linkedin, ExternalLink, Trophy, Activity, Layers, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import './About.css';

const About = () => {
    const [isSkillsOpen, setIsSkillsOpen] = useState(false);
    const showSkillsSection = false;
    const [showSummary, setShowSummary] = useState(false);
    const summaryRef = useRef(null);
    const summaryButtonRef = useRef(null);

    useEffect(() => {
        if (showSummary) {
            const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
            summaryRef.current?.scrollIntoView({ behavior, block: 'start' });
        }
    }, [showSummary]);

    // SEO metadata for Google/Naver crawling on the /about page
    useEffect(() => {
        const siteName = 'NARUBROWN의 기술 블로그';
        const defaultTitle = document.title || siteName;
        const pageTitle = `김원정 | AI 엔지니어 포트폴리오 - ${siteName}`;
        const description = 'LLM, RAG, OCR, VLM 기반 AI 서비스와 백엔드 시스템을 설계하고 구현해 온 김원정의 AI 엔지니어 포트폴리오.';
        const canonicalUrl = 'https://na2ru2.me/about';
        const ogImage = 'https://na2ru2.me/logo.png';

        const previousMetaContent = new Map();
        const createdMeta = [];

        const upsertMeta = (attr, key, value) => {
            if (!value) return;
            let element = document.querySelector(`meta[${attr}="${key}"]`);
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute(attr, key);
                document.head.appendChild(element);
                createdMeta.push(element);
            } else {
                previousMetaContent.set(element, element.getAttribute('content'));
            }
            element.setAttribute('content', value);
        };

        const metaDefinitions = [
            { attr: 'name', key: 'description', value: description },
            { attr: 'name', key: 'keywords', value: 'Software Engineer, AI Engineer, Backend Engineer, 김원정, NARUBROWN, LLM, RAG, AgenticRAG, OCR, VLM, YOLO, LoRA, Spine, Go, 온톨로지, 지식 그래프, LCA, 탄소관리, FastAPI, Spring Boot, NestJS, React, 포트폴리오' },
            { attr: 'name', key: 'author', value: '김원정 (NARUBROWN)' },
            { attr: 'name', key: 'robots', value: 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1' },
            { attr: 'property', key: 'og:title', value: pageTitle },
            { attr: 'property', key: 'og:description', value: description },
            { attr: 'property', key: 'og:type', value: 'profile' },
            { attr: 'property', key: 'og:site_name', value: siteName },
            { attr: 'property', key: 'og:url', value: canonicalUrl },
            { attr: 'property', key: 'og:image', value: ogImage },
            { attr: 'property', key: 'og:locale', value: 'ko_KR' },
            { attr: 'name', key: 'twitter:card', value: 'summary_large_image' },
            { attr: 'name', key: 'twitter:title', value: pageTitle },
            { attr: 'name', key: 'twitter:description', value: description },
            { attr: 'name', key: 'twitter:image', value: ogImage }
        ];

        metaDefinitions.forEach(meta => upsertMeta(meta.attr, meta.key, meta.value));

        const existingCanonical = document.querySelector('link[rel="canonical"]');
        const canonicalCreated = !existingCanonical;
        const previousCanonicalHref = existingCanonical?.getAttribute('href') || '';
        const canonicalLink = existingCanonical || document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        canonicalLink.setAttribute('href', canonicalUrl);
        if (canonicalCreated) {
            document.head.appendChild(canonicalLink);
        }

        const personData = {
            "@type": "Person",
            "name": "김원정",
            "alternateName": "NARUBROWN",
            "jobTitle": "AI Engineer",
            "email": "mailto:ruffmadman@kakao.com",
            "url": canonicalUrl,
            "image": ogImage,
            "knowsAbout": [
                "LLM 기반 AI 서비스 설계와 평가",
                "멀티홉 RAG의 DAG 실행과 검색 스케줄링 최적화",
                "온톨로지와 지식 그래프 설계",
                "OCR과 VLM 기반 문서 처리 및 모델 평가",
                "YOLO 기반 이미지 분리 모델 구현",
                "Go 백엔드 프레임워크와 DI, 요청 Pipeline 설계",
                "FastAPI, React, Spring Boot, NestJS 기반 서비스 개발",
                "운영 관측과 성능 최적화"
            ],
            "alumniOf": [
                {
                    "@type": "CollegeOrUniversity",
                    "name": "인천대학교"
                },
            ],
            "sameAs": [
                "https://github.com/NARUBROWN",
                "https://linkedin.com/in/naru-brown"
            ]
        };

        const structuredData = {
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            "name": pageTitle,
            "description": description,
            "url": canonicalUrl,
            "isPartOf": {
                "@type": "WebSite",
                "name": siteName,
                "url": "https://na2ru2.me"
            },
            "mainEntity": personData,
            "about": personData,
            "breadcrumb": "홈 > About"
        };

        const existingLd = document.getElementById('about-structured-data');
        const ldCreated = !existingLd;
        const previousLdContent = existingLd?.textContent || '';
        const ldScript = existingLd || document.createElement('script');
        ldScript.type = 'application/ld+json';
        ldScript.id = 'about-structured-data';
        ldScript.textContent = JSON.stringify(structuredData);
        if (ldCreated) {
            document.head.appendChild(ldScript);
        }

        document.title = pageTitle;

        return () => {
            document.title = defaultTitle;
            createdMeta.forEach(meta => meta.remove());
            previousMetaContent.forEach((content, meta) => {
                if (content) {
                    meta.setAttribute('content', content);
                } else {
                    meta.removeAttribute('content');
                }
            });

            if (canonicalCreated) {
                canonicalLink.remove();
            } else if (previousCanonicalHref) {
                canonicalLink.setAttribute('href', previousCanonicalHref);
            } else {
                canonicalLink.removeAttribute('href');
            }

            if (ldCreated) {
                ldScript.remove();
            } else {
                ldScript.textContent = previousLdContent;
            }
        };
    }, []);

    const skillCategories = [
        {
            title: "프로그래밍 언어",
            skills: [
                { name: 'Java', icon: '☕', tags: ['프로젝트 경험 있음', '실무 경험 있음'], level: '중' },
                { name: 'JavaScript', icon: '🟡', tags: ['프로젝트 경험 있음', '실무 경험 있음'], level: '중' },
                { name: 'TypeScript', icon: '💙', tags: ['프로젝트 경험 있음', '실무 경험 있음'], level: '중' },
                { name: 'Go', icon: '🐹', tags: ['프로젝트 경험 있음', '실무 경험 있음'], level: '중' }
            ]
        },
        {
            title: "프레임워크",
            skills: [
                { name: 'Spring Boot', icon: '🌱', tags: ['프로젝트 경험 있음', '실무 경험 있음'], level: '상' },
                { name: 'NestJS', icon: '🦁', tags: ['프로젝트 경험 있음', '실무 경험 있음'], level: '상' },
                { name: 'FastAPI', icon: '⚡', tags: ['프로젝트 경험 있음'], level: '상' },
                { name: 'echo', icon: '🌐', tags: ['실무 경험 있음'], level: '중' }
            ]
        },
        {
            title: "데이터베이스",
            skills: [
                { name: 'MySQL', icon: '🐬', tags: ['프로젝트 경험 있음', '실무 경험 있음'], level: '중' },
                { name: 'PostgreSQL', icon: '🐘', tags: ['프로젝트 경험 있음', '실무 경험 있음'], level: '하' },
                { name: 'Redis', icon: '🟥', tags: ['프로젝트 경험 있음', '실무 경험 있음'], level: '중' }
            ]
        },
        {
            title: "DevOps & 기타",
            skills: [
                { name: 'Docker / Compose', icon: '🐳', tags: ['프로젝트 경험 있음', '실무 경험 있음'], level: '중' },
                { name: 'Jenkins / GitHub Actions', icon: '⚙️', tags: ['프로젝트 경험 있음', '실무 경험 있음'], level: '중' },
                { name: 'Kafka / RabbitMQ', icon: '📡', tags: ['프로젝트 경험 있음', '실무 경험 있음'], level: '중' },
                { name: 'JPA / TypeORM', icon: '🧰', tags: ['프로젝트 경험 있음', '실무 경험 있음'], level: '중' },
                { name: 'Knex.js', icon: '🛠️', tags: ['실무 경험 있음'], level: '상' }
            ]
        }
    ];

    const experience = [
        {
            date: '2026.05 ~ 현재',
            type: '정규직',
            title: 'AI Engineer',
            company: '(주)리빗, 판교',
            description: [
                '사내 OCR 검수 시스템을 개발하고, 문서 분리와 판독성 평가를 위한 AI 파이프라인 및 풀스택 기능을 구현',
                'LCA 환경영향 산정 시스템과 TANSOLUTION 탄소 관리 서비스의 백엔드 개발 담당',
                '다양한 사내 자료를 검색하고 추론하는 멀티홉 RAG 챗봇과 검색 실행 흐름을 최적화'
            ],
            techs: ['Go', 'Spine', 'Playwright', 'YOLO', 'VLM', 'OCR', 'LoRA', 'FastAPI', 'NestJS']
        },
        {
            date: '2025.07 ~ 2026.04',
            type: '정규직',
            title: 'AI Engineer 및 Back-End Engineer',
            company: '(주)셈웨어, 서울 금천구',
            description: [
                '교육과정 PDF를 바탕으로 온톨로지와 지식 그래프를 구축하는 파이프라인 설계 및 구현',
                'Map-Reduce 기반 LLM 추출, RAG, OCR 파이프라인으로 교육용 AI 서비스 개발',
                'Apache Jena Fuseki와 RDF-star 기반 온톨로지 저장소, 검증 및 롤백 구조 설계',
                'Redis Pub/Sub 기반 다중 서버 실시간 대기방 아키텍처 설계 및 OpenTelemetry + Jaeger 기반 E2E 트레이싱 구축'
            ],
            techs: ['FastAPI', 'LLM', 'RAG', 'OCR', 'Apache Jena Fuseki', 'RDF-star', 'Redis', 'OpenTelemetry', 'Jaeger']
        },
        {
            date: '2024.10 ~ 2025.06',
            type: '정규직',
            title: 'Back-End Engineer',
            company: '(주)스카우트, 서울 강남구',
            description: [
                '보너스잡 포커스 게재 상품화 및 포인트 결제/회계 도메인 설계',
                '사내 인사관리 시스템과 OIDC를 지원하는 OAuth 기반 사내 인증 시스템 개발',
                'JPA 기반 RESTful 구조로 레거시 프로시저 코드 리팩토링',
                '서비스 계층 도입과 DI 표준화로 유지보수성 개선'
            ],
            techs: ['JPA', 'Spring Boot', 'Refactoring']
        },
        {
            date: '2024.01 ~ 2024.02',
            type: '인턴',
            title: 'Back-End Engineer',
            company: '(주)모베란, 인천 연수구',
            description: [
                '국회 정책 세미나 실시간 전달 시스템 백오피스 API 개발'
            ],
            techs: ['API Development', 'Backoffice']
        },
        {
            date: '2020.12 ~ 2021.06',
            type: '기술 직무',
            title: '정보체계운용관',
            company: '육군',
            description: [
                'PowerShell로 Windows 보안 설정을 점검하고 조치하는 절차를 자동화했으며 HTML과 JavaScript 보고서를 구현',
                '자동화 도입 후 군단 보안평가 최우수 등급 획득'
            ],
            techs: ['PowerShell', 'Windows', 'HTML', 'JavaScript']
        }
    ];

    const summaryMeta = [
        {
            label: '포지션',
            value: 'AI Engineer',
            note: 'LLM, OCR, VLM, 백엔드'
        },
        {
            label: '담당 업무',
            value: 'AI 기능과 백엔드 시스템 개발',
            note: 'OCR과 VLM, 멀티홉 RAG, LCA와 탄소관리'
        },
        {
            label: '문서 VLM 평가',
            value: '난독 영역 탐지 20%→80%',
            note: '20장, 30개 영역 평가에서 사람 판단 일치율 66.7%→80%'
        },
        {
            label: '핵심 역량',
            value: 'AI 시스템과 백엔드 설계',
            note: '멀티홉 RAG, OCR과 VLM, Spine'
        }
    ];

    const summaryTiles = [
        {
            title: '경력 스냅샷',
            tag: '리빗 재직 중, 4개사 실무 경험',
            icon: <Activity size={18} />,
            bullets: [
                '리빗에서 OCR 검수와 LCA 및 탄소관리 서비스 개발',
                'AI 검색과 추론부터 Go 프레임워크 Spine까지 설계하고 개선',
                '교육용 AI, 사내 인사관리 시스템, OIDC 인증 및 백엔드 플랫폼 개발 경험'
            ],
            link: '#experience',
            accent: 'indigo'
        },
        {
            title: '주요 프로젝트',
            marqueeItems: [
                'YOLO 기반 문서 분리와 OCR 감사 자동화',
                '문서 VLM 판독성 평가와 LoRA 튜닝',
                'Spine: Go 프레임워크'
            ],
            icon: <Layers size={18} />,
            bullets: [
                'YOLO 기반 문서 분리와 OCR 검수 자동화',
                '문서 VLM 판독성 평가와 LoRA 튜닝',
                'Spine 프레임워크 설계, GitHub 스타 100개와 Microgrant 지원사업 선정'
            ],
            link: '#professional-projects',
            accent: 'violet'
        },
        {
            title: '학력',
            tag: '컴퓨터공학 기반',
            icon: <BookOpen size={18} />,
            bullets: [
                '인천대학교 컴퓨터공학부 (2023.03~2025.02), 공학사',
            ],
            link: '#education',
            accent: 'teal'
        },
    ];

    const professionalProjects = [
        {
            date: '2026.05 ~',
            title: 'ERP 자동화 및 문서 OCR 감사',
            role: 'AI Engineer',
            org: '(주)리빗',
            summary: '문서 영역 분리와 OCR 판독을 거쳐 사내 ERP 등록 값과 대조하는 검수 흐름을 개발했습니다.',
            techs: ['Go', 'Spine', 'HTMX', 'Playwright', 'YOLO', 'VLM', 'OCR'],
            problems: [
                '한 장에 여러 문서가 함께 찍히고 종이와 배경의 경계가 희미해, OCR 전에 문서별 영역을 분리할 필요가 있었음',
                'ERP 수치와 OCR 결과를 사람이 직접 대조하면 반복 작업이 많고 감사 누락 가능성이 있었음'
            ],
            solutions: [
                '실제 이미지 1,398장에 문서 영역 2,634개와 낙서 1,480개의 바운딩박스를 라벨링해 학습 데이터를 구성했음',
                '합성 데이터 검토 후 YOLOv8-N/S를 학습하고, 1280×1280 입력으로 문서별 영역을 분리해 OCR에 전달했음',
                'Spine 기반 Go 백엔드와 HTMX 화면을 구성하고, Playwright로 ERP 자동화 흐름과 OCR 검수 결과를 연결했음'
            ],
            results: [
                '검증 이미지 280장, 정답 객체 801개에서 mAP50 88.24%(문서 96.89%, 낙서 79.60%)를 기록했음',
                '낙서 탐지와 경계 정밀도는 추가 개선 과제로 확인했음',
                '문서 단위 OCR과 ERP 값 자동 대조 흐름을 구현해 반복 검수 업무를 줄였음'
            ]
        },
        {
            date: '2026.09',
            title: '문서 VLM 판독성 평가 및 LoRA 튜닝',
            role: 'AI Engineer',
            org: '(주)리빗',
            summary: 'VLM의 문서 판독 신뢰도가 실제 읽기 어려움과 어긋나는 문제를 분석하고, 사람 판단 데이터로 판독성 분류를 개선했습니다.',
            techs: ['VLM', 'LoRA', 'OCR', 'Vision ML'],
            problems: [
                '읽기 어려운 영역에도 VLM이 높은 신뢰도를 부여해, 자동 판정만으로 재검토 대상을 고르기 어려웠음'
            ],
            solutions: [
                '사람이 판정한 확신도를 기준으로 학습 데이터를 구성하고 LoRA 튜닝을 진행했음',
                '별도 문서 단위 모델을 학습하고 LoRA 병합 및 INT4 저장을 진행했음'
            ],
            results: [
                '20장, 30개 영역 평가에서 읽기 어려운 영역 탐지율은 2/10에서 8/10으로, 사람 판단 일치율은 66.67%에서 80%로 높아졌음'
            ]
        },
        {
            date: '2026.05 ~ 2026.09',
            title: '멀티홉 RAG 실행 최적화',
            role: 'AI Engineer',
            org: '(주)리빗',
            summary: '문서와 이미지, 프레젠테이션 자료에서 멀티홉 질문의 근거를 단계적으로 검색하고 실행 순서와 대기 시간을 최적화한 챗봇입니다.',
            techs: ['FastAPI', 'React', 'PostgreSQL', 'ChromaDB', 'AgenticRAG', 'FRAMES', 'LLM'],
            problems: [
                '일반 RAG는 여러 문서의 근거를 찾아 조합해야 하는 멀티홉 질문에서 검색 누락과 근거 조합 실패가 자주 발생했음',
                'AgenticRAG 계열 접근은 어려운 질문에 강하지만 지연 시간이 길어 엔터프라이즈 서비스에 그대로 적용하기 어려웠음',
                '고성능 모델을 반복 호출하면 비용이 커져 실제 서비스 운영 비용을 감당하기 어려웠음'
            ],
            solutions: [
                '이벤트 기반 DAG로 검색과 답변 생성의 의존 관계를 표현하고, 선행 결과를 기다리는 구간과 검색 자원 대기를 함께 다뤘음',
                '부모 슬롯이 처리되는 동안 후보 문서를 미리 찾는 투기적 검색을 적용했음. 부모 값이 확정된 뒤에는 계획과 이름 또는 별칭이 맞는 결과만 캐시에 반영하고 원문 판독과 근거 검증은 유지했음',
                '전역 동시 검색 상한 20개 중 선행 검색은 최대 15개로 제한하고, 오래 기다린 작업의 우선순위를 높여 필수 검색이 밀리지 않도록 조정했음',
                '초과 검색을 버리지 않고 대기시킨 뒤 필요한 결과를 기다리도록 변경했으며 검색, 판독, 스케줄링을 하나의 파이프라인으로 연결했음'
            ],
            results: [
                'FRAMES 무작위 100문항을 5개 워커로 평가해 이전 버전 대비 평균 응답 시간을 126.90초에서 90.41초로 28.8%, p90을 235.01초에서 143.35초로 39.0% 줄였음',
                '100문항 모두 오류나 타임아웃 없이 완료됐고 전역 동시 실행 상한 20개를 지켰음',
                '같은 문항 기준 정확도는 74%에서 64%로 낮아지고 비용은 92.3% 늘었음. 검색, 판독, 스케줄링을 함께 바꾼 전체 구성의 비교라 각 요소의 단독 효과는 분리되지 않았음'
            ]
        },
        {
            date: '2025.07 ~ 2026.04',
            title: '사내 교육 진단 AI 플랫폼',
            role: 'AI Engineer',
            org: '(주)셈웨어',
            summary: '교육과정 문서와 학습 데이터를 바탕으로 개념 간 관계를 구조화하고, 학습 상태를 진단할 수 있도록 지원하는 내부 AI 프로젝트입니다.',
            techs: ['FastAPI', 'Apache Jena Fuseki', 'RDF-star', 'SQLite', 'LLM', 'OCR', 'Ontology', 'Knowledge Graph'],
            problems: [
                '교육과정 문서만으로는 개념 간 위계와 선수 관계를 일관되게 구조화하기 어려워, 학습 결과를 원인 중심으로 해석하는 데 한계가 있었음',
                '문서 추출 결과를 그대로 반영하면 누락이나 오분류가 섞일 수 있어, 사람이 검토 가능한 안정적 생성 절차가 필요했음'
            ],
            solutions: [
                '도메인 구조와 관계 기준은 사람이 먼저 정의하고, 문서 기반 개념 추출과 관계 제안은 AI가 보조하도록 역할을 분리했음',
                '대용량 문서를 나누어 병렬 처리하고 단계별로 검증해 누락과 오분류를 줄이는 파이프라인을 설계했음',
                '보조 문서와 근거 문맥을 함께 연결해 관계 제안의 설명 가능성을 높였음',
                '규칙 검증, 검토 승인, 롤백 가능한 반영 절차를 두어 운영 안정성을 확보했음'
            ],
            results: [
                '교육과정 문서를 지식 그래프 형태로 구조화하고, 학습 결과를 개념 단위로 해석할 수 있는 기반을 마련했음',
                '문서 추출 품질과 구조적 일관성을 높여 서비스 운영에 적용 가능한 수준의 데이터 파이프라인을 구축했음',
                'AI 생성 결과에 대한 검증 및 승인 절차를 정립해 정확성과 운영 안정성을 함께 확보했음'
            ]
        },
        {
            date: '2025.07 ~ 2026.04',
            title: '사내 워크북 생성 AI 플랫폼',
            role: 'AI Engineer',
            org: '(주)셈웨어',
            summary: '교육과정 문서를 분석해 학년과 과목에 맞는 학습 자료를 자동 생성하고 렌더링하는 내부 AI 프로젝트입니다.',
            techs: ['FastAPI', 'PostgreSQL', 'SQLAlchemy', 'ChromaDB', 'PyMuPDF', 'Playwright', 'OpenRouter', 'RAG'],
            problems: [
                '긴 교육과정 문서에서 필수 기준 정보를 안정적으로 추출해야 했고, 단순 검색 기반 접근만으로는 필요한 정확도를 확보하기 어려웠음',
                '한 문서 안에 여러 수준의 정보가 혼재해 있어 학년과 과목 기준으로 다시 구조화하는 과정이 복잡했음',
                '유사 키워드가 반복되어 문맥이 다른 내용이 함께 섞이지 않도록 제어할 필요가 있었음'
            ],
            solutions: [
                '긴 문서를 구간 단위로 나눠 병렬 처리하고, 누락 검사를 통해 필요한 구간만 재처리하도록 설계했음',
                '내용 추출, 기준 연결, 결과 생성 단계를 분리해 AI가 맡는 작업의 책임을 명확히 했음',
                '검색 단계에서 학년, 과목, 영역의 맥락을 함께 반영해 문맥 혼입을 줄였음',
                '문서 업로드부터 결과물 생성과 렌더링까지 자동화된 파이프라인으로 연결했음'
            ],
            results: [
                '긴 문서를 안정적으로 처리할 수 있는 자동 생성 파이프라인을 구축했음',
                '학년과 과목 맥락이 섞이지 않도록 구조화해 결과물 품질과 일관성을 높였음',
                '토큰 사용량과 처리 비용을 줄이면서도 생성 품질을 개선했음',
                '문서 업로드 이후 결과물 생성까지 이어지는 end-to-end 자동화 흐름을 구현했음'
            ]
        },
        {
            date: '2025.07 ~ 2026.01',
            title: 'SteamUp Academy',
            role: 'Backend Engineer',
            org: '(주)셈웨어',
            summary: '수학, 과학, 코딩, 예술을 아우르는 디지털 STEAM 수업 플랫폼으로 실시간 양방향 수업과 코스웨어를 제공하고 맞춤형 강의 제작과 학급 관리를 지원합니다.',
            techs: ['Go', 'Echo', 'WebSocket', 'Redis', 'Redis Pub/Sub', 'PostgreSQL'],
            problems: [
                'WebSocket 기반 실시간 클래스룸에서 다중 서버를 고려하지 않아 입장과 퇴장, 좌석 선택 시 상태 충돌과 중복 처리 위험이 있었음',
                '단일 Handler에 비즈니스 로직, DB 접근, 응답 스키마가 섞인 1-Tier 구조라 테스트와 확장이 어려웠음'
            ],
            solutions: [
                '다중 서버 환경을 전제로 실시간 대기방 아키텍처 재설계',
                'Redis Pub/Sub 이벤트 스트림으로 모든 서버 인스턴스 간 상태 동기화',
                '스냅샷 + Delta 전략으로 전체 상태 반복 전송을 제거',
                '좌석 선택 등 경쟁 구간에 Redis 분산락을 적용해 단일 반영 보장',
                'Handler, Service, DB로 이어지는 3계층 아키텍처로 전면 재정비',
                '객체 생성과 의존성 연결을 중앙화하고 Service 계층을 순수 비즈니스 로직 전용으로 분리',
                '레거시를 유지하며 단계적으로 신규 구조로 마이그레이션'
            ],
            results: [
                '수십 명 동시 접속에서도 상태 충돌 없는 고신뢰 실시간 클래스룸 구현',
                '다중 인스턴스 환경에서도 데이터 무결성 유지',
                '테스트 가능한 구조 확보로 신규 기능 개발 속도 및 코드 안정성 향상',
                '수평 확장을 전제로 한 실시간 백엔드 아키텍처 기반 마련'
            ],
            serviceUrl: 'https://www.steamup.academy/ko/'
        },
        {
            date: '2025.07 ~ 2025.12',
            title: 'AlgeoMath',
            role: 'Backend Engineer',
            org: '(주)셈웨어',
            summary: '한국과학창의재단이 개발한 수학 탐구형 온라인 도구로 대수와 기하 시각화, 2D/3D 수학 실습, 블록코딩 학습, 수업 자료 제작과 과제 관리를 지원합니다.',
            techs: ['NestJS', 'RabbitMQ', 'Knex.js', 'mySQL', 'JMeter', 'Kubernetes', 'OpenTelemetry', 'Jaeger'],
            problems: [
                '모놀리식 구조로 서비스 간 결합도가 높고 장애 전파 범위가 큼',
                'MSA 전환 이후에도 성능 한계 지점과 HPA 기준이 불명확',
                '로그인 로직에 핵심 처리와 부가 기능이 뒤섞여 유지보수성 저하',
                '실시간 DB 쿼리 성능 모니터링 부재로 Slow Query를 사후 인지'
            ],
            solutions: [
                '모놀리식을 마이크로서비스 아키텍처로 전환하고 RabbitMQ 기반 EDA 도입',
                '서비스 간 직접 호출을 제거해 독립 배포와 확장이 가능한 구조를 확립',
                'JMeter 성능 테스트 시나리오로 서비스별 SLO 정의 및 HPA 스케일 기준 튜닝',
                '로그인 프로세스를 NestJS Interceptor 기반으로 재설계해 인증 로직과 부가 기능(로그 기록, 보상 지급) 분리',
                'Knex.js Event Emitter를 활용해 Slow Query 감지 시스템을 구축하고, 100ms 초과 쿼리의 SQL과 실행 시간, 호출 API를 자동 기록',
                'OpenTelemetry + Jaeger로 서비스 호출 트레이싱'
            ],
            results: [
                '서비스 간 결합도 감소 및 장애 격리 가능 구조 확보',
                '트래픽 변화에 유연하게 대응하는 자동 확장 환경 구축',
                '로그인 로직 책임 분리로 유지보수성과 확장성 향상',
                'DB 성능 병목을 사전에 식별하는 관측 가능성 확보',
                'MSA의 성능과 운영, 관측 정보를 통합 관리할 수 있는 플랫폼으로 고도화'
            ],
            serviceUrl: 'https://www.algeomath.kr/algeo/main'
        },
        {
            date: '2024.10 ~ 2025.06',
            title: '보너스잡',
            role: 'Back-End Engineer',
            org: '(주)스카우트',
            summary: '취업 시 축하금과 추천 보상금을 제공하며 직종별 채용공고 검색, 지원, 추천 보상 기능을 결합한 보상형 채용 플랫폼입니다.',
            techs: ['Java', 'Spring Boot', 'JPA', 'mySQL', 'MakeBill API'],
            problems: [
                '계약 기업만 공고를 등록하는 대행형 B2B 채용 서비스 구조로 인해 확장성 한계',
                '유료 노출, 결제, 환불, 회계 처리가 수작업 중심으로 운영 부담 발생'
            ],
            solutions: [
                '모든 기업이 직접 공고를 등록할 수 있는 셀프 서비스 채용 구조로 전환',
                '포커스 게재(메인 노출) 유료 상품 도입',
                '포인트 충전, 차감, 환불 도메인 설계 및 상태 모델링',
                '포인트 상태를 통합하고 세분화해 결제 및 환불 흐름을 안정화',
                'MakeBill API를 연동해 세금계산서 발행, 재전송, 취소를 자동화',
                '슈퍼 유저 권한 기반 입금 확정 로직 구현',
                '다중 상태 검색과 통계 API를 제공해 회계 및 정산 업무를 간소화'
            ],
            results: [
                '유료 상품 기반 수익 모델 확보',
                '결제와 정산, 회계 업무를 자동화한 B2B 채용 플랫폼 구축',
                '운영 인력 의존도 감소 및 서비스 확장성 향상'
            ],
            serviceUrl: 'https://www.bonusjob.co.kr'
        },
        {
            date: '2024.10 ~ 2025.06',
            title: '스카우트 글로벌',
            role: 'Back-End Engineer',
            org: '(주)스카우트',
            techs: ['Java', 'Spring Boot', 'JPA', 'QueryDSL', 'mySQL'],
            summary: 'AI 기반 맞춤 채용, 스카우터 커리어 컨설팅, 취업과 추천 보상으로 구직자와 기업을 연결하는 국내 대표 온라인 HR 채용 플랫폼입니다.',
            problems: [
                '외국인 취업 공고를 제공하는 신규 서비스에서 복잡한 조회 조건으로 인한 API 응답 지연 및 잦은 DB 접근 문제 발생',
                '신규 서비스임에도 초기부터 확장성과 유지보수성을 고려한 구조 필요'
            ],
            solutions: [
                'Spring Boot와 JPA 기반으로 도메인, 레포지토리, 서비스 계층을 명확히 분리',
                'RESTful 규약을 준수한 CRUD API 설계',
                'QueryDSL을 활용해 다중 쿼리를 단일 쿼리로 통합',
                '중복 로직 제거 및 불필요한 DB 접근 최소화'
            ],
            results: [
                'API 응답 속도 개선',
                'DB 접근 횟수 약 50% 감소',
                '신규 글로벌 서비스의 안정적인 초기 운영 기반 확보'
            ],
            serviceUrl: 'https://www.scout.co.kr'
        },
        {
            date: '2024.10 ~ 2025.06',
            title: '클린베테랑',
            role: 'Back-End Engineer',
            org: '(주)스카우트',
            summary: '스카우트가 운영하는 홈케어 플랫폼으로, 검증된 매니저가 가정과 사업장을 청소하고 공간 소독과 생활편의 서비스를 앱으로 맞춤 제공합니다.',
            techs: ['Java', 'Spring Boot', 'JPA', 'mySQL'],
            problems: [
                'DB 프로시저 및 함수 직접 호출로 인한 높은 DB 종속성',
                'Controller 레벨에서 직접 객체 생성 등 비표준 구조로 오류 추적 및 유지보수 어려움'
            ],
            solutions: [
                'DB 프로시저 기반 로직을 JPA + Service 계층 중심 구조로 전환',
                'RESTful API로 재설계',
                '@GetMapping, @PostMapping 등 명확한 HTTP 메서드 매핑 적용',
                'Spring DI 도입으로 객체 생성 책임 분리',
                'Controller 코드 정리 및 중복 어노테이션 제거'
            ],
            results: [
                'Controller 코드 약 20% 이상 정리',
                'DB 의존성 및 DB 호출량 감소',
                '코드 가독성과 유지보수성, 협업 효율 향상',
                '신규 기능 추가 시 개발 리드타임 단축'
            ],
            serviceUrl: 'https://helper.veteranscout.co.kr/'
        },
        {
            date: '2024.10 ~ 2025.06',
            title: '통합 모니터링 & 관측 시스템',
            role: 'Back-End Engineer',
            org: '(주)스카우트',
            summary: '온프레미스와 클라우드를 아우르는 통합 모니터링 및 알림 스택 구축',
            techs: ['Docker', 'Prometheus', 'Grafana', 'cAdvisor', 'Windows Exporter', 'AWS EC2'],
            problems: [
                '체계적인 시스템 모니터링 환경 부재로 장애 인지 지연',
                '온프레미스와 클라우드 환경이 분리되어 인프라 가시성 부족',
                '클라우드 비용 사용 현황 파악 어려움'
            ],
            solutions: [
                '컨테이너 기반 환경을 전제로 통합 모니터링 아키텍처 직접 설계 및 구축',
                'cAdvisor, Prometheus, Grafana, Windows Exporter 기반 스택 구성',
                '온프레미스 + AWS EC2 환경 통합 모니터링',
                'Docker Compose를 활용한 모니터링 스택 배포 자동화',
                'Prometheus Alert Manager 연동으로 장애 발생 시 즉각 알림',
                'Grafana 대시보드 템플릿화로 유지보수성과 확장성 확보'
            ],
            results: [
                '서버와 컨테이너, DB 상태를 실시간으로 파악할 수 있는 관측 환경 구축',
                '장애 대응 속도 및 운영 안정성 향상',
                '클라우드 비용 최적화를 위한 가시성 기반 마련'
            ]
        },
        {
            date: '2024.01 ~ 2024.02',
            title: '국회 정책 세미나 실시간 전달 시스템 백오피스 개발',
            role: 'Back-End Engineer',
            org: '(주)모베란',
            summary: '국회 정책 세미나 실시간 전달을 지원하는 백오피스 API 백엔드',
            techs: ['Java', 'Spring Boot', 'mySQL'],
            problems: [
                '국회 정책 세미나 실시간 전달 시스템 운영을 위한 백오피스 API 부재',
                '운영 데이터를 관리하고 상태를 안정적으로 조회할 수 있는 서버 구조 필요'
            ],
            solutions: [
                '실시간 전달 시스템 운영을 지원하는 백오피스 API 설계 및 구현',
                '흩어져 있던 엔드포인트를 통합하고 RESTful 규약에 맞게 구조 정비',
                '운영 환경을 고려해 서버 구조 단순화 및 불필요 흐름 제거로 응답 성능 개선'
            ],
            results: [
                '실제 세미나 운영에 사용 가능한 백오피스 API 구축',
                '안정성과 일관성, 관리 편의성을 고려한 서버 설계 경험 확보',
                '실시간 시스템을 운영하는 백엔드 개발 실무 경험 축적'
            ]
        }
    ];

    const personalProjects = [
        {
            date: '2026.01 ~ 진행중',
            title: 'Spine: Go 백엔드 프레임워크',
            role: '주요 유지보수자, 설계 및 개발',
            desc: [
                '생성자에 필요한 의존성을 명시하고 DI 컨테이너로 구성 요소를 연결하는 구조를 설계.',
                'HTTP, Event, WebSocket 요청 실행 흐름을 Pipeline으로 구성해 처리 순서가 코드에 드러나도록 개발.',
                '2026년 9월 GitHub 100스타를 달성했고, 선린인터넷고 AnA 동아리와 국내 기업 2곳의 내부 서비스에서 사용된 이력이 있음.',
                '2026년 10월 FOSS for All Microgrant 지원사업에 선정되어 지원을 받음.'
            ],
            techs: ['Go', 'Dependency Injection', 'HTTP', 'Event', 'WebSocket', 'Pipeline'],
            serviceUrl: 'https://spine.na2ru2.me/ko/',
            serviceUrlLabel: '프로젝트 문서 보기'
        },
        {
            date: '2025.12 ~ 2026.05',
            title: '뽑기팡',
            role: 'Backend and AI Tech Lead',
            desc: [
                '전국 뽑기방 지도, 인증, 중고거래 통합 플랫폼에서 백엔드와 AI 개발을 리드.',
                'NestJS 기반 API 서버와 MySQL 데이터 모델을 설계하고 위치 기반 검색, 방문 인증, 제보 흐름을 구현.',
                '객체 탐지, 이미지 후보 검색, AI 검증을 연결한 라벨링 파이프라인을 만들고 라벨 오류와 데이터 분포를 분석해 학습 데이터를 개선.',
                '한국어 채팅의 위험 발화를 문맥에 따라 분류하는 모델을 학습하고 평가했으며 GCP에서 App과 DB를 분리하고 AI 확장을 고려한 구조를 설계.'
            ],
            contributions: [
                { label: 'Backend', value: '100%' },
                { label: 'AI', value: '100%' }
            ],
            techs: [
                'TypeScript',
                'NestJS',
                'MySQL',
                'TypeORM',
                'GCP Compute Engine',
                'Docker',
                'YOLOv8',
                'BERT',
                'Python',
                'FastAPI',
                'Dependency Injector'
            ],
            links: { github: 'https://github.com/ppopgi-pang' }
        },
    ];

    const handleSummaryToggle = () => {
        if (showSummary) summaryButtonRef.current?.focus();
        setShowSummary(!showSummary);
    };

    return (
        <div className="about-page">
            <div className="about-hero">
                <div className="about-content">
                    <div className="hero-eyebrow"><span>AI ENGINEER</span><span className="hero-status">리빗 재직 중</span></div>
                    <h1>
                        안녕하세요, <span style={{ color: 'var(--color-primary)' }}>김원정</span>입니다.
                    </h1>
                    <p className="hero-intro">
                        세상의 문제를 인공지능으로 해결하는 인공지능 엔지니어입니다.
                    </p>
                    <div className="hero-actions">
                        <button ref={summaryButtonRef} className="btn-hero-summary" onClick={handleSummaryToggle} aria-expanded={showSummary} aria-controls="about-summary">
                            <Layers size={18} />
                            한 눈에 보기
                        </button>
                        <a className="btn-hero-secondary" href="#contact">
                            <Mail size={18} />
                            연락하기
                        </a>
                    </div>
                </div>
            </div>

            <nav className="about-nav" aria-label="소개 페이지 섹션">
                <a href="#experience">경력</a>
                <a href="#professional-projects">실무 프로젝트</a>
                <a href="#personal-projects">개인 프로젝트</a>
                <a href="#activities">활동</a>
                <a href="#education">학력</a>
                <a href="#contact">연락하기</a>
            </nav>

            <div className="content-container">
                <section hidden={!showSummary} className="summary-section" id="about-summary" ref={summaryRef}>
                        <button className="summary-close" onClick={handleSummaryToggle} aria-label="요약 닫기">
                            ✕
                        </button>
                        <div className="summary-header">
                            <span className="summary-chip">한 눈에 보기</span>
                            <div className="summary-divider" aria-hidden="true"></div>
                            <div>
                                <h2>경력과 대표 프로젝트를 한눈에 살펴보세요.</h2>
                                <p>AI 기능을 제품에 연결하고, 이를 뒷받침하는 시스템을 설계해 온 경험을 담았습니다.</p>
                            </div>
                        </div>

                        <div className="summary-meta">
                            {summaryMeta.map((item, idx) => (
                                <div key={idx} className="summary-meta-card">
                                    <span className="summary-meta-label">{item.label}</span>
                                    <div className="summary-meta-value">{item.value}</div>
                                    <span className="summary-meta-note">{item.note}</span>
                                </div>
                            ))}
                        </div>

                        <div className="summary-grid">
                            {summaryTiles.map((tile, idx) => (
                                <div key={idx} className={`summary-card accent-${tile.accent}`}>
                                    <div className="summary-card-head">
                                        <div className="summary-icon">{tile.icon}</div>
                                        <span className="summary-tag">{tile.marqueeItems ? `${tile.marqueeItems.length}개 대표 프로젝트` : tile.tag}</span>
                                    </div>
                                    <h3>{tile.title}</h3>
                                    <ul>
                                        {tile.bullets.map((bullet, i) => (
                                            <li key={i}>{bullet}</li>
                                        ))}
                                    </ul>
                                    <a className="summary-link" href={tile.link}>
                                        자세히 보기 <ExternalLink size={14} />
                                    </a>
                                </div>
                            ))}
                        </div>
                </section>

                <section className="experience-section" id="experience">
                    <div className="about-section-heading">
                        <h2 className="section-title">경력</h2>
                    </div>
                    <div className="timeline">
                        {experience.map((item, index) => (
                            <div className="timeline-item" key={index}>
                                <div className="timeline-dot"></div>
                                <div className="timeline-content">
                                    <div className="timeline-header">
                                        <span className="timeline-date">{item.date}</span>
                                        <span className="timeline-type">{item.type}</span>
                                        <h3 className="timeline-title">{item.title}</h3>
                                        <h4 className="timeline-company">{item.company}</h4>
                                    </div>

                                    <div className="timeline-techs">
                                        {item.techs.map((tech, i) => (
                                            <span key={i} className="tech-badge-sm">{tech}</span>
                                        ))}
                                    </div>

                                    <div className="timeline-desc">
                                        <ul>
                                            {item.description.map((desc, i) => (
                                                <li key={i}>{desc}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="projects-section" id="professional-projects">
                    <div className="about-section-heading">
                        <h2 className="section-title">실무 프로젝트</h2>
                    </div>
                    <div className="projects-grid">
                        {professionalProjects.map((project, index) => (
                            <div className="project-card" key={index}>
                                <div className="project-content">
                                    {project.date && <span className="project-date">{project.date}</span>}
                                    <h3 className="project-title">{project.title}</h3>
                                    {project.role && <div className="project-role">{project.role}</div>}
                                    {project.summary && <p className="project-summary">{project.summary}</p>}
                                    {project.org && <div className="project-org">{project.org}</div>}
                                    {project.desc && <p className="project-desc">{project.desc}</p>}
                                    <div className="project-techs">
                                        {project.techs.map(tech => (
                                            <span key={tech} className="tech-badge">{tech}</span>
                                        ))}
                                    </div>
                                    {project.results && (
                                        <div className="project-list-block project-results">
                                            <div className="project-section-label">성과</div>
                                            <ul className="project-list">
                                                {project.results.map((item, i) => (
                                                    <li key={i}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {(project.problems || project.solutions) && (
                                        <details className="project-details">
                                            <summary>문제 해결 과정 <ChevronDown size={16} /></summary>
                                            <div className="project-details-body">
                                                {project.problems && (
                                                    <div className="project-list-block">
                                                        <div className="project-section-label">문제</div>
                                                        <ul className="project-list">
                                                            {project.problems.map((item, i) => (
                                                                <li key={i}>{item}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {project.solutions && (
                                                    <div className="project-list-block">
                                                        <div className="project-section-label">해결 과정</div>
                                                        <ul className="project-list">
                                                            {project.solutions.map((item, i) => (
                                                                <li key={i}>{item}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </details>
                                    )}
                                    {project.serviceUrl && (
                                        <div className="project-visit">
                                            <a className="project-visit-btn" href={project.serviceUrl} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink size={16} /> {project.serviceUrlLabel || '서비스 바로가기'}
                                            </a>
                                        </div>
                                    )}
                                    {project.links && (
                                        <div className="project-links">
                                            {project.links.github && (
                                                <a href={project.links.github} className="project-link">
                                                    <Github size={18} /> Code
                                                </a>
                                            )}
                                            {project.links.demo && (
                                                <a href={project.links.demo} className="project-link">
                                                    <ExternalLink size={18} /> Live Demo
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="projects-section" id="personal-projects">
                    <div className="about-section-heading">
                        <h2 className="section-title">개인 프로젝트</h2>
                    </div>
                    <div className="projects-grid">
                        {personalProjects.map((project, index) => (
                            <div className="project-card" key={index}>
                                <div className="project-content">
                                    {project.date && <span className="project-date">{project.date}</span>}
                                    <h3 className="project-title">{project.title}</h3>
                                    {project.role && <div className="project-role">{project.role}</div>}
                                    {project.contributions && (
                                        <div className="project-list-block">
                                            <div className="project-section-label">기여도</div>
                                            <ul className="project-contribution-list">
                                                {project.contributions.map((item) => (
                                                    <li key={item.label}>
                                                        <span className="project-contribution-label">{item.label}</span>
                                                        <span className="project-contribution-value">{item.value}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {project.desc && (
                                        <div className="project-list-block">
                                            <div className="project-section-label">개요</div>
                                            {Array.isArray(project.desc) ? (
                                                <ul className="project-list">
                                                    {project.desc.map((item, i) => (
                                                        <li key={i}>{item}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="project-desc">{project.desc}</p>
                                            )}
                                        </div>
                                    )}
                                    <div className="project-list-block">
                                        <div className="project-section-label">기술 스택</div>
                                        <div className="project-techs">
                                            {project.techs.map(tech => (
                                                <span key={tech} className="tech-badge">{tech}</span>
                                            ))}
                                        </div>
                                    </div>
                                    {project.serviceUrl && (
                                        <a className="project-link" href={project.serviceUrl} target="_blank" rel="noopener noreferrer">
                                            {project.serviceUrlLabel || '프로젝트 보기'} <ExternalLink size={16} />
                                        </a>
                                    )}
                                    {project.links && (
                                        <div className="project-list-block">
                                            <div className="project-section-label">링크</div>
                                            <div className="project-links">
                                                {project.links.github && (
                                                    <a href={project.links.github} className="project-link">
                                                        <Github size={18} /> Code
                                                    </a>
                                                )}
                                                {project.links.demo && (
                                                    <a href={project.links.demo} className="project-link">
                                                        <ExternalLink size={18} /> Live Demo
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section hidden={!showSkillsSection} className="skills-section">
                    <div
                        style={{ textAlign: 'center', marginBottom: '2rem' }}
                        className="skills-header-container"
                    >
                        <h2 className="section-title">기술 스택</h2>
                    </div>

                    <div className="skills-toggle-container" style={{ textAlign: 'center', marginBottom: isSkillsOpen ? '3rem' : '0' }}>
                        <button
                            className="btn-skills-toggle"
                            onClick={() => setIsSkillsOpen(!isSkillsOpen)}
                        >
                            {isSkillsOpen ? "접기" : "다룰 수 있는 도구들이 궁금하신가요?"}
                            {isSkillsOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                    </div>

                    {isSkillsOpen && (
                        <div className="skill-categories animate-fade-in">
                            {skillCategories.map((category, catIndex) => (
                                <div key={catIndex} className="skill-category-group" style={{ marginBottom: '1.5rem' }}>
                                    <h3 style={{
                                        fontSize: '1.25rem',
                                        marginBottom: '1rem',
                                        color: 'var(--color-text-main)',
                                        borderLeft: '3px solid var(--color-primary)',
                                        paddingLeft: '0.75rem'
                                    }}>
                                        {category.title}
                                    </h3>
                                    <div className="skills-grid">
                                        {category.skills.map((skill, index) => (
                                            <div className="skill-card" key={index} style={{ animationDelay: `${index * 100}ms` }}>
                                                <span className="skill-icon">{skill.icon}</span>
                                                <span className="skill-name">{skill.name}</span>
                                                {skill.tags && (
                                                    <div className="skill-tags">
                                                        {skill.tags.map(tag => (
                                                            <span key={tag} className="skill-tag">{tag}</span>
                                                        ))}
                                                    </div>
                                                )}
                                                {skill.level && (
                                                    <span
                                                        className={`skill-level ${skill.level === '상'
                                                            ? 'level-high'
                                                            : skill.level === '중'
                                                                ? 'level-mid'
                                                                : 'level-low'
                                                            }`}
                                                    >
                                                        {skill.level}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="awards-section">
                    <div className="about-section-heading">
                        <h2 className="section-title">수상</h2>
                    </div>
                    <div className="awards-grid">
                        {[
                            {
                                year: '2022.11.25 ~ 2022.11.26',
                                title: '2022 AI-X 해커톤 대상',
                                org: '한국지능정보사회진흥원, 인천재능대학교',
                                desc: 'AI 소음 관리 및 모니터링 시스템 프로젝트로 대상(300만원) 수상'
                            }
                        ].map((award, index) => (
                            <div className="award-card" key={index}>
                                <div className="award-header">
                                    <span className="award-year">{award.year}</span>
                                    <span className="award-icon"><Trophy size={16} /></span>
                                </div>
                                <h3 className="award-title">{award.title}</h3>
                                <span className="award-org">{award.org}</span>
                                <p className="award-desc">{award.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="activities-section" id="activities">
                    <div className="about-section-heading">
                        <h2 className="section-title">활동</h2>
                    </div>
                    <div className="awards-grid">
                        {[
                            {
                                year: '2025.07 ~ 현재',
                                title: '요즘IT 필진 활동',
                                org: '필명: 나루브라운',
                                desc: '“어이 신입, 탈출각이다.”, “닮고 싶은 개발자의 초상” 등 성장과 커리어를 주제로 에세이 연재',
                                url: 'https://yozm.wishket.com/magazine/@narubrown/'
                            },
                            {
                                year: '2025.11',
                                title: '앱센터 세미나 연사',
                                org: '인천대학교 전산원 산하 글로벌 앱센터',
                                desc: '“자기주도적 성장과 실무 경험”을 주제로 발표'
                            },
                            {
                                year: '2025.04',
                                title: '2025 유니톤(Unithon) 개발 멘토',
                                org: '앱센터 & GDGoC 공동 주최',
                                desc: '유니톤 참가팀의 개발 멘토로 참여'
                            },
                            {
                                year: '2023.03.01 ~ 2025.03.01',
                                title: '글로벌 앱센터 센터장',
                                org: '인천대학교 전산원 산하 글로벌 앱센터',
                                desc: '서버 파트장 및 센터장으로 팀 운영과 백엔드 기술 공유',
                                url: 'https://home.inuappcenter.kr/team/common?year=16.5'
                            },
                            {
                                year: '2024.12.18',
                                title: '구름톤 유니브 단풍톤 본선 진출',
                                org: 'Codingland 프로젝트',
                                desc: '코딩 교육 취약 계층을 위한 플랫폼으로 본선 진출'
                            },
                            {
                                year: '2023.06.01 ~ 2025.02.01',
                                title: '구름톤 유니브 학교 대표',
                                org: '인천대학교',
                                desc: '학교 대표로 활동하며 스터디와 해커톤 운영'
                            },
                            {
                                year: '2024.08.31',
                                title: 'SESSION 2024 연사',
                                org: '인천대학교',
                                desc: '“OCP 위배를 극복한 전략 패턴 적용 사례” 발표'
                            }
                        ].map((activity, index) => (
                            <div className="award-card" key={index}>
                                <div className="award-header">
                                    <span className="award-year">{activity.year}</span>
                                    {activity.url && (
                                        <a href={activity.url} target="_blank" rel="noopener noreferrer" aria-label={`${activity.title} 관련 페이지`}>
                                            <span className="award-icon"><ExternalLink size={16} /></span>
                                        </a>
                                    )}
                                </div>
                                <h3 className="award-title">{activity.title}</h3>
                                <span className="award-org">{activity.org}</span>
                                <p className="award-desc">{activity.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="education-section" id="education">
                    <div className="about-section-heading">
                        <h2 className="section-title">학력</h2>
                    </div>
                    <div className="awards-grid">
                        {[
                            {
                                period: '2023.03 ~ 2025.02',
                                school: '인천대학교, 인천 연수구',
                                major: '컴퓨터공학부, 공학사'
                            },
                        ].map((edu, index) => (
                            <div className="award-card" key={index}>
                                <div className="award-header">
                                    <span className="award-year">{edu.period}</span>
                                    <span className="award-icon"><BookOpen size={16} /></span>
                                </div>
                                <h3 className="award-title">{edu.school}</h3>
                                <div className="award-org">{edu.major}</div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="contact-section" id="contact">
                    <div style={{ textAlign: 'center' }}>
                        <h2 className="section-title">연락하기</h2>
                        <p style={{ maxWidth: '600px', margin: '0 auto', color: 'var(--color-text-secondary)' }}>
                            새로운 프로젝트, 문제 해결 아이디어, 협업 제안 모두 환영합니다. 언제든 편하게 연락 주세요.
                        </p>
                        <div className="contact-actions">
                            <a href="mailto:ruffmadman@kakao.com" className="contact-btn email">
                                <Mail size={18} /> Email
                            </a>
                            <a href="https://github.com/NARUBROWN" target="_blank" rel="noopener noreferrer" className="contact-btn social">
                                <Github size={18} /> GitHub
                            </a>
                            <a href="https://linkedin.com/in/naru-brown" target="_blank" rel="noopener noreferrer" className="contact-btn social">
                                <Linkedin size={18} /> LinkedIn
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default About;

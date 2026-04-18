import React, { useEffect, useRef, useState } from 'react';
import { Mail, Github, Linkedin, ExternalLink, Trophy, Zap, Activity, BarChart2, Share2, Layers, Database, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import './About.css';

const About = () => {
    const [isSkillsOpen, setIsSkillsOpen] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const summaryRef = useRef(null);

    // SEO metadata for Google/Naver crawling on the /about page
    useEffect(() => {
        const siteName = 'NARUBROWN의 기술 블로그';
        const defaultTitle = document.title || siteName;
        const pageTitle = `김원정 | AI 엔지니어 포트폴리오 - ${siteName}`;
        const description = 'LLM·RAG·온톨로지·지식 그래프 기반 AI 시스템 설계와 백엔드 구현 경험을 담은 김원정 AI 엔지니어 포트폴리오.';
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
            { attr: 'name', key: 'keywords', value: 'AI 엔지니어, AI Engineer, 김원정, NARUBROWN, LLM, RAG, 온톨로지, 지식 그래프, 백엔드 개발자, FastAPI, Spring Boot, NestJS, 포트폴리오' },
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
                "LLM 기반 AI 서비스 설계",
                "RAG 파이프라인 구축",
                "온톨로지와 지식 그래프 설계",
                "OCR 기반 문서 처리 자동화",
                "FastAPI, Spring Boot, NestJS 백엔드 개발",
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

    useEffect(() => {
        // Simple intersection observer for fade-in animations on scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        const elements = document.querySelectorAll('.animate-on-scroll');
        elements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
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
            date: '2025.07 ~ 현재',
            type: '정규직',
            title: 'AI Engineer · Back-End Engineer',
            company: '(주)셈웨어, 서울 금천구',
            description: [
                '교육과정 PDF 기반 온톨로지·지식 그래프 구축 파이프라인 설계 및 구현',
                'Map-Reduce 기반 LLM 추출, RAG, OCR 파이프라인으로 교육용 AI 서비스 개발',
                'Apache Jena Fuseki, RDF-star 기반 온톨로지 저장소와 검증·롤백 구조 설계',
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
        }
    ];

    const interests = [
        {
            icon: <Zap size={24} />,
            title: "LLM 기반 서비스 설계",
            desc: `LLM은 단순 호출보다 워크플로우 설계가 더 중요하다고 생각합니다.
추출, 검증, 재시도, 사람 승인 단계를 어떻게 나눌지에 따라 품질이 크게 달라지기 때문에, 실제 서비스에서 안정적으로 동작하는 AI 파이프라인 구조에 관심이 많습니다.`
        },
        {
            icon: <Activity size={24} />,
            title: "RAG와 검색 품질",
            desc: `검색 기반 AI 시스템에서 중요한 건 답변 생성보다 컨텍스트를 얼마나 정확히 가져오느냐라고 생각합니다.
메타데이터 필터링, 청킹 전략, 재랭킹, recall 보정 같은 요소를 조합해 문맥 오염을 줄이고 검색 품질을 안정화하는 방식에 관심을 두고 있습니다.`
        },
        {
            icon: <BarChart2 size={24} />,
            title: "온톨로지와 지식 그래프",
            desc: `문서를 그대로 저장하는 것보다, 개념과 관계를 구조화해 추론 가능한 형태로 바꾸는 작업에 큰 흥미를 느낍니다.
교육과정처럼 관계가 암묵적인 도메인에서 온톨로지와 지식 그래프를 설계하고, 사람이 해석 가능한 진단 근거를 만드는 방식에 관심이 있습니다.`
        },
        {
            icon: <Share2 size={24} />,
            title: "AI 시스템 평가와 검증",
            desc: `AI 시스템은 “그럴듯하다”보다 “어디까지 믿을 수 있는가”가 더 중요하다고 생각합니다.
정확도만이 아니라 누락, 환각, 증거 유무, 실패 유형을 나눠서 평가하고, 자동 검증과 사람 검토를 함께 두는 운영 방식에 관심을 갖고 있습니다.`
        },
        {
            icon: <Layers size={24} />,
            title: "AI와 백엔드의 접점",
            desc: `좋은 AI 서비스는 모델만으로 완성되지 않고, 저장소, 비동기 처리, 권한, 감사 로그, 롤백 같은 백엔드 구조 위에서 비로소 운영 가능해진다고 생각합니다.
모델 실험을 제품 기능으로 연결하는 API, 데이터, 운영 구조를 함께 설계하는 일에 관심이 있습니다.`
        },
        {
            icon: <Database size={24} />,
            title: "관측 가능한 AI 운영",
            desc: `AI 기능도 결국 운영 대상이기 때문에, 호출 비용과 지연 시간, 실패율, 품질 저하를 함께 봐야 한다고 생각합니다.
프롬프트와 모델 변경이 실제 서비스 품질에 어떤 영향을 주는지 추적 가능한 구조를 만드는 데 관심이 많습니다.`
        },
        {
            icon: <BookOpen size={24} />,
            title: "기술을 지식으로 남기는 일",
            desc: `문제 해결이 개인의 경험으로 끝나는 걸 경계합니다.
실험과 시행착오를 문서로 정리해 팀의 공통 자산으로 만들고, 다시 재사용 가능한 프롬프트·평가 기준·설계 원칙으로 축적하는 과정 자체에 큰 관심을 두고 있습니다.`
        }
    ];

    const summaryMeta = [
        {
            label: '포지션',
            value: 'AI Engineer · Back-End Engineer',
            note: 'LLM 서비스 · 지식 그래프 · 플랫폼'
        },
        {
            label: '핵심 키워드',
            value: 'LLM · RAG · 온톨로지 · 지식 그래프',
            note: 'FastAPI · Fuseki · RDF-star · OCR'
        },
        {
            label: '운영/관측',
            value: 'OpenTelemetry · Jaeger · Redis',
            note: '추적 가능성 · 실시간 상태 · 운영 안정성'
        },
        {
            label: '선호 스택',
            value: 'FastAPI · NestJS · Spring Boot',
            note: 'PostgreSQL · MySQL · Redis'
        }
    ];

    const summaryTiles = [
        {
            title: '경력 스냅샷',
            tag: '실무 3개사 · 4개 제품',
            icon: <Activity size={18} />,
            bullets: [
                '교육 AI·채용·운영 플랫폼 백엔드 경험',
                'LLM·RAG·온톨로지 기반 AI 서비스 설계 및 구현',
                '실시간 아키텍처와 운영 관측까지 함께 다룬 엔지니어링 경험'
            ],
            link: '#experience',
            accent: 'indigo'
        },
        {
            title: '주요 프로젝트',
            marqueeItems: [
                '사내 교육 진단 AI 플랫폼',
                '사내 워크북 생성 AI 플랫폼',
                'SteamUp Academy',
                'AlgeoMath',
                '보너스잡',
                '스카우트 글로벌',
                '클린베테랑',
                '통합 모니터링 & 관측 시스템',
                '국회 정책 세미나 백오피스',
                '티켓팅 시스템',
                'Codingland'
            ],
            icon: <Layers size={18} />,
            bullets: [
                '교육과정 PDF 기반 온톨로지·지식 그래프 구축',
                'LLM 추출, RAG, OCR을 결합한 교육용 AI 워크플로우 구현',
                '실시간 대기방, EDA, 결제 도메인까지 아우른 백엔드 설계 경험'
            ],
            link: '#professional-projects',
            accent: 'violet'
        },
        {
            title: '학력',
            tag: '컴퓨터공학 기반',
            icon: <BookOpen size={18} />,
            bullets: [
                '인천대학교 컴퓨터공학부 (2023.03~2025.02) · 공학사',
            ],
            link: '#education',
            accent: 'teal'
        },
        {
            title: '요즘 궁금한 것들',
            tag: '관심사',
            icon: <Zap size={18} />,
            bullets: interests.slice(0, 3).map(item => item.title),
            link: '#interests',
            accent: 'amber'
        }
    ];

    const professionalProjects = [
        {
            date: '2025.02 ~',
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
                '대용량 문서를 분할·병렬 처리하고 단계별 검증을 두어 누락과 오분류를 줄이는 파이프라인을 설계했음',
                '보조 문서와 근거 문맥을 함께 연결해 관계 제안의 설명 가능성을 높였음',
                '규칙 검증, 검토 승인, 롤백 가능한 반영 절차를 두어 운영 안정성을 확보했음'
            ],
            results: [
                '교육과정 문서를 지식 그래프 형태로 구조화하고, 학습 결과를 개념 단위로 해석할 수 있는 기반을 마련했음',
                '문서 추출 품질과 구조적 일관성을 높여 서비스 운영에 적용 가능한 수준의 데이터 파이프라인을 구축했음',
                'AI 생성 결과에 대한 검증·승인 절차를 정립해 정확성과 운영 안정성을 함께 확보했음'
            ]
        },
        {
            date: '2025.02 ~',
            title: '사내 워크북 생성 AI 플랫폼',
            role: 'AI Engineer',
            org: '(주)셈웨어',
            summary: '교육과정 문서를 분석해 학년·과목 맥락에 맞는 학습 자료를 자동 생성하고 렌더링하는 내부 AI 프로젝트입니다.',
            techs: ['FastAPI', 'PostgreSQL', 'SQLAlchemy', 'ChromaDB', 'PyMuPDF', 'Playwright', 'OpenRouter', 'RAG'],
            problems: [
                '긴 교육과정 문서에서 필수 기준 정보를 안정적으로 추출해야 했고, 단순 검색 기반 접근만으로는 필요한 정확도를 확보하기 어려웠음',
                '한 문서 안에 여러 수준의 정보가 혼재해 있어, 학년·과목 기준으로 다시 구조화하는 과정이 복잡했음',
                '유사 키워드가 반복되어 문맥이 다른 내용이 함께 섞이지 않도록 제어할 필요가 있었음'
            ],
            solutions: [
                '긴 문서를 구간 단위로 나눠 병렬 처리하고, 누락 검사를 통해 필요한 구간만 재처리하도록 설계했음',
                '내용 추출, 기준 연결, 결과 생성 단계를 분리해 AI가 맡는 작업의 책임을 명확히 했음',
                '검색 단계에서 학년·과목·영역 맥락을 함께 반영해 문맥 혼입을 줄였음',
                '문서 업로드부터 결과물 생성과 렌더링까지 자동화된 파이프라인으로 연결했음'
            ],
            results: [
                '긴 문서를 안정적으로 처리할 수 있는 자동 생성 파이프라인을 구축했음',
                '학년·과목 맥락이 섞이지 않도록 구조화해 결과물 품질과 일관성을 높였음',
                '토큰 사용량과 처리 비용을 줄이면서도 생성 품질을 개선했음',
                '문서 업로드 이후 결과물 생성까지 이어지는 end-to-end 자동화 흐름을 구현했음'
            ]
        },
        {
            date: '2025.07 ~ 2026.01',
            title: 'SteamUp Academy',
            role: 'Backend Engineer',
            org: '(주)셈웨어',
            summary: '수학·과학·코딩·예술을 아우르는 디지털 STEAM 수업 플랫폼으로 실시간 양방향 수업, 코스웨어 제공과 맞춤형 강의 제작·학급 관리를 지원합니다.',
            techs: ['Go', 'Echo', 'WebSocket', 'Redis', 'Redis Pub/Sub', 'PostgreSQL'],
            problems: [
                'WebSocket 기반 실시간 클래스룸에서 다중 서버를 고려하지 않아 입·퇴장/좌석 선택 시 상태 충돌과 중복 처리 위험',
                '단일 Handler에 비즈니스 로직·DB 접근·응답 스키마가 섞인 1-Tier 구조로 테스트와 확장이 어려움'
            ],
            solutions: [
                '다중 서버 환경을 전제로 실시간 대기방 아키텍처 재설계',
                'Redis Pub/Sub 이벤트 스트림으로 모든 서버 인스턴스 간 상태 동기화',
                '스냅샷 + Delta 전략으로 전체 상태 반복 전송을 제거',
                '좌석 선택 등 경쟁 구간에 Redis 분산락을 적용해 단일 반영 보장',
                'Handler–Service–DB 3-Tier 아키텍처로 전면 재정비',
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
            summary: '한국과학창의재단이 개발한 수학 탐구형 온라인 도구로 대수·기하 기반의 시각화, 2D/3D 수학 실습과 블록코딩 학습, 수업 자료 제작 및 과제 관리를 지원합니다.',
            techs: ['NestJS', 'RabbitMQ', 'Knex.js', 'mySQL', 'JMeter', 'Kubernetes', 'OpenTelemetry', 'Jaeger'],
            problems: [
                '모놀리식 구조로 서비스 간 결합도가 높고 장애 전파 범위가 큼',
                'MSA 전환 이후에도 성능 한계 지점과 HPA 기준이 불명확',
                '로그인 로직에 핵심 처리와 부가 기능이 뒤섞여 유지보수성 저하',
                '실시간 DB 쿼리 성능 모니터링 부재로 Slow Query를 사후 인지'
            ],
            solutions: [
                '모놀리식을 마이크로서비스 아키텍처로 전환하고 RabbitMQ 기반 EDA 도입',
                '서비스 간 직접 호출을 제거해 독립 배포/확장 구조 확립',
                'JMeter 성능 테스트 시나리오로 서비스별 SLO 정의 및 HPA 스케일 기준 튜닝',
                '로그인 프로세스를 NestJS Interceptor 기반으로 재설계해 인증 로직과 부가 기능(로그 기록, 보상 지급) 분리',
                'Knex.js Event Emitter를 활용해 Slow Query 감지 시스템 구축, 100ms 초과 쿼리의 SQL·실행 시간·호출 API 자동 로깅',
                'OpenTelemetry + Jaeger로 서비스 호출 트레이싱'
            ],
            results: [
                '서비스 간 결합도 감소 및 장애 격리 가능 구조 확보',
                '트래픽 변화에 유연하게 대응하는 자동 확장 환경 구축',
                '로그인 로직 책임 분리로 유지보수성과 확장성 향상',
                'DB 성능 병목을 사전에 식별하는 관측 가능성 확보',
                'MSA 전반을 성능·운영·관측까지 통합 관리 가능한 플랫폼으로 고도화'
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
                '포인트 충전·차감·환불 도메인 설계 및 상태 모델링',
                '포인트 상태를 통합·세분화하여 결제 및 환불 흐름 안정화',
                'MakeBill API 연동을 통해 세금계산서 발행·재전송·취소 자동화',
                '슈퍼 유저 권한 기반 입금 확정 로직 구현',
                '다중 상태 검색 및 통계 API 제공으로 회계·정산 업무 간소화'
            ],
            results: [
                '유료 상품 기반 수익 모델 확보',
                '결제·정산·회계 전반이 자동화된 B2B 채용 플랫폼 구축',
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
            summary: 'AI 기반 맞춤 채용과 스카우터 커리어 컨설팅, 취업·추천 보상 등으로 구직자와 기업을 연결하는 국내 대표 온라인 HR 채용 플랫폼입니다.',
            problems: [
                '외국인 취업 공고를 제공하는 신규 서비스에서 복잡한 조회 조건으로 인한 API 응답 지연 및 잦은 DB 접근 문제 발생',
                '신규 서비스임에도 초기부터 확장성과 유지보수성을 고려한 구조 필요'
            ],
            solutions: [
                'Spring Boot + JPA 기반으로 도메인–레포지토리–서비스 계층 명확히 분리',
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
            summary: '스카우트가 운영하는 토탈 홈케어 플랫폼으로, 검증된 매니저가 가사·사업장 청소, 공간 소독과 생활편의 서비스를 앱 기반으로 맞춤 제공하는 청소·위생 서비스입니다.',
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
                '코드 가독성·유지보수성·협업 효율 향상',
                '신규 기능 추가 시 개발 리드타임 단축'
            ],
            serviceUrl: 'https://helper.veteranscout.co.kr/'
        },
        {
            date: '2024.10 ~ 2025.06',
            title: '통합 모니터링 & 관측 시스템',
            role: 'Back-End Engineer',
            org: '(주)스카우트',
            summary: '온프레미스와 클라우드를 아우르는 통합 모니터링/알림 스택 구축',
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
                '서버·컨테이너·DB 상태를 실시간으로 파악 가능한 관측 환경 구축',
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
                '운영 데이터 관리/상태 조회/관리 기능을 안정적으로 지원할 서버 구조 필요'
            ],
            solutions: [
                '실시간 전달 시스템 운영을 지원하는 백오피스 API 설계·구현',
                '흩어져 있던 엔드포인트를 통합하고 RESTful 규약에 맞게 구조 정비',
                '운영 환경을 고려해 서버 구조 단순화 및 불필요 흐름 제거로 응답 성능 개선'
            ],
            results: [
                '실제 세미나 운영에 사용 가능한 백오피스 API 구축',
                '안정성·일관성·관리 편의성을 고려한 서버 설계 경험 확보',
                '실시간 시스템/운영 중심 백엔드 개발의 실무 경험 축적'
            ]
        }
    ];

    const personalProjects = [
        {
            date: '2025.12 ~ 진행중',
            title: '뽑기팡',
            role: 'Backend · AI · Tech Lead',
            desc: [
                '전국 뽑기방 지도·인증·중고거래 통합 플랫폼에서 백엔드·AI 개발 리드.',
                'NestJS 기반 API 서버와 MySQL 데이터 모델링, 위치 기반 검색·방문 인증·제보 플로우 설계 및 구현.',
                'YOLO 비전 모델과 BERT 사기 탐지 모델을 서비스 연계 관점에서 설계하고 GCP Compute Engine에서 App/DB 분리 인프라와 AI 확장 전제 아키텍처 총괄 설계.'
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
        {
            date: '2025.09',
            title: 'APA (Automated Pull-Request Assistant)',
            role: 'Backend · AI · DevOps',
            desc: [
                'GitHub Webhook과 LLM을 연동한 지능형 코드 리뷰 자동화 에이전트 개발.',
                'NestJS 기반 EDA로 PR 이벤트 발생 시 실시간 코드 분석 및 피드백 제공 시스템 구축.',
                'Strategy 패턴과 DI로 OpenAI, Gemini, Ollama(Local LLM) 등 다양한 AI 모델을 환경 변수에 따라 유연하게 교체 가능한 구조 설계.',
                '보안 취약점 탐지용 프롬프트 엔지니어링 적용과 Docker 멀티 스테이지 빌드로 배포 최적화.'
            ],
            contributions: [
                { label: 'Backend', value: '100%' },
                { label: 'AI', value: '100%' },
                { label: 'DevOps', value: '100%' }
            ],
            techs: [
                'TypeScript',
                'NestJS',
                'GitHub Actions & API',
                'OpenAI API',
                'Google Gemini API',
                'Ollama',
                'Docker',
                'Handlebars',
                'Fuse.js',
                'RxJS'
            ],
            links: { github: 'https://github.com/NARUBROWN/apa-project' } 
        },
        {
            date: '2025.04 ~ 2025.06',
            title: '티켓팅 시스템',
            role: 'Backend Developer',
            desc: [
                'Kafka 기반 MSA 티켓팅 시스템 설계.',
                'JPA 비관/낙관 락과 트랜잭션 격리 수준 실험으로 동시 예약 정합성 확보, Spring Cloud Gateway + Eureka + Feign으로 서비스 간 통신 표준화.',
                'Kafka 이벤트 기반 Choreography Saga 패턴을 적용해 예약–티켓–재고 간 분산 트랜잭션 정합성을 확보하고, 중앙 오케스트레이터 없이 보상 이벤트로 상태 롤백이 가능한 구조를 구현.',
                'Outbox Pattern을 적용해 예약 생성 트랜잭션과 이벤트 발행을 단일 커밋으로 묶어 이벤트 유실·중복을 제거하고 트랜잭션-이벤트 불일치를 차단.'
            ],
            contributions: [
                { label: 'Backend', value: '100%' }
            ],
            techs: ['Java', 'Spring Boot', 'Kafka', 'Hibernate', 'MSA', 'Spring Cloud Gateway', 'Feign Client', 'Eureka'],
            links: { github: 'https://github.com/appcenter-advanced-study/msa-ticketing-system-wonjeong' }
        },
        {
            date: '2024.03 ~ 2024.05', 
            title: 'Pencil me',
            role: 'Backend · AI',
            desc: [
                '생성형 AI 기반 일정 관리 플랫폼에서 AI 백엔드 개발을 전담.',
                'FastAPI와 LangChain으로 자연어 대화를 일정 데이터(제목, 마감기한, 카테고리)로 변환하는 LLM 파이프라인 설계 및 구현.',
                'Dependency Injector로 LLM, Google Search, Crawler 의존성을 관리하고 Spring 메인 서버 연동을 주도.',
                'ChromaDB와 Few-Shot Prompting으로 의도 파악·요약 정확도를 개선하고, URL 크롤링 기반 할 일 등록 기능 개발.'
            ],
            contributions: [
                { label: 'Backend', value: '30%' },
                { label: 'AI', value: '100%' }
            ],
            techs: [
                'Python',
                'FastAPI',
                'LangChain',
                'OpenAI API',
                'ChromaDB',
                'BeautifulSoup',
                'Google Custom Search API',
                'Dependency Injector'
            ],
            links: { github: 'https://github.com/BCD-q/pencil-me-fastapi' } 
        }
    ];

    const handleSummaryToggle = () => {
        setShowSummary(prev => {
            const next = !prev;
            if (!prev) {
                setTimeout(() => {
                    if (summaryRef.current) {
                        summaryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 50);
            }
            return next;
        });
    };

    return (
        <div className="about-page">
            <div className="about-hero">
                <div className="about-content">
                    <h1>
                        안녕하세요, <span style={{ color: 'var(--color-primary)' }}>김원정</span>입니다.
                    </h1>
                    <p style={{ marginTop: '2rem' }}>
                        새로운 기술에 도전하며 불편함을 개선해 온 엔지니어입니다. 빠른 응답 속도와 안정성을 고민하며 성장했고, 앞으로도 작은 디테일까지 놓치지 않고 개선하는 동료가 되고자 합니다.
                    </p>
                    <div className="hero-actions">
                        <button className="btn-hero-summary" onClick={handleSummaryToggle}>
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

            <div className="content-container">
                {showSummary && (
                    <section className="summary-section animate-fade-in" ref={summaryRef}>
                        <button className="summary-close" onClick={handleSummaryToggle} aria-label="요약 닫기">
                            ✕
                        </button>
                        <div className="summary-header">
                            <span className="summary-chip">한 눈에 보기</span>
                            <div className="summary-divider" aria-hidden="true"></div>
                            <div>
                                <h2>경력, 학력, 프로젝트를 한 번에 훑어보세요.</h2>
                                <p>실시간 시스템과 관측 가능성, MSA/EDA 전환 경험을 중심으로 어떤 문제를 풀어왔는지 압축 정리했습니다.</p>
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
                                        {tile.marqueeItems ? (
                                            <div className="summary-tag-marquee">
                                                <div className="summary-tag-track">
                                                    {tile.marqueeItems.map((item, i) => (
                                                        <span key={`a-${i}`} className="summary-tag-item">{item}</span>
                                                    ))}
                                                    {tile.marqueeItems.map((item, i) => (
                                                        <span key={`b-${i}`} className="summary-tag-item">{item}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="summary-tag">{tile.tag}</span>
                                        )}
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
                )}

                <section className="experience-section animate-on-scroll" id="experience">
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
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

                <section className="projects-section animate-on-scroll" id="professional-projects">
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h2 className="section-title">실무 프로젝트</h2>
                        <p style={{ marginTop: '0.75rem', color: '#6b7280', fontSize: '0.95rem' }}>
                            비공개 사내 프로젝트는 공개 가능한 범위로 일반화해 기재했습니다.
                        </p>
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
                                    {project.problems && (
                                        <div className="project-list-block">
                                            <div className="project-section-label">Problem</div>
                                            <ul className="project-list">
                                                {project.problems.map((item, i) => (
                                                    <li key={i}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {project.solutions && (
                                        <div className="project-list-block">
                                            <div className="project-section-label">Solution</div>
                                            <ul className="project-list">
                                                {project.solutions.map((item, i) => (
                                                    <li key={i}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {project.results && (
                                        <div className="project-list-block">
                                            <div className="project-section-label">Result</div>
                                            <ul className="project-list">
                                                {project.results.map((item, i) => (
                                                    <li key={i}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {project.serviceUrl && (
                                        <div className="project-visit">
                                            <a className="project-visit-btn" href={project.serviceUrl} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink size={16} /> 서비스 바로가기
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

                <section className="interests-section animate-on-scroll" id="interests">
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 className="section-title">관심 분야</h2>
                    </div>
                    <div className="interests-grid">
                        {interests.map((item, index) => (
                            <div className="interest-card" key={index}>
                                <div className="interest-icon-wrapper">
                                    {item.icon}
                                </div>
                                <h3 className="interest-title">{item.title}</h3>
                                <p className="interest-desc">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="skills-section animate-on-scroll">
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

                <section className="awards-section animate-on-scroll">
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
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

                <section className="activities-section animate-on-scroll">
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
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
                                        <a href={activity.url} target="_blank" rel="noopener noreferrer">
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

                <section className="projects-section animate-on-scroll" id="personal-projects">
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
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

                <section className="education-section animate-on-scroll" id="education">
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
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

                <section className="contact-section animate-on-scroll" id="contact">
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

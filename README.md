<div align="center">
  <a href="https://na2ru2.me">
    <img src="public/logo.png" alt="NARUBROWN 기술 블로그 로고" width="88" />
  </a>
  <h1>Tech Blog React</h1>
  <p><strong>개발하며 배운 것과 만들어 온 이야기를 담는 공간</strong></p>
  <p>NARUBROWN의 기술 블로그와 포트폴리오를 위한 React 프런트엔드입니다.</p>
  <p>
    <img src="https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white" alt="React 19" />
    <img src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white" alt="Vite 7" />
    <img src="https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter&logoColor=white" alt="React Router 7" />
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-CC_BY--NC_4.0-475569" alt="CC BY-NC 4.0 라이선스" /></a>
  </p>
  <p>
    <a href="https://na2ru2.me"><strong>블로그 방문하기</strong></a>
    &nbsp; / &nbsp;
    <a href="https://github.com/NARUBROWN/tech-blog-spine">백엔드 저장소</a>
    &nbsp; / &nbsp;
    <a href="#로컬-실행">로컬 실행</a>
  </p>
</div>

---

## 소개

글을 읽는 경험부터 작성과 운영까지 한곳에서 다룹니다. 카테고리와 검색으로 글을 탐색하고, Mermaid 다이어그램이 포함된 기술 글을 읽고, 댓글과 좋아요로 반응할 수 있습니다. 자기소개와 프로젝트, 활동 기록, 연말 Recap도 함께 제공합니다.

화면과 상호작용은 이 저장소가 담당하고, 인증과 데이터 저장은 [tech-blog-spine](https://github.com/NARUBROWN/tech-blog-spine)의 REST API에 연결합니다.

## 주요 기능

| 영역 | 제공하는 기능 |
| --- | --- |
| 글 읽기 | 카테고리별 목록, 페이지네이션, 키워드 검색, 슬러그 기반 상세 페이지, 추천 글 |
| 글 작성 | Quill 기반 에디터, 이미지 업로드, 작성 내용 미리보기, 글 수정과 삭제 |
| 기술 콘텐츠 | Mermaid 다이어그램 렌더링, DOMPurify를 통한 본문 HTML 정제 |
| 독자 반응 | 비밀번호 기반 익명 댓글 작성과 수정, 삭제, 방문자 쿠키 기반 좋아요 |
| 계정 | 회원가입, 로그인과 로그아웃, 프로필 설정 |
| 포트폴리오 | 자기소개, 프로젝트와 활동 기록, 연말 Recap |
| 공유와 검색 노출 | Open Graph, Twitter Card, canonical URL, 게시글 공유용 정적 HTML 생성 |
| 운영 | 관리자 전용 방문과 행동 통계, API 응답 시간과 화면 표시 성능 지표 |
| 화면 구성 | 반응형 레이아웃, 로딩 스켈레톤, 스크롤 이동과 모션 효과 |

## 기술 구성

| 용도 | 기술 |
| --- | --- |
| UI와 라우팅 | React 19, React Router 7 |
| 개발과 빌드 | Vite 7, ESLint 9 |
| API 통신 | Axios, 쿠키 기반 인증 |
| 콘텐츠 편집과 표시 | React Quill New, DOMPurify, Mermaid |
| 모션과 아이콘 | Framer Motion, Lucide React |
| 날짜와 성능 측정 | date-fns, web-vitals |
| 배포 | Vercel, API 프록시와 SPA 경로 재작성 |

## 로컬 실행

Node.js **22.12 이상**과 npm이 필요합니다. 글 조회와 로그인 등을 사용하려면 백엔드도 실행해 주세요.

```bash
git clone https://github.com/NARUBROWN/tech-blog-react.git
cd tech-blog-react
npm ci
npm run dev
```

개발 서버가 출력한 주소로 접속합니다. 기본 주소는 `http://localhost:5173`입니다.

### 백엔드 연결

로컬 API 주소를 위한 별도 환경변수 설정은 필요하지 않습니다. 기본 구성은 다음과 같습니다.

| 구분 | 브라우저 요청 | 전달 대상 | 설정 파일 |
| --- | --- | --- | --- |
| 로컬 개발 | `/api/v1/*` | `http://localhost:8080/api/v1/*` | [vite.config.js](vite.config.js) |
| Vercel 배포 | `/api/v1/*` | `https://api.na2ru2.me/api/v1/*` | [vercel.json](vercel.json) |

API 클라이언트는 [src/api/axios.js](src/api/axios.js)에서 `/api/v1`을 기본 경로로 사용하며 쿠키를 함께 전송합니다. 다른 백엔드를 사용하려면 해당 프록시 설정을 변경하세요. 로컬 HTTP 로그인에는 백엔드의 `COOKIE_SECURE=false` 설정이 필요합니다.

### 자주 쓰는 명령

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm run lint` | ESLint 검사 |
| `npm run build` | 프로덕션 빌드 후 공유용 HTML 생성 |
| `npm run preview` | 빌드 결과 로컬 미리보기 |
| `npm run generate:share-pages` | 기존 `dist/index.html`을 바탕으로 공유 페이지 다시 생성 |

## 공유 페이지와 배포

`npm run build`는 Vite 빌드에 이어 게시글 API를 조회하고 `dist/post/share/{id}/index.html`에 공유용 메타데이터를 넣은 HTML을 생성합니다. Recap 공유 페이지도 함께 생성합니다. 게시글 본문은 React 앱에서 불러옵니다.

[공유 페이지 생성 스크립트](scripts/generate-share-pages.js)는 아래 환경변수를 읽습니다. 빌드 명령 앞에 지정하거나 빌드 환경에 등록하세요.

| 변수 | 기본값 | 용도 |
| --- | --- | --- |
| `SITE_ORIGIN` | `https://na2ru2.me` | 공유 URL과 canonical URL의 사이트 주소 |
| `API_ORIGIN` | `SITE_ORIGIN`과 동일 | 빌드 시 게시글을 가져올 API 호스트 |
| `SKIP_SHARE_PAGES` | 비활성 | `true`이면 공유 페이지 생성 생략 |
| `STRICT_SHARE_PAGES` | 비활성 | `true`이면 게시글 조회 실패나 빈 목록을 빌드 실패로 처리 |
| `SHARE_PAGE_SIZE` | `50` | API 조회 시 페이지 크기 |
| `SHARE_MAX_PAGES` | `200` | 조회할 최대 페이지 수 |

```bash
# 로컬 API로 공유 페이지까지 빌드
SITE_ORIGIN=http://localhost:5173 API_ORIGIN=http://localhost:8080 npm run build

# API 없이 화면 빌드만 확인
SKIP_SHARE_PAGES=true npm run build
npm run preview
```

기본 설정에서는 게시글 API 조회가 실패해도 경고를 남기고 빌드를 계속합니다. 배포 시 공유 페이지 생성을 필수로 확인하려면 `STRICT_SHARE_PAGES=true`를 사용하세요. `API_ORIGIN`은 빌드 시에만 사용하며 브라우저의 API 연결 주소를 바꾸지 않습니다.

Vercel에서는 빌드 명령을 `npm run build`, 출력 디렉터리를 `dist`로 설정합니다. [vercel.json](vercel.json)은 API 프록시와 클라이언트 라우팅을 위한 경로 재작성을 정의합니다.

## 주요 화면

| 경로 | 화면 |
| --- | --- |
| `/` | 글 목록과 카테고리, Recap 진입 |
| `/search` | 키워드 검색 |
| `/post/:slug` | 게시글 상세 |
| `/post/share/:id` | 게시글 공유 URL |
| `/about` | 자기소개와 포트폴리오 |
| `/login`, `/signup` | 로그인과 회원가입 |
| `/post/create`, `/post/edit/:id` | 글 작성과 수정 |
| `/category/create` | 카테고리 생성 |
| `/settings` | 프로필 설정 |
| `/admin/analytics` | 관리자 통계 |

글 작성과 프로필 설정 등은 로그인이 필요합니다. 작성자와 관리자 권한, 글 소유권은 백엔드에서 최종 확인합니다.

## 프로젝트 구조

```text
src/
├── api/              # 인증, 글, 댓글, 이미지, 통계 API
├── components/       # 공통 UI, 에디터, 본문, Mermaid, Recap
├── context/          # 로그인 상태 관리
├── data/             # Recap 콘텐츠
├── lib/              # Mermaid 렌더링 설정
├── pages/            # 목록, 상세, 검색, 소개, 작성, 관리자 화면
├── utils/            # 방문과 성능 계측
├── App.jsx           # 라우팅과 로그인 보호
└── main.jsx          # 앱 진입점
public/               # 로고와 정적 자산
scripts/              # 공유 페이지 생성
vite.config.js        # 개발 서버와 API 프록시
vercel.json           # 배포 환경 경로 재작성
```

## 함께 보기

- [NARUBROWN 기술 블로그](https://na2ru2.me)
- [Tech Blog Spine API](https://github.com/NARUBROWN/tech-blog-spine)
- [Spine 프레임워크](https://github.com/NARUBROWN/spine)

## 라이선스

[CC BY-NC 4.0](LICENSE)을 따릅니다. 저작자 표시와 비영리 이용 조건을 확인해 주세요.

# 문서 목적

Next.js로 백엔드 개발자 포트폴리오 웹사이트를 제작한다. 이 웹사이트는 웹 포트폴리오이자 PDF 문서 역할을 한다.

## 디자인 문서

[디자인 개요](docs/design/overview.md)에서 구성 근거와 공통 시각 규칙, 메인·프로젝트 상세·PDF 흐름을 확인한다.
디자인 문서는 화면 구성의 입력이며, 현재 구현 완료 상태를 뜻하지 않는다.

## 기술 스택

- Next.js: 포트폴리오 웹사이트 구현
- Next.js Static Export (`output: 'export'`): 정적 파일 생성
- Print CSS (`@media print`): PDF 출력용 레이아웃과 스타일 구현
- Pencil: 포트폴리오 화면 구성과 디자인
- Docker Dev Container: 일관된 개발 환경 구성

## 빌드 환경

- Node: `.nvmrc`에 고정한 `24.18.1`
- pnpm: `package.json`의 `packageManager`에 고정한 `11.18.0`
- Wrangler: 개발 의존성과 lockfile에 고정한 `4.129.0`

Linux 호스트에서 nvm을 사용한다면 `nvm install && nvm use`로 Node를 선택한다.
개발 컨테이너도 시작할 때 `.nvmrc`를 읽어 같은 버전을 설치·선택한다. 이후
`pnpm install --frozen-lockfile`로 의존성을 설치한다. pnpm은 Corepack으로
`packageManager`에 지정된 버전을 사용한다.

`pnpm check`는 도구 버전 확인, 포맷 검사, lint, 타입 검사, 정적 빌드와 산출물
검증을 순서대로 실행한다. Node·pnpm이 지정한 버전과 다르거나 어느 단계든 실패하면
명령이 실패 코드로 종료된다. `pnpm build`에도 산출물 검증이 포함된다.

산출물 검증은 홈·세 프로젝트 상세·전체 열람의 HTML과 `404.html`, 원본과 같은
`_headers`를 확인한다. 각 HTML의 JS·CSS·폰트와 CSS가 참조하는 정적 자산도
검사한다. 파일 누락·빈 파일을 거부하고, HTML과 자산이 같은 빌드의 `.next/`
원본과 바이트 단위로 일치하는지 비교해 손상을 확인한다.
기존 빌드는 `pnpm check:export`, 그 빌드의 별도 출력 복사본은
`pnpm check:export /path/to/export`로 검사한다. 비교 기준인 `.next/`가 없거나
다른 빌드라면 `pnpm build`를 먼저 실행한다. `pnpm check:export:test`는 빌드 후
임시 복사본에 누락·빈 파일·내용 변경을 만들어 실패를 확인하고 복사본을 제거한다.

## 배포

- 빌드 결과물: Next.js Static Export로 생성되는 `out/` 디렉터리
- CDN: Cloudflare Workers Static Assets로 정적 파일 서빙
- 도메인: `portfolio.seungju.dev`
- 제약: 서버 사이드 렌더링과 서버 API를 사용하지 않는 정적 웹사이트로 구현

`wrangler.jsonc`는 `portfolio` Worker에 `./out`을 배포한다. HTML URL은
`trailingSlash: true`와 맞춰 끝에 `/`를 붙이고, 없는 경로는 내보낸 `404.html`을
HTTP 404로 반환한다. 서버 코드나 운영 Docker 컨테이너는 필요하지 않다.

Worker와 운영 도메인은 `central-infra`의 Terraform이 관리한다. Wrangler에는
`route`·`routes`를 지정하지 않으며 `workers.dev`와 버전별 preview URL은 비활성화한다.
계정 ID는 Terraform과 같은 공개 식별자를 사용하고, 인증 토큰은 저장소에 넣지 않는다.

### 로컬 배포 설정 검증

프로젝트에 고정한 Wrangler를 사용한다. 다음 명령은 Cloudflare에 배포하지 않는다.

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm exec wrangler deploy --dry-run
pnpm exec wrangler dev --local --port 8787
```

로컬 서버에서 `/`는 200, 존재하지 않는 URL은 404여야 한다. 정적 페이지의
`/index.html` URL은 `/`로 정규화된다. `out/`과 Wrangler 로컬 상태는 Git에서 제외한다.

실제 배포 명령은 `pnpm exec wrangler deploy`다. Cloudflare Workers Builds의
Git 연결·빌드 명령·배포 인증은 `central-infra`가 관리한다. 일반적인 운영 배포는
아래 Git 빌드 계약에 따라 Cloudflare에서 실행한다.

### Cloudflare Git 빌드 계약

Cloudflare Workers Builds는 저장소 루트에서 운영 브랜치 `main`을 빌드한다.
`central-infra`는 `.nvmrc`의 Node 버전과 `packageManager`의 pnpm 버전을 읽어
`NODE_VERSION`·`PNPM_VERSION` 빌드 환경변수에 적용한다. 버전을 바꾸면 인프라의
Builds 설정도 다시 적용한다.

빌드 명령은 `pnpm check`, 배포 명령은 `pnpm exec wrangler deploy`다. Cloudflare는
코드 변경을 받아 검증한 `out/`을 배포하며, 빌드 명령이 실패하면 배포 단계로
진행하지 않는다. `main`에 push한 뒤 Cloudflare의 **portfolio → Builds**에서
해당 커밋의 검사·빌드·배포 결과를 확인한다. 실패하면 로그에서 중단된 단계를
확인하고 수정한 커밋을 push한다. 성공 여부는 Git push 완료와 별도로 확인한다.

운영 설정 재적용과 복구 절차는 central-infra의
`cloudflare/builds/README.md`와 `cloudflare/builds/activation.md`를 따른다.
최초 설정, 검증한 배포 버전과 빌드 실행 근거도 해당 문서에서 관리한다.

앱 저장소는 정적 빌드·Wrangler·캐시 헤더를 관리한다. central-infra의 Terraform은
Worker·Custom Domain을, Builds API 스크립트는 Git 연결·트리거·빌드 환경을 관리한다.
`out/`을 커밋하거나 GitHub Actions 배포 워크플로를 추가하지 않는다.

### 캐시 정책

`public/_headers`는 빌드 시 `out/_headers`로 복사된다. 해시 또는 빌드 ID가 경로에
포함되는 `/_next/static/*`에만 `public, max-age=31536000, immutable`을 적용한다.
HTML과 파일명이 고정된 이미지·문서는 Workers Static Assets의 기본값인
`public, max-age=0, must-revalidate`를 유지한다.

이는 브라우저 캐시 정책이며 Cloudflare의 자동 CDN 캐시와 구분한다. 로컬에서는
응답 헤더와 HTML의 ETag 재검증을 확인하고, 운영 도메인의 CDN 캐시 동작은
central-infra 배포 검증에서 확인한다.

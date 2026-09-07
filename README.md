# 문서 목적

Next.js로 백엔드 개발자 포트폴리오 웹사이트를 제작한다. 이 웹사이트는 웹 포트폴리오이자 PDF 문서 역할을 한다.

## 기술 스택

- Next.js: 포트폴리오 웹사이트 구현
- Next.js Static Export (`output: 'export'`): 정적 파일 생성
- Print CSS (`@media print`): PDF 출력용 레이아웃과 스타일 구현
- Pencil: 포트폴리오 화면 구성과 디자인
- Docker Dev Container: 일관된 개발 환경 구성

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
Git 연결·빌드 명령·배포 인증은 `central-infra`가 관리하며, 운영 연결과 배포 검증은
별도 인프라 작업에서 완료한다.

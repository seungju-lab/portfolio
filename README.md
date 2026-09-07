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
- CDN: Cloudflare를 통해 정적 파일 서빙
- 도메인: `portfolio.seungju.dev`
- 제약: 서버 사이드 렌더링과 서버 API를 사용하지 않는 정적 웹사이트로 구현

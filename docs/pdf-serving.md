# PDF 제공과 갱신

홈의 `PDF 보기`는 `/portfolio.pdf`를 열며 파일 저장은 PDF 뷰어에서 제공한다. 파일은 `public/portfolio.pdf`에 커밋하고 Next.js 정적 빌드가 `out/portfolio.pdf`로 복사한다. 별도 서버나 뷰어는 필요하지 않다.

## 콘텐츠를 바꿀 때

Dev Container의 프로젝트 루트에서 실행한다. Node와 pnpm 버전은 저장소의 도구 버전 검사를 따른다.

```sh
pnpm install --frozen-lockfile
pnpm pdf:setup
pnpm pdf:generate
pnpm check
node --test scripts/check-pdf.test.mjs
pnpm check:export:test
```

`pdf:setup`은 고정된 Playwright 버전의 Chromium과 OS 라이브러리를 설치한다. 이미 준비된 환경에서는 반복할 필요가 없다. `pdf:generate`는 Next.js만 빌드한 뒤 임시 포트의 로컬 HTTP 서버에서 `/print/`를 읽는다. 글꼴과 이미지를 기다린 후 배경·태그·목차를 포함하고 브라우저 자동 머리글은 제외해 생성한다. 내용·링크·현재 8장 구성을 검사한 뒤 제공 PDF와 `scripts/pdf-manifest.json`을 교체하고 브라우저·서버를 종료한다. 일반 빌드를 재귀 호출하지 않는다. [Playwright PDF 옵션](https://playwright.dev/docs/api/class-page#page-pdf)을 따른다.

생성 후 모든 페이지의 색·사진·도식·페이지 나눔을 검토한다. HTTP로 제공되는 파일을 `BASE_URL`로 지정하고 `node scripts/check-styled-pdf.mjs`를 실행하면 전체 본문, 내부 목차 클릭, 외부 링크 열기, 한글 선택·검색을 검사한다. 기본 주소는 `http://127.0.0.1:3002`이며 결과는 `EVIDENCE_DIR`에 남는다. PDF를 검토한 뒤 소스 변경, PDF, manifest를 함께 커밋한다.

브라우저 링크 검사는 `BASE_URL=http://127.0.0.1:8787 node scripts/check-pdf-links.mjs`로 실행한다. PDF 뷰어가 포함된 Chromium과 UTF-8 로케일을 명시한다. 최소 headless shell은 PDF 새 탭을 표시하지 않으므로 전체 Chromium으로 검사한다.

## 오래된 PDF 방지

`pnpm build`는 먼저 `pdf:check`를 실행한다. manifest는 모든 `src`와 PDF를 제외한 `public` 파일, 패키지·잠금 파일·Next·TypeScript 설정 및 생성 코드의 해시와 PDF 바이트 해시를 기록한다. 파일 추가·삭제·수정이나 PDF 누락·변조 시 빌드가 실패한다. 홈처럼 PDF에 직접 보이지 않는 소스 변경도 보수적으로 갱신을 요구한다. 문서·검토 이미지 변경은 갱신을 요구하지 않는다.

이 검사는 생성 당시 소스와 파일의 대응을 확인한다. PDF의 시각 품질은 별도 렌더 검토로 확인한다. 페이지 수를 바꾸는 콘텐츠 변경은 승인된 배치와 생성 검사의 8장 기준을 함께 검토한다. `pdf:generate` 이후에는 입력 파일을 다시 고치지 않고 `pnpm check`를 실행한다. 형식 정리도 입력 변경이므로 먼저 수행한다.

일반 배포 빌드에는 브라우저 실행이나 PDF 생성이 필요하지 않다. 누락되거나 오래된 파일은 빌드가 차단하며, 정적 내보내기 검사는 제공 PDF가 원본과 같은지 확인한다.

## HTTP와 캐시

`public/_headers`에서 PDF 경로에 `Content-Type: application/pdf`와 `Cache-Control: public, max-age=0, must-revalidate`를 지정한다. 강제 다운로드용 `Content-Disposition: attachment`는 지정하지 않는다. 보기 링크는 새 탭으로 열고 저장 동작과 파일명은 브라우저·PDF 뷰어에 맡긴다. [Cloudflare 정적 자산 헤더 규칙](https://developers.cloudflare.com/workers/static-assets/headers/)에 따라 기존 Workers Assets 경로로 제공한다.

`pnpm exec wrangler dev --local --port 8787`로 같은 자산 제공 계층을 실행해 200, MIME, 캐시 헤더, ETag 재검증과 파일 갱신을 검사한다. `node scripts/check-pdf-cache.mjs`는 8791 포트의 자체 로컬 서버에서 ETag 재검증과 자산 버전 교체를 검사하고 원래 내보낸 PDF를 복원한다. 빌드로 `out`을 다시 만들었다면 실행 중인 Wrangler 개발 서버를 재시작한다. 이 로컬 확인과 `https://portfolio.seungju.dev/portfolio.pdf`의 배포 후 확인은 구별한다. 메인 병합·공개 배포는 별도 전달 단계다.

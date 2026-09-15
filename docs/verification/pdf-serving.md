# 정적 PDF 제공 최종 검증

2026-09-15, Deliverable #54의 문서·Pencil·코드·제공 PDF를 검토했다. 홈은 `GitHub` / `전체 열람 · PDF 다운로드` / `PDF 보기` 세 줄이며, 둘째 줄은 독립 링크 두 개다. 전체 열람에는 홈 링크만 남았다. 현재 제공 PDF는 8장이다.

## 환경과 기준

Linux Dev Container에서 Node 24.18.1, pnpm 11.18.0, Next.js 16.3.2, Playwright 1.63.0, Chromium 153.0.8010.12, PDF.js 6.3.289, Wrangler 4.129.0을 사용했다. 브라우저 검사는 완성된 정적 빌드를 Workers Assets 로컬 서버로 제공해 실행했다. 다운로드 검사는 한글 파일명을 지원하는 UTF-8 로케일과 PDF 뷰어가 포함된 Chromium을 사용했다.

기준은 [정적 PDF 요구사항](../design/pdf-serving-change-requirements.md), [홈 명세](../design/pages/home.md), [전체 열람 명세](../design/pages/print.md)와 [저장 확인한 Pencil](pdf-serving-pencil.md)이다. 구현 커밋은 `627babb`와 `7d06101`이다. 검증 코드·기록만 추가한 Work #62에서는 제품 소스와 제공 PDF를 변경하지 않았다.

## 결과

| 검증             | 결과와 증거                                                                                                                                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 홈 링크          | 1440·1024·1023·768·390·320px 각각 기본/200% 텍스트 12개 보기에서 넘침이 없다. 기본 세 줄, 작은 폭에서 확대 시 둘째 줄의 줄바꿈, 최소 44px 영역과 네 링크 Tab 순서를 확인했다. [링크 검사 결과](pdf-serving/links-results.json) |
| 실제 실행        | 키보드·터치 에뮬레이션에서 GitHub와 PDF 새 탭, 전체 열람 같은 탭, 다운로드 이벤트·한글 파일명과 바이트 동일성을 확인했다. 다운로드는 인쇄를 호출하지 않는다.                                                                   |
| 전체 열람        | 12개 레이아웃의 전체 본문·도식·앵커·키보드·이력·터치와 상세 제목 회귀 통과. [전체 열람 결과](pdf-serving/full-read-results.json)                                                                                               |
| 기존 프로젝트    | 15개 텍스트 200% 보기, 홈·상세 왕복과 본문 대조, A4와 인쇄 종료 복원 검사 통과. [회귀 결과](pdf-serving/regression-results.json)                                                                                               |
| 브라우저 인쇄    | Xvfb의 실제 Chromium 인쇄 대화상자를 Ctrl+P로 두 번 열고 취소했다. 매번 scrollY 850과 기존 홈 링크 포커스로 돌아왔다. [인쇄 결과](pdf-serving/native-print-results.json)                                                       |
| 제공 PDF         | 8장 전부 남색 배경, 사진·도식·전문과 선택 가능한 텍스트를 보존했다. 내부 목차 3개를 실제 클릭하고 외부 링크·한글 선택·검색을 확인했다. [뷰어 결과](pdf-serving/viewer-results.json)                                            |
| HTTP·갱신        | 200, application/pdf, 재검증 캐시 정책, 강제 attachment 없음. 같은 URL에서 이전 ETag는 304, 자산 버전 교체 후 이전 ETag는 새 바이트와 함께 200, 새 ETag는 304. [캐시 결과](pdf-serving/cache-results.json)                     |
| 최신성·정적 빌드 | 최신성 검사 5개와 내보내기 손상 검사 34개 통과. 콘텐츠 수정·새 스타일·PDF 손상·누락을 감지하며 정상 입력은 통과한다. `pnpm check`와 Wrangler 배포 dry-run도 통과했다.                                                          |

캐시 검사는 생성된 `out/portfolio.pdf`만 PDF 주석을 덧붙인 검사용 파일로 교체하고 로컬 서버를 다시 시작해 새 자산 버전을 모사했다. 검사 후 원본을 복원했으며 `public/portfolio.pdf`는 수정하지 않았다. 소스 변경 후 실제 재생성은 Work #60에서 #61로 진행하며 확인했다. 빌드와 브라우저 검사를 동시에 실행하지 않으며, `out`을 다시 만들었다면 Wrangler 개발 서버를 재시작한다.

## 시각 검토

[홈 1440px](pdf-serving/home-1440-1x.png), [390px](pdf-serving/home-390-1x.png), [320px](pdf-serving/home-320-1x.png), [320px 링크](pdf-serving/links-320-1x.png), [200% 링크](pdf-serving/links-320-2x.png)를 저장된 Pencil과 대조했다. 사진·색·서체·목차 위치를 유지하고 링크의 세 행과 확대 줄바꿈을 확인했다. [전체 열람 1440px](pdf-serving/print-1440.png)와 [390px](pdf-serving/print-390.png)의 상단에는 홈 링크만 있고 삭제한 버튼·안내의 빈 영역이 없다.

PDF의 [1장](pdf-serving/page-1.png), [2장](pdf-serving/page-2.png), [3장](pdf-serving/page-3.png), [4장](pdf-serving/page-4.png), [5장](pdf-serving/page-5.png), [6장](pdf-serving/page-6.png), [7장](pdf-serving/page-7.png), [8장](pdf-serving/page-8.png)을 모두 확인했다. 브라우저 자동 제목·날짜·URL은 없으며 설계된 하단 이름·페이지 번호는 남았다. Work #61의 PDF를 다시 렌더한 8개 이미지가 Work #60에서 검토한 이미지와 바이트 단위로 같아 동일한 시각 근거를 적용했다.

제공 파일은 [public/portfolio.pdf](../../public/portfolio.pdf), SHA-256은 `ec0ec3161263cc17b6340e271f631cad7e3530c7dbbfe9f8ca34785b74458e28`이며 1,255,892바이트다. 보기 주소에서 받은 파일과 키보드·터치로 저장한 파일 모두 같은 해시다.

## 재현과 확인 범위

[갱신 절차](../pdf-serving.md)에 따라 PDF를 준비한 뒤 정적 빌드를 제공한다. 다음 검사를 실행한다.

```sh
pnpm check
node --test scripts/check-pdf.test.mjs
pnpm check:export:test
pnpm exec wrangler deploy --dry-run
# 별도 터미널에서: pnpm exec wrangler dev --local --port 8787
BASE_URL=http://127.0.0.1:8787 node scripts/check-pdf-links.mjs
BASE_URL=http://127.0.0.1:8787 node scripts/check-full-read.mjs
BASE_URL=http://127.0.0.1:8787 node scripts/check-project-regression.mjs
BASE_URL=http://127.0.0.1:8787 node scripts/check-styled-pdf.mjs
# Xvfb :99 및 xdotool이 준비된 Linux 환경
BASE_URL=http://127.0.0.1:8787 node scripts/check-native-print.mjs
node scripts/check-pdf-cache.mjs
```

캐시 검사는 자체 로컬 서버의 8791 포트를 사용하므로 해당 포트를 비워 둔다. 실제 메뉴 인쇄 검사는 가상 디스플레이에서 실행했으며 Windows 로컬의 인쇄 설정과 실물 모바일 기기는 확인하지 않았다. 터치·폭·텍스트 확대는 Chromium 에뮬레이션 검증이다. 공개 주소 `https://portfolio.seungju.dev/portfolio.pdf`의 배포 후 확인과 CDN 상태는 이번 로컬 검증에 포함하지 않는다. Work 결과는 Deliverable 브랜치로 전달하며 메인 병합·공개 배포는 별도 단계다.

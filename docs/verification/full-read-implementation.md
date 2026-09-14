# 전체 열람·스타일 PDF 구현 검증

Deliverable #43 / Work #49의 구현 기록이다. 전체 열람과 개별 상세 페이지가 `ProjectSections` 및 `project-details.ts`를 공유한다. 별도 인쇄 요약 데이터와 고정 4장 가정을 제거했다. PDF는 전체 열람 HTML에 인쇄 CSS를 적용해 생성한다.

## 실제 출력

[최종 PDF](full-read-web/portfolio.pdf)는 Chromium 153.0.8010.12에서 A4, 배율 100%, CSS 용지 크기, 배경 그래픽 켜기로 생성한 12장이다. 사방 여백은 16mm이며 본문 14px·행간 1.7, 프로젝트 제목 28px, 섹션 제목 21px, 내부 제목 16px다. 대표 ILOG를 먼저 출력해 스타일·도식을 확인한 뒤 전체 출력으로 페이지 나눔을 조정했다.

| 장  | 내용                            | 실제 PDF 렌더                     |
| --- | ------------------------------- | --------------------------------- |
| 1   | 소개·사진·목차                  | [보기](full-read-web/page-01.png) |
| 2   | ILOG 소개·링크·개요             | [보기](full-read-web/page-02.png) |
| 3   | ILOG 아키텍처                   | [보기](full-read-web/page-03.png) |
| 4   | ILOG 문제 해결 사례 1·2         | [보기](full-read-web/page-04.png) |
| 5   | ILOG 사례 3·결과·회고           | [보기](full-read-web/page-05.png) |
| 6   | Lorekeeper 소개·링크·개요       | [보기](full-read-web/page-06.png) |
| 7   | Lorekeeper 아키텍처·로그인 사례 | [보기](full-read-web/page-07.png) |
| 8   | Lorekeeper 작품·회차 사례·결과  | [보기](full-read-web/page-08.png) |
| 9   | Matching SSAFY 소개·링크·개요   | [보기](full-read-web/page-09.png) |
| 10  | Matching SSAFY 아키텍처·팀 사례 | [보기](full-read-web/page-10.png) |
| 11  | Matching SSAFY 채팅 사례·결과   | [보기](full-read-web/page-11.png) |
| 12  | 교육·활동·작업 방식·연락        | [보기](full-read-web/page-12.png) |

모든 페이지를 이미지로 검토했다. 남색·청록색, 사진과 세 도식이 유지되며 본문 잘림·빈 페이지·고립된 제목이 없다. 마지막 사례와 결과는 함께 배치하고 교육·활동도 하나의 묶음으로 유지한다. 프로젝트마다 새 페이지에서 시작한다. 이 규칙이 만든 현재 결과가 12장이며 페이지 수 자체를 고정하지 않는다.

## 동작 검증

- 상세·전체 열람의 네 섹션 본문을 같은 데이터와 대조했다. PDF에서 추출한 텍스트도 각 프로젝트의 개요·아키텍처·사례·결과·검증 범위·회고 및 저장소 URL과 대조했다.
- PDF.js 6.3.289 뷰어에서 목차 세 항목을 실제 클릭해 2·6·9장으로 이동했다. 상세 웹페이지·ILOG 저장소·GitHub 연락 링크를 실제 클릭해 새 창의 목적지를 확인했다. ILOG의 개인 저장소 URL은 `seungju-lab/ilog`로 리디렉션된다. PDF 링크 정보와 실제 클릭 결과는 [뷰어 기록](full-read-web/viewer-results.json)에 있다.
- 같은 뷰어에서 한글 본문 선택과 `PreserveHostHeader` 검색을 확인했다. [뷰어 화면](full-read-web/pdf-viewer.png), [텍스트](full-read-web/pdf-text.txt), [PDF 정보](full-read-web/pdfinfo.txt), [글꼴 정보](full-read-web/pdffonts.txt)를 남겼다. Chromium이 글꼴을 임베딩된 Type 3로 내보냈으며 한글 렌더·선택·검색은 정상이다. Poppler 렌더 과정의 일부 glyph bounding-box 경고는 실제 표시 결함으로 재현되지 않았다.
- Linux Xvfb의 실제 Chromium 인쇄 창을 버튼과 운영체제 Ctrl+P로 각각 열고 취소했다. 두 경로 모두 `beforeprint`·`afterprint`가 발생하며 스크롤 850px와 버튼 포커스가 복원됐다. [기록](full-read-web/native-results.json). 오류·재시도 경로는 별도의 회귀 검사에서 인쇄 API를 모사해 확인했다.
- 배경 그래픽을 끈 출력은 남색 배경이 빠졌다. 저장 화면에 배경 그래픽을 켜라는 안내를 제공한다. 최종 PDF는 켜기 설정으로 검증했다.
- 전체 열람은 1440·1024·1023·768·390·320px에서 기본/200% 텍스트 확대를 검사했다. 목차의 키보드·터치 이동과 상세 페이지의 제목 구조도 확인했다. 기존 홈·상세를 포함한 15개 200% 확대 회귀 검사, 인쇄 오류·재실행 검사와 `pnpm check`가 통과했다.

## 재현

프로젝트의 Node·pnpm 버전으로 정적 빌드를 만들고 `out/`을 HTTP로 제공한다. 브라우저 검증 도구는 제품 의존성에 추가하지 않았다. 다음 경로는 이번 개발 컨테이너의 임시 설치 위치이며 다른 환경에서는 해당 변수만 바꾼다.

```sh
pnpm check
export PLAYWRIGHT_MODULE=/tmp/portfolio-browser/node_modules/playwright/index.mjs
export PDFJS_DIR=/tmp/portfolio-browser/node_modules/pdfjs-dist
export BASE_URL=http://127.0.0.1:3002
node scripts/check-full-read.mjs
node scripts/check-project-regression.mjs
node scripts/check-styled-pdf.mjs
# Xvfb :99 및 xdotool이 설치된 Linux에서 실제 인쇄 창 검사
DISPLAY=:99 node scripts/check-native-print.mjs
```

`check-styled-pdf.mjs`의 `EVIDENCE_DIR`로 PDF·뷰어 결과 경로를 지정할 수 있다. 페이지 이미지는 `pdftoppm -png -scale-to 1200 portfolio.pdf page`로 생성했다. Pencil 최종 배치와 저장 확인은 [시안 기록](full-read-pencil.md)에 남긴다. 이번 검증은 Linux Chromium과 PDF.js를 대상으로 하며 Windows 로컬의 Edge/Chrome, Firefox, Safari 및 실물 프린터는 검증하지 않았다.

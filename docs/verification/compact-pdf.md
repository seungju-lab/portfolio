# 8장 압축 PDF 구현 검증

2026-09-15 사용자가 저장한 [Pencil 압축안](https://github.com/seungju-lab/portfolio/blob/82bc5993d5332c39cf2efff4cd3d29032d1f4537/docs/design/pdf-compact-comparison.md)을 코드에 반영했다. [최종 PDF](compact-pdf/portfolio.pdf)는 기존 12장에서 8장으로 줄었다. 소개·교육과 프로젝트 전체 본문을 유지하며 본문은 14px·행간 1.7이다. 남색·청록색, 사진, 세 도식과 클릭 가능한 링크를 유지했다.

## 구현과 실제 배치

전체 열람의 교육·활동을 목차 다음으로 옮겨 웹과 PDF의 문서 순서를 통일했다. 웹은 한 열로 읽으며 인쇄할 때만 목차·교육·기능·담당 범위를 병렬 배치한다. 프로젝트의 개요와 아키텍처를 한 장에 묶고 문제 해결은 새 장에서 시작한다. ILOG의 마지막 사례는 결과·회고와 함께 다음 장에 놓는다. 이어지는 페이지에는 프로젝트 이름을 표시한다.

저장소와 상세 링크는 짧은 레이블로 표시하며 URL의 중복 인쇄를 제거했다. PDF 링크 목적지는 그대로 남는다. 공유 `ProjectSections`의 h4 기본 여백을 초기화해 소제목 주위의 불필요한 공간을 없앴다. 교육 날짜는 PDF.js가 대시를 정확히 추출하도록 인쇄에서 Noto Sans KR을 사용한다. 페이지 높이를 고정하거나 넘치는 본문을 숨기지 않는다.

| 장  | 내용                           | 실제 렌더                     |
| --- | ------------------------------ | ----------------------------- |
| 1   | 소개·사진·목차·교육·활동·연락  | [1장](compact-pdf/page-1.png) |
| 2   | ILOG 개요·아키텍처             | [2장](compact-pdf/page-2.png) |
| 3   | ILOG 문제 해결 1·2             | [3장](compact-pdf/page-3.png) |
| 4   | ILOG 문제 해결 3·결과·회고     | [4장](compact-pdf/page-4.png) |
| 5   | Lorekeeper 개요·아키텍처       | [5장](compact-pdf/page-5.png) |
| 6   | Lorekeeper 문제 해결·결과·회고 | [6장](compact-pdf/page-6.png) |
| 7   | Matching SSAFY 개요·아키텍처   | [7장](compact-pdf/page-7.png) |
| 8   | Matching SSAFY 문제 해결·결과  | [8장](compact-pdf/page-8.png) |

8장 모두 이미지를 열어 잘림·겹침·빈 페이지·고립된 제목을 확인했다. 날짜 글꼴을 마지막으로 조정한 뒤 첫 장을 다시 검토했고, 2~8장 렌더는 이미 검토한 이미지와 SHA-256이 같았다. ILOG 사례 장의 여백은 사례를 한 덩어리로 읽게 하려는 시안의 배치를 따른다.

## 검증 결과

- `pnpm check`의 도구 버전·포맷·lint·타입·정적 빌드·내보내기 검사를 통과했다. 기존 `check-native-print.mjs:23`의 lint 경고 1건은 남아 있으며 오류는 없다.
- PDF.js에서 홈 소개·교육·작업 방식과 각 프로젝트의 개요·아키텍처·문제 해결·결과·검증 범위·회고를 원본 데이터와 대조했다. 본문 누락과 페이지 바깥 텍스트가 없고 8장 모두 남색 배경이다. [뷰어 검사 결과](compact-pdf/viewer-results.json), [추출 텍스트](compact-pdf/pdf-text.txt).
- 목차를 실제 클릭해 ILOG 2장, Lorekeeper 5장, Matching SSAFY 7장으로 이동했다. ILOG 상세·저장소·GitHub 연락 링크도 실제 클릭했다. 모든 프로젝트 저장소와 상세 URL은 PDF 링크 주석에서 확인했다. 한글 선택과 `PreserveHostHeader` 검색이 정상이며 검색 결과는 4장이다.
- 전체 열람 1440·1024·1023·768·390·320px의 기본/200% 확대 12조건에서 넘침·본문·고유 앵커를 검사했다. 키보드·뒤로 가기·새로고침·터치 목차 이동과 개별 상세 제목 구조도 통과했다. [검사 결과](compact-pdf/web-results.json).
- 홈·상세를 포함한 200% 확대 15조건, 본문·이동, A4 출력, 인쇄 전후 이벤트, 스크롤 850px·버튼 포커스 복원, 인쇄 오류·재시도를 검사했다. [회귀 검사 결과](compact-pdf/regression-results.json).
- 웹 [1440px](compact-pdf/web-1440.png), [390px](compact-pdf/web-390.png)와 이동된 [교육 영역](compact-pdf/education-390.png)을 직접 확인했다.

## 환경과 재현

기존 `projects/portfolio`와 개발 컨테이너 `/workspace`에서 Node 24.18.1·pnpm 11.18.0으로 빌드했다. Linux Chromium 153과 PDF.js 6.3.289에서 A4, CSS 용지 크기, 배율 100%, 배경 그래픽 켜기로 검증했다. [PDF 정보](compact-pdf/pdfinfo.txt)에 용지·태그·생성 정보를 남겼다. 인쇄 이벤트·복원 검사는 자동 PDF 출력으로 수행했으며 이번 변경에서 운영체제 인쇄 창과 실물 프린터를 재검증하지는 않았다. Windows 로컬 등 다른 인쇄 환경에서는 페이지 수가 달라질 수 있다.

```sh
pnpm check
export PLAYWRIGHT_MODULE=/tmp/portfolio-browser/node_modules/playwright/index.mjs
export PDFJS_DIR=/tmp/portfolio-browser/node_modules/pdfjs-dist
export BASE_URL=http://127.0.0.1:3002
node scripts/check-full-read.mjs
node scripts/check-project-regression.mjs
EVIDENCE_DIR=docs/verification/compact-pdf node scripts/check-styled-pdf.mjs
```

위 주소는 정적 빌드 `out/`을 제공하는 로컬 서버다. 검증 도구의 임시 설치 경로는 제품 의존성에 추가하지 않았다. 기존 12장 산출물은 이전 작업의 기록으로 남기며 현재 구현은 이 문서와 [전체 열람·PDF 명세](../design/pages/print.md)를 따른다.

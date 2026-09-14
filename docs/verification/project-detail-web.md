# 프로젝트 상세 웹 구현 최종 검증

2026-09-14, [Deliverable #34](https://github.com/seungju-lab/portfolio/issues/34)의
세 프로젝트 상세 구현을 정적 빌드에서 검증했다. 네 섹션, 시스템 도식, 사례·결과,
외부 링크와 이전·다음 이동을 반영했고 기존 홈·전체 열람·A4 네 장을 유지했다.
Work #35의 본문·도식, Work #38의 탐색을 통합한 뒤 Work #41에서 검증과 문서를 마감했다.

## 기준과 실행 환경

- 기준 설계: `82feaad5c86743e211f198e00a94941fa09859df`의
  [상세 명세](../design/pages/project-detail.md)와
  [Pencil 검증 기록](project-detail-pencil.md)의 저장된 전체·부분 렌더.
- 구현 기준: Work #38의 `d01ef10ad65f7c28ad3c230b1cc23b44bd21c303`에
  아래 최초 앵커 포커스 보완을 적용했다. 최종 실행 소스 해시는
  [검증 메타데이터](project-detail-web/results.json)에, 결과 커밋은
  [Atomic #42](https://github.com/seungju-lab/portfolio/issues/42)에 기록한다.
- 기존 `projects/portfolio` 폴더 하나를 사용했다. Work 브랜치의 결과는
  `deliverable/34-project-detail-web`에 통합한다.
- Linux 호스트의 `portfolio-local-frontend-1` 개발 컨테이너,
  Node 24.18.1, pnpm 11.18.0, Playwright Chromium 153.0.8010.12를 사용했다.
  Playwright와 Poppler는 컨테이너 임시 검증 환경이며 제품 의존성은 바꾸지 않았다.
- `out/`을 컨테이너 내부 Python HTTP 서버 `http://127.0.0.1:3002`로 제공했다.
  Next 개발 서버에서는 `127.0.0.1` 원점의 일부 스크립트가 403으로 차단되는 것을
  발견했다. 최종 검증은 정적 빌드에서 수행했고 자산 HTTP 오류도 검사한다.

## 재현 명령과 결과

프로젝트에 지정된 도구 버전으로 다음 명령을 실행했다.

```bash
pnpm check
pnpm check:export:test
python3 -m http.server 3002 --bind 127.0.0.1 --directory out
```

`pnpm check`의 도구·포맷·lint·타입·프로덕션 빌드·정적 산출물 검사가 통과했다.
HTML 6개, `_headers`, 참조 자산 12개가 빌드 원본과 일치했다.
기존 산출물 회귀 테스트 31개도 모두 통과했다. 검사 제거·완화나 배포 설정 변경은 없다.

서버를 유지한 상태에서 별도 셸로 실행한다. `PLAYWRIGHT_MODULE`은 설치된
Playwright 모듈 경로로 바꿀 수 있다. 마지막 검사는 Node의 TypeScript 실행과
`pdfinfo`, `pdftotext`를 사용한다.

```bash
export BASE_URL=http://127.0.0.1:3002
export PLAYWRIGHT_MODULE=/tmp/portfolio-browser/node_modules/playwright/index.mjs
EVIDENCE_DIR=/tmp/portfolio-final-layout node scripts/check-project-detail-layout.mjs
EVIDENCE_DIR=/tmp/portfolio-final-links node scripts/check-project-links.mjs
EVIDENCE_DIR=/tmp/portfolio-final-anchors node scripts/check-project-anchors.mjs
EVIDENCE_DIR=/tmp/portfolio-final-regression node scripts/check-project-regression.mjs
```

| 검사                               | 실제 결과와 근거                                                                                                                                                                                                              |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 세 상세 × 1440·1024·1023·390·320px | 15개 조합의 네 제목·순서·목록·태그·결과 열·작은 글자·숨긴 목차·잘림 검사가 통과했다. [결과](project-detail-web/layout-results.json)                                                                                           |
| 같은 15개 조합의 텍스트 200%       | 루트 글자를 200%로 키워 노드 글자도 14→28px이 됨을 확인했다. 가로 넘침·숨김에 의한 잘림 없이 링크에 포커스할 수 있고 조작 영역은 44px 이상이었다. [결과](project-detail-web/regression-results.json)                          |
| 외부 링크·프로젝트 사이 이동       | 세 프로젝트 × 1440·390·320px의 주소·레이블·새 탭 안내·중복 부재·비순환 이동을 확인했다. 마우스·키보드·터치에서 대상 h1 포커스, 다음 Tab, 뒤로·앞으로 읽기 위치 복원이 통과했다. [결과](project-detail-web/links-results.json) |
| 새 앵커 4개·기존 앵커 3개          | 세 프로젝트 × 데스크톱·모바일에서 직접 진입 42건과 새로고침 42건이 통과했다. 제목 포커스·96/80px 도착 여백·문서 끝 제한·활성 목차·주소 정규화를 확인했다. [결과](project-detail-web/anchors-results.json)                     |
| 탐색 중 입력                       | 같은 문서 history는 섹션 시작에서 200px 더 읽은 위치까지 복원했다. 연속 이동·휠 중단·움직임 줄이기·기존 hash의 중복 이력 방지·페이지 이탈·모바일 Tab 제외를 확인했다.                                                         |
| 도식 접근성                        | figure의 텍스트 목록이 구성·연결·담당을 설명한다. 시각 화살표를 중복 낭독하지 않고 도식에 조작 요소·Tab 정지점이 없다. 각 화면의 접근성 YAML을 저장했다.                                                                      |
| 홈·전체 열람                       | 변경 전 공유 콘텐츠와 현재 데이터를 깊은 비교해 기존 값 보존을 확인했다. 홈 소개·요약·교육 문구, 세 프로젝트 이동·홈 복귀·전체 열람·홈 목차 history, 인쇄 본문 12문단을 브라우저에서 대조했다.                                |

전체 직접 주소 검사 후 history 시나리오는 새 페이지에서 실행한다. Chromium의
50개 이력 상한 때문에 `history.length` 검사가 잘못 실패했던 테스트 환경을 분리한 것이다.

## Pencil 대조와 구현 보완

세 프로젝트의 1440/390px 전체 화면을 기존 Pencil 전체 렌더와 대조했다.
작은 전체 렌더만으로 본문 판독을 주장하지 않고, 저장된 도식·사례·결과·이동
부분 렌더와 명세의 실제 문구·수치를 함께 확인했다.
네 섹션의 순서, 제목 위계, ILOG의 세 장애와 네 서비스 담당,
Lorekeeper의 두 구현 과제와 부분 담당, Matching SSAFY의 API·실시간 경로가 일치한다.
결과 두 묶음과 검증 한계를 유지하고, 확인되지 않은 성과·원인·회고는 추가하지 않았다.

웹 도식은 내용에 따라 높이를 늘리며 내부 폭 26rem 미만에서는 데스크톱에서도
세로 경로로 바꾼다. 1024px 부근의 좁은 본문 열에서 글자를 줄이지 않기 위한 보완이다.
문서에 이 기준과 텍스트 대안을 반영했다. 브라우저의 자연스러운 줄바꿈과 간격으로
전체 높이는 정적 캔버스와 다르다. 화면 캡처의 h1 테두리는 실제 도착 포커스 표시다.

반복 검사에서 초기 문서의 기본 fragment 처리와 hydration 후 제목 포커스가
겹쳐 포커스가 사라지는 경우를 발견했다. `SectionNavigation`은 글꼴·문서 로딩과
다음 프레임을 기다린 후 도착을 보완한다. 이미 사용자가 개입하거나 페이지를 떠난
경우에는 늦은 포커스를 적용하지 않는다. 수정한 빌드에서 전체 앵커 검사를 통과했다.

| 프로젝트       | 1440px                                                                                                                                                                        | 390px                                                                                                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ILOG           | [전체](project-detail-web/ilog-1440.png), [도식](project-detail-web/ilog-1440-diagram.png), [이동](project-detail-web/ilog-1440-navigation.png)                               | [전체](project-detail-web/ilog-390.png), [도식](project-detail-web/ilog-390-diagram.png), [이동](project-detail-web/ilog-390-navigation.png)                               |
| Lorekeeper     | [전체](project-detail-web/lorekeeper-1440.png), [도식](project-detail-web/lorekeeper-1440-diagram.png), [이동](project-detail-web/lorekeeper-1440-navigation.png)             | [전체](project-detail-web/lorekeeper-390.png), [도식](project-detail-web/lorekeeper-390-diagram.png), [이동](project-detail-web/lorekeeper-390-navigation.png)             |
| Matching SSAFY | [전체](project-detail-web/matching-ssafy-1440.png), [도식](project-detail-web/matching-ssafy-1440-diagram.png), [이동](project-detail-web/matching-ssafy-1440-navigation.png) | [전체](project-detail-web/matching-ssafy-390.png), [도식](project-detail-web/matching-ssafy-390-diagram.png), [이동](project-detail-web/matching-ssafy-390-navigation.png) |

390px의 텍스트 200% 근거:
[ILOG](project-detail-web/ilog-zoom-200.png),
[Lorekeeper](project-detail-web/lorekeeper-zoom-200.png),
[Matching SSAFY](project-detail-web/matching-ssafy-zoom-200.png).

## 기존 PDF 보존

Chromium의 실제 PDF 생성으로 [A4 네 장](project-detail-web/portfolio.pdf)을 출력했다.
첫 장은 소개·프로젝트 요약·교육·활동이며, 다음 장은 ILOG·Lorekeeper·Matching SSAFY다.
기존 12개 본문 문단과 저장소 주소를 각 장의 추출 텍스트에 대조했다.
[용지 정보](project-detail-web/pdfinfo.txt), [텍스트](project-detail-web/pdf-text.txt),
[페이지 경계 검사](project-detail-web/pdf-bounds.json)를 남겼다.
네 장의 663개 추출 단어가 페이지 안에 있고 아래 렌더에서 제목·문단·주소·쪽번호가
잘리지 않는 것을 확인했다.

[첫 장](project-detail-web/pdf-page-1.png), [ILOG](project-detail-web/pdf-page-2.png),
[Lorekeeper](project-detail-web/pdf-page-3.png), [Matching SSAFY](project-detail-web/pdf-page-4.png),
[전체 열람 화면](project-detail-web/print-web-1440.png).

실제 `beforeprint`·`afterprint`가 발생했고 읽던 850px 위치와 버튼 포커스가 복원됐다.
인쇄 호출 예외와 재시도 안내 해제는 이벤트를 주입해 확인했다.
Poppler의 Type3 글리프 경고가 한 번 출력됐으나, 한글 본문 추출·페이지 경계·네 장
시각 확인은 통과했다.

## 확인하지 않은 범위

이번 검증은 headless Chromium의 데스크톱·모바일 입력 에뮬레이션과 PDF 생성이다.
네이티브 인쇄 창의 저장·취소 조작, 물리 프린터, 실제 Windows·휴대전화,
Safari·Firefox는 재검증하지 않았다. 텍스트 확대는 루트 글자 크기 200%이며
브라우저 UI의 전체 페이지 확대와 구별한다. GitHub 링크의 주소·동작 속성을 확인했고
외부 저장소 서비스의 현재 응답 성공을 보장하지 않는다.
운영 Workers 응답·배포·main 통합은 이 Work의 완료 범위에 포함하지 않는다.

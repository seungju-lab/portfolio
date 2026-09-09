# 포트폴리오 웹·PDF 통합 검증

2026-09-09, [Work #22](https://github.com/seungju-lab/portfolio/issues/22)의 검증을 완료했다.
홈·세 상세·전체 열람의 콘텐츠, 반응형 배치, 입력과 탐색, A4 네 장 PDF,
Workers 로컬 응답을 확인했다. 운영 배포 결과를 뜻하지 않는다.

## 실행 기준과 환경

- 디자인 기준: 커밋 `1c1e87191feba0cb255ca3e4854ea418b64b69d1`의
  [디자인 개요](../design/overview.md)와 페이지별 반응 명세, 기존 Pencil 시안.
- 코드 기준: `951403351420b2e1dba78dd4c5b5763ab08092ad`에서 전체 검증을 실행하고,
  아래 PDF 시각 차이를 보완한 뒤 영향을 받는 웹·인쇄·산출물 검사를 다시 실행했다.
  최종 실행 소스의 SHA-256과 구조화된 결과는 [results.json](portfolio-web/results.json)에,
  최종 커밋은 [Atomic #24](https://github.com/seungju-lab/portfolio/issues/24)에 기록했다.
- Linux 호스트, Node `24.18.1`, pnpm `11.18.0`, Wrangler `4.129.0`,
  Chromium `140.0.7339.16`, 로컬 Workers `http://127.0.0.1:8787`을 사용했다.
- 화면 검사는 headless Chromium과 CDP를 사용했다. 데스크톱 fine pointer·hover,
  키보드, 터치와 움직임 줄이기를 에뮬레이션했다. 인쇄 미리보기는 Xvfb의 실제
  Chromium 창에서 실행했고 Ctrl+P는 가상 화면에 키 입력을 보냈다.
- 실제 Windows 브라우저, 휴대전화·태블릿, Safari·Firefox, 물리 프린터는
  확인하지 않았다. 모바일 에뮬레이션 결과를 실제 기기 성공으로 간주하지 않는다.

## 빌드와 Workers

다음 명령이 성공했다. 도구·의존성·배포 설정의 버전을 바꾸지 않았다.

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm check:export:test
pnpm exec wrangler deploy --dry-run
pnpm exec wrangler dev --local --port 8787
```

`pnpm check`는 포맷·린트·타입·프로덕션 빌드와 정적 산출물 검사를 통과했다.
6개 HTML, `_headers`, 12개 참조 자산이 같은 빌드 원본과 일치했다.
산출물 검사 테스트 31개는 정상 출력 1건과 누락·빈 파일·바이트 변경 30건이다.
손상은 임시 복사본에만 만들었고 원본 보존과 복사본 제거를 확인했다.

| 검사                                                                                                       | 결과                                       |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `/`, `/projects/ilog/`, `/projects/lorekeeper/`, `/projects/matching-ssafy/`, `/print/` 직접 접근·새로고침 | 200, HTML 정상                             |
| 없는 일반 경로와 프로젝트 경로                                                                             | 404                                        |
| `/index.html`, `/print`, `/print/index.html`, `/projects/ilog/index.html`                                  | trailing slash 주소로 리디렉션             |
| HTML ETag 재요청                                                                                           | 304, immutable 캐시 없음                   |
| 전체 열람의 JS·CSS·폰트                                                                                    | 200, `public, max-age=31536000, immutable` |
| Wrangler dry-run                                                                                           | 자산 61개, 정상 종료                       |

## 화면·콘텐츠·탐색

다섯 페이지 각각을 1440×1000, 390×1000, 320×1000, 1440×440에서 확인했다.
20개 조합 모두 수평 잘림과 독립적인 오른쪽 스크롤이 없었다. 낮은 창에서는
왼쪽 고정을 해제하고 문서 끝의 링크까지 접근할 수 있었다.

홈의 소개·프로젝트 요약·기간·역할·기술·교육·활동을 공유 콘텐츠와 대조했다.
상세 3개의 12개 문단은 디자인 문서 및 전체 열람과 일치했다. 진행 중 상태와
담당 범위, ILOG의 비활성 테스트·운영 미담당 등 검증 한계를 그대로 유지했다.

- 행·링크 hover, 빠른 포인터 변경, 해제·재진입, 커서 조명 위치와 프레임 갱신,
  텍스트 선택, 키보드 focus 우선순위, 모바일 한 번 탭을 검증했다.
- Tab·Shift+Tab과 Enter 탐색, 제목 도착 포커스, 다음 Tab 위치,
  직접 앵커 12개·없는 hash 4개, 뒤로·앞으로·새로고침 복원을 확인했다.
- 연속 목차 클릭·휠 개입·페이지 이탈은 이전 이동을 취소했다. 수동 스크롤은
  hash와 포커스를 바꾸지 않았다. 모바일 고정 소제목 교체도 확인했다.
- 움직임 줄이기 실시간 전환, 인쇄 전환, JavaScript 없는 홈·상세·전체 열람을
  확인했다. 프로젝트 행은 키보드 탐색에서 각각 한 번만 정지했다.
- 조명과 다른 행의 opacity를 함께 반영한 최저 메타 글자 대비 계산은 약 4.66:1이었다.

## Pencil 대조와 보완

Pencil은 MCP로 구조와 렌더를 조회했으며 편집하지 않았다. 홈 `kJ7Rg`·`iXTJI`,
ILOG `DYzMp`·`G6zZve`, 전체 열람 `C8Tz33`, A4 `PQBfG`·`mjt0u`를 기준으로 대조했다.

홈 데스크톱의 왼쪽 x=128, 본문 x=704, 상단 96px을 확인했다. 모바일 홈의
본문 시작은 약 425px, ILOG는 약 448px로 시안과 일치했다. 전체 열람 본문은
760px이다. 데스크톱 스크롤바가 차지하는 15px과 브라우저의 글꼴 줄바꿈 차이로
열 너비·전체 높이가 정적 캔버스와 달라질 수 있다. 고정 위치와 인쇄 안내 문구는
디자인 문서의 동작 명세를 적용했다.

대조 중 PDF의 머리말·역할·꼬리말 차이를 확인해 각 장의 이름/직무 머리말과
프로젝트 역할, 첫 장의 GitHub 주소를 보완했다. 하단은 시안처럼 이름을 왼쪽,
`01 / 04` 형식의 쪽번호를 오른쪽에 배치했다. 첫 장은 공유 콘텐츠의 프로젝트
요약과 교육 설명을 유지하므로 축약된 정적 시안보다 본문이 길다. 네 장 안에서
제목·문단·주소가 잘리지 않는 것을 다시 확인했다.

대표 렌더:

- [홈 1440px](portfolio-web/home-1440.png), [390px](portfolio-web/home-390.png),
  [320px](portfolio-web/home-320.png)
- [ILOG 390px](portfolio-web/ilog-390.png), [전체 열람 1440px](portfolio-web/print-web-1440.png)
- [최종 PDF 첫 장](portfolio-web/pdf-page-1.png), [ILOG 장](portfolio-web/pdf-page-2.png)

## 실제 인쇄·PDF

버튼 클릭·Space·Ctrl+P로 실제 미리보기를 열어 네 장·취소·재실행을 확인했다.
버튼 실행은 읽던 600px 위치와 버튼 포커스를, Ctrl+P는 같은 위치와 기존 링크
포커스를 복원했다. 실제 PDF 저장 후에도 850px 위치·버튼 포커스·남색 테마를
복원했다. 저장 대상 자동 선택은 검사용 브라우저 프로필에서만 설정했다.

최종 PDF와 데스크톱·모바일 폭·JavaScript 비활성 출력은 모두 A4 네 장이었다.
소개·목록·교육·활동, ILOG, Lorekeeper, Matching SSAFY 순서와 상세 문단 12개를
텍스트 추출로 대조했다. 저장소 링크, 머리말, 이름·쪽번호와 모든 텍스트 경계를
검사하고 네 장의 렌더를 확인했다. Chromium이 포함한 Type3 글리프와 ToUnicode를
확인해 한글 추출과 글자 표시가 가능한 것을 검증했다.

호출 불가·예외·재시도, 중복 실행 억제, 페이지 이탈 후 복원 취소는 브라우저
이벤트와 호출 실패를 주입해 검사했다. 파일 저장 성공이나 진행률은 UI에 표시하지 않는다.

실제 PDF는 실행 환경의 `/tmp/portfolio-work22-browser-results/seungju-portfolio.pdf`에
보관했고 SHA-256을 결과 JSON에 기록했다. 임시 PDF·브라우저 프로필·`out/`은
커밋하지 않았다. 위의 대표 렌더와 결과 JSON만 검증 근거로 저장했다.

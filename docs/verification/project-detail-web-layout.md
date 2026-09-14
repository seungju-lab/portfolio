# 프로젝트 상세 본문·도식 구현 검증

2026-09-14, [Work #35](https://github.com/seungju-lab/portfolio/issues/35)의
본문·반응형 도식을 개발 컨테이너의 실제 Chromium에서 확인했다.
대상은 이 기록을 포함한 커밋의 ILOG·Lorekeeper·Matching SSAFY 상세다.
본문 구현 커밋은 `05408ff`이며 도식은 후속 Atomic #37에 포함된다.

## 구현과 검증 범위

- `project-details.ts`에 확정 상세 콘텐츠를 두고, `portfolio.ts`의 기존 본문은
  인쇄판으로 유지했다. 변경 전 데이터와 깊은 비교를 수행해 홈·인쇄의 모든 기존
  값이 같음을 확인했다. 세 상세 콘텐츠도 설계 문서에서 추출한 문단·목록·사례·결과와
  대조했다.
- 네 h2 섹션, 기능·담당 목록, 태그, 사례별 레이블, 결과 두 묶음과 검증 범위·회고를
  구현했다. 문서의 제작용 도식 표·편집 근거는 본문에 표시하지 않는다.
- 도식은 담당 레이블과 연결 관계를 유지한다. 1440px에서는 시안의 분기·가로 배치를
  사용하고 모바일에서는 세로로 바꾼다. 데스크톱에서도 도식 내부 폭이 26rem 미만이면
  세로 경로를 사용한다. [1024px ILOG 도식](project-detail-web-layout/ilog-1024-diagram.png)에서
  좁은 세 열 때문에 글자가 과도하게 줄바꿈하는 문제를 보완했다.
- 도식 제목 18px, 노드 제목 14px, 역할·연결 레이블 13px을 유지했다. 시각 도식은
  접근성 트리에서 숨기고 같은 구성·연결·담당을 설명하는 텍스트 목록을 제공한다.
  도식에 링크·버튼·Tab 정지점은 없다.

## 실행 결과

Node 24.18.1, pnpm 11.18.0, Playwright Chromium 153 환경을 사용했다.
세 프로젝트를 1440·1024·1023·390·320px에서 확인한 15개 조합에서 제목 순서·앵커,
목록·태그 수, 제목 크기, 결과 열 수, 모바일 목차 숨김, 가로 넘침·요소 잘림 검사가
통과했다. 도식의 접근성 트리와 조작 요소 부재도 확인했다.
실행 중 페이지 오류는 없었고 홈·전체 열람 경로도 열렸다.
[검사 결과](project-detail-web-layout/results.json)에 화면별 값을 기록했다.

`pnpm check`의 도구 버전·포맷·lint·타입·정적 빌드·산출물 검사를 실행했다.
기존 디자인 문서 네 파일에서 발견한 포맷 오류는 Prettier로 정리했고,
표 구분선과 공백을 제외한 내용이 같음을 비교했다. Pencil 파일은 변경하지 않았다.
이전 [Pencil 검증 기록](project-detail-pencil.md)과 그 JSON의 문서 해시는
해당 기록에 명시된 과거 설계 커밋 기준이며, 이번 포맷 변경 후 파일 해시와 구별한다.

브라우저 검사는 [검증 스크립트](../../scripts/check-project-detail-layout.mjs)로 다시 실행할 수 있다.
개발 서버와 Playwright·Chromium이 준비된 환경에서 다음과 같이 실행한다.
프로젝트 의존성에 Playwright를 추가하지 않고 이번에는 컨테이너 임시 경로에 설치했다.

```bash
PLAYWRIGHT_MODULE=/tmp/portfolio-browser/node_modules/playwright/index.mjs \
  BASE_URL=http://127.0.0.1:3001 \
  EVIDENCE_DIR=/tmp/portfolio-detail-layout \
  node scripts/check-project-detail-layout.mjs
```

## 렌더와 접근성 근거

1440/390px 도식을 [Pencil 부분 렌더](project-detail-pencil.md#렌더-증빙)와 대조했다.
선 방향·담당 표시·시스템 관계를 유지하며 작은 폭에서는 연결 출발점을 글로 명시한다.

| 프로젝트       | 1440px                                                                                                                                                                                                  | 390px                                                                                                                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ILOG           | [전체](project-detail-web-layout/ilog-1440.png), [도식](project-detail-web-layout/ilog-1440-diagram.png), [접근성](project-detail-web-layout/ilog-1440-accessibility.yml)                               | [전체](project-detail-web-layout/ilog-390.png), [도식](project-detail-web-layout/ilog-390-diagram.png), [접근성](project-detail-web-layout/ilog-390-accessibility.yml)                               |
| Lorekeeper     | [전체](project-detail-web-layout/lorekeeper-1440.png), [도식](project-detail-web-layout/lorekeeper-1440-diagram.png), [접근성](project-detail-web-layout/lorekeeper-1440-accessibility.yml)             | [전체](project-detail-web-layout/lorekeeper-390.png), [도식](project-detail-web-layout/lorekeeper-390-diagram.png), [접근성](project-detail-web-layout/lorekeeper-390-accessibility.yml)             |
| Matching SSAFY | [전체](project-detail-web-layout/matching-ssafy-1440.png), [도식](project-detail-web-layout/matching-ssafy-1440-diagram.png), [접근성](project-detail-web-layout/matching-ssafy-1440-accessibility.yml) | [전체](project-detail-web-layout/matching-ssafy-390.png), [도식](project-detail-web-layout/matching-ssafy-390-diagram.png), [접근성](project-detail-web-layout/matching-ssafy-390-accessibility.yml) |

## 후속 Work에서 확인할 범위

외부 링크의 레이블·중복 제거와 이전 프로젝트 이동, 기존 앵커 호환·history·입력 중단의
전체 시나리오는 Work #38 범위다. 이 캡처에는 기존 하단 링크가 남아 있다.
PDF 네 장의 실제 출력·읽기 상태 복원, 200% 확대, 전체 탐색 회귀와 구현 상태 문서 갱신은
Work #41에서 최종 확인한다. 이 기록은 배포 또는 딜리버러블 전체 완료의 근거가 아니다.

Work #38·#41의 후속 결과는 [최종 웹 검증 기록](project-detail-web.md)에 있다. 위 캡처와 결과는 Work #35 시점의 근거로 유지한다.

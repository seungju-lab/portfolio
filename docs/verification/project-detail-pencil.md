# 프로젝트 상세 문서·Pencil 검증

2026-09-14, ILOG·Lorekeeper·Matching SSAFY의 1440px·390px 상세 시안을
[요구사항](../design/project-detail-change-requirements.md)과 대조했다.
네 섹션, 실제 프로젝트 콘텐츠, 도식, 링크 구성과 기존 스타일을 확인했다.
[Work #32](https://github.com/seungju-lab/portfolio/issues/32)의 최종 대조 기록이며,
정적 시안과 문서의 검증 결과다.

## 대상과 근거

- 화면: [portfolio.pen](../pen/portfolio.pen), 공통 원본: [portfolio.lib.pen](../pen/portfolio.lib.pen).
- 콘텐츠·배치 기준: [프로젝트 상세](../design/pages/project-detail.md), Work #26의
  커밋 `6063b66e5dfd6088ee718497c9bc7b703414156c`.
  상세 문서 SHA-256은 `b1e198111f9977be5f9b1c2a1e8210e8e9fcbfb511ac79b8187e84c31c0348de`다.
- 편집·렌더·구조 조회는 portfolio Dev Container의 Pencil MCP를 사용했다.
  파일의 본문을 직접 파싱하거나 수정하지 않았다.
- 변경 전 시안과 확정 문서를 시각 비교 기준으로 사용했다.
  [Dinesh Gaikwad의 상세 페이지](https://dineshgaikwad.vercel.app/projects/portfolio)는
  네 섹션과 정보 묶음의 출처다. 원문 본문 구조를 확인했으며, 원문을 같은 화면 폭으로
  렌더해 비교한 결과는 없다.

## 화면별 판정

| 프로젝트       | 크기   | 프레임   | 구조 | 시각 검토의 근거                                                                             |
| -------------- | ------ | -------- | ---- | -------------------------------------------------------------------------------------------- |
| ILOG           | 1440px | `DYzMp`  | 통과 | 기능·담당 범위, 네 담당 서비스, 세 문제 해결 사례, 두 결과가 구별된다.                       |
| ILOG           | 390px  | `G6zZve` | 통과 | Gateway를 시작점으로 명시한 세 경로와 긴 사례 제목을 세로로 읽을 수 있다.                    |
| Lorekeeper     | 1440px | `xfTNq`  | 통과 | 프론트엔드·백엔드의 부분 담당과 저장소 연결, 두 구현 과제, 두 결과가 구별된다.               |
| Lorekeeper     | 390px  | `w71qL`  | 통과 | 두 저장소 링크와 두 저장소 연결을 각각 세로로 배치했다. 소개·목록의 한 글자 고립을 수정했다. |
| Matching SSAFY | 1440px | `toznr`  | 통과 | API 조회와 실시간 메시지를 두 가로 경로로 나누고 팀 구현 과제와 채팅 문제를 구분했다.        |
| Matching SSAFY | 390px  | `tUysq`  | 통과 | 두 요청 경로와 결과가 한 열에 놓이고 마지막 이동에는 이전 링크만 있다.                       |

시각 판정은 여섯 화면 모두 통과다. 전체 렌더는 구성과 섹션 순서 확인에 사용하고,
소개·개요·도식 경로·사례·결과·이동은 읽을 수 있는 부분 렌더로 따로 확인했다.
축소된 긴 페이지 이미지 한 장으로 본문 가독성을 판단하지 않았다.

## 요구사항 대조

- 여섯 화면에서 개요·아키텍처·문제 해결·결과 순서와 큰 제목이 일치한다.
  데스크톱에는 네 항목 목차가 있고 모바일에는 없다.
- 프로젝트별 소개·기간·역할·기여, 주요 기능·담당 범위, 아키텍처 설명,
  사례 제목·본문과 결과·검증 한계 등 154개 콘텐츠 항목을 문서와 대조했다.
  화면을 위한 줄바꿈은 공백 차이로 처리했다. 편집 근거와 도식 제작 표는 표시되지 않는다.
- 각 화면에 상단 복귀 링크가 있고, 외부 주소 4개는 해당 프로젝트의 소개 영역에
  한 번씩 배치된다. 하단은 ILOG의 다음, Lorekeeper의 이전·다음,
  Matching SSAFY의 이전 순서다. 총 22개 이동 대상 주석을 대조했다.
- 남색·청록색, Noto Sans KR·Inter, 기존 SectionLink·TextLink·SkillTag 원본을
  유지했다. 새 요소도 같은 라이브러리의 변수·원본을 참조한다.
- 표시되는 인스턴스를 펼쳐 확인한 경계 검사에서 잘림과 가로 넘침이 없었다.
  감춘 선택 요소를 실제 표시 내용으로 세지 않았다. 최상위 화면끼리도 겹치지 않는다.
- 확인되지 않은 성과 수치를 추가하지 않았다. ILOG의 비활성 테스트와 운영 미담당,
  Lorekeeper의 개발 중 상태와 향후 서비스 분리, Matching SSAFY의 검증 범위를 보존했다.

## 시안에서 확정한 조정

- 데스크톱 도식에서 Matching SSAFY의 API·실시간 관계를 각각 가로로 배치했다.
  `Spring Boot`와 `백엔드`는 두 줄로 나누어 한 글자만 남지 않게 했다.
- ILOG 모바일의 긴 사례 제목 두 개는 의미 단위에서 줄을 나눴다.
  Lorekeeper 모바일의 기여 요약은 `/` 뒤에서, 마지막 담당 항목은 `원고 관리,`
  뒤에서 줄을 나눴다. 콘텐츠의 의미와 글자 크기는 유지했다.
- 데스크톱 결과 두 개의 높이를 더 긴 내용에 맞췄다. 모바일 결과는 한 열로 배치했다.
- 캔버스에서는 각 프로젝트의 데스크톱과 모바일을 나란히 정리했다.
  각 행 사이에는 앞 행에서 더 긴 화면의 끝을 기준으로 160px을 두었다.

## 보존·저장 확인

사용자가 저장한 파일의 바이트 복사본을 별도 경로에서 Pencil로 새로 열어 콘텐츠·연결을
다시 읽고 검증을 통과했다. 저장본과 최종 커밋 `753695ce393574f0796bd231a4f51bc8131e26ba`의
파일 해시가 같다. [results.json](project-detail-pencil/results.json)에 최종 파일 해시,
프레임 경계와 검사 결과를 기록했다.

기존 홈·전체 열람·A4·상태 예시 프레임 11개와 기존 공통 원본 9개는
원본의 MCP 읽기 결과와 동일하다. 기존 공통 변수 38개도 바뀌지 않았다.
기존 main 작업 디렉터리의 사용자 수정 파일은 해시 비교로 보존을 확인했다.
상세용 공통 원본 5개와 변수 5개를 추가했다.

현재 MCP의 편집·저장 결과에서 링크 `href`와 갱신한 `metadata`는 유지되지 않았다.
따라서 목적지·새 탭 여부와 최신 설계 식별값은 지원되는 `context`에 기록했다.
기존 `metadata.sourceRevision`은 생성 당시 값이다. 정적 시안의 목적지 주석을
실제로 클릭 가능한 웹 링크로 보고하지 않는다.

## 렌더 증빙

전체 이미지는 화면 구성을, 부분 이미지는 글자·도식·정보 묶음을 확인하는 자료다.
MCP가 반환한 검토용 이미지를 보존했으며 원본 해상도의 최종 디자인 내보내기는 아니다.

| 화면                | 전체 렌더                                             | 부분 렌더                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ilog-1440           | [전체](project-detail-pencil/ilog-1440.png)           | [소개·링크](project-detail-pencil/ilog-1440-identity.png), [도식](project-detail-pencil/ilog-1440-diagram.png), [사례 1](project-detail-pencil/ilog-1440-case-1.png), [사례 2](project-detail-pencil/ilog-1440-case-2.png), [사례 3](project-detail-pencil/ilog-1440-case-3.png), [결과](project-detail-pencil/ilog-1440-results.png)                                                                                                                                               |
| ilog-390            | [전체](project-detail-pencil/ilog-390.png)            | [소개·링크](project-detail-pencil/ilog-390-identity.png), [인증 경로](project-detail-pencil/ilog-390-auth-route.png), [사용자 경로](project-detail-pencil/ilog-390-user-route.png), [그룹 경로](project-detail-pencil/ilog-390-group-route.png), [사례 1](project-detail-pencil/ilog-390-case-1.png), [사례 2](project-detail-pencil/ilog-390-case-2.png), [사례 3](project-detail-pencil/ilog-390-case-3.png), [결과](project-detail-pencil/ilog-390-results.png)                  |
| lorekeeper-1440     | [전체](project-detail-pencil/lorekeeper-1440.png)     | [소개·링크](project-detail-pencil/lorekeeper-1440-identity.png), [도식](project-detail-pencil/lorekeeper-1440-diagram.png), [사례 1](project-detail-pencil/lorekeeper-1440-case-1.png), [사례 2](project-detail-pencil/lorekeeper-1440-case-2.png), [결과](project-detail-pencil/lorekeeper-1440-results.png), [하단 이동](project-detail-pencil/lorekeeper-1440-navigation.png)                                                                                                    |
| lorekeeper-390      | [전체](project-detail-pencil/lorekeeper-390.png)      | [소개·링크](project-detail-pencil/lorekeeper-390-identity.png), [저장소 경로](project-detail-pencil/lorekeeper-390-storage-routes.png), [담당 목록](project-detail-pencil/lorekeeper-390-duties.png), [사례 1](project-detail-pencil/lorekeeper-390-case-1.png), [사례 2](project-detail-pencil/lorekeeper-390-case-2.png), [결과](project-detail-pencil/lorekeeper-390-results.png), [하단 이동](project-detail-pencil/lorekeeper-390-navigation.png)                              |
| matching-ssafy-1440 | [전체](project-detail-pencil/matching-ssafy-1440.png) | [소개·링크](project-detail-pencil/matching-ssafy-1440-identity.png), [도식](project-detail-pencil/matching-ssafy-1440-diagram.png), [사례 1](project-detail-pencil/matching-ssafy-1440-case-1.png), [사례 2](project-detail-pencil/matching-ssafy-1440-case-2.png), [결과](project-detail-pencil/matching-ssafy-1440-results.png), [하단 이동](project-detail-pencil/matching-ssafy-1440-navigation.png)                                                                            |
| matching-ssafy-390  | [전체](project-detail-pencil/matching-ssafy-390.png)  | [소개·링크](project-detail-pencil/matching-ssafy-390-identity.png), [API 경로](project-detail-pencil/matching-ssafy-390-api-route.png), [실시간 경로](project-detail-pencil/matching-ssafy-390-message-route.png), [사례 1](project-detail-pencil/matching-ssafy-390-case-1.png), [사례 2](project-detail-pencil/matching-ssafy-390-case-2.png), [결과](project-detail-pencil/matching-ssafy-390-results.png), [하단 이동](project-detail-pencil/matching-ssafy-390-navigation.png) |

## 확인하지 않은 범위

웹 코드 반영, 브라우저 스크롤·앵커·포커스·hover·history, 실제 휴대전화,
320px 추가 폭, PDF 출력과 운영 배포는 이번 검증에 포함하지 않는다.
기존 웹·PDF 검증은 [2026-09-09 기록](portfolio-web.md)이며 새 상세 구현의
동작 검증을 대신하지 않는다.

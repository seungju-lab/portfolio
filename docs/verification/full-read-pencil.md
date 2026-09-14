# 전체 열람·PDF Pencil 검증

Deliverable #43의 Pencil Work #46 기록이다. 기준은 [변경 요구사항](../design/full-read-pdf-change-requirements.md)과 [전체 열람 명세](../design/pages/print.md)다.

## 전체 열람 — Atomic #47

기존 `C8Tz33`(1440px)와 `iKBMV`(390px) 프레임을 수정했다. 소개에 기존 사진을 넣고 프로젝트 목차, 세 프로젝트의 네 섹션·도식, 상세·저장소·GitHub 연락 링크를 배치했다. 홈과 개별 상세 프레임은 수정하지 않았다.

기존 라이브러리의 DetailSection·ChallengeBlock·ResultItem·SystemDiagram·DiagramNode·TextLink·교육 요소와 `$u:` 변수 연결을 유지했다. 본문 폭은 760/342px이다. 기존 시각 위계를 재사용해 프로젝트 제목은 40/32px, 프로젝트 간격은 80/64px로 초기안을 조정했고 페이지 명세에도 반영했다. 비활성 자식의 기본 치수가 발생시키던 잘림 경고는 해당 인스턴스의 비활성 자식 크기만 조정했다.

MCP 구조 조회에서 표시되는 요소의 잘림 문제가 없었다. 여섯 프로젝트 본문을 기존 상세 시안과 대조해 각각 72·55·56개 텍스트가 두 너비에서 일치함을 확인했다. 이전·다음 프로젝트 탐색은 전체 열람 본문에서 제외했다. 소개·목차·세 도식·결과 묶음을 실제 렌더로 확인했다.

| 화면   | 전체 렌더                           | 소개                               | 목차                               |
| ------ | ----------------------------------- | ---------------------------------- | ---------------------------------- |
| 1440px | [전체](full-read-pencil/C8Tz33.png) | [소개](full-read-pencil/fIxWe.png) | [목차](full-read-pencil/xCMTx.png) |
| 390px  | [전체](full-read-pencil/iKBMV.png)  | [소개](full-read-pencil/obane.png) | [목차](full-read-pencil/eIoxg.png) |

도식 렌더: [ILOG 1440](full-read-pencil/OpYrt.png), [Lorekeeper 1440](full-read-pencil/VjIeP.png), [Matching 1440](full-read-pencil/ZsdyA.png), [ILOG 390](full-read-pencil/Nq92J.png), [Lorekeeper 390](full-read-pencil/SdOLa.png), [Matching 390](full-read-pencil/PaAwp.png).

사용자의 Ctrl+S 저장 후 파일 변경과 MCP 재조회로 두 프레임·목차·본문의 유지와 placeholder 해제를 확인했다. 캔버스 반영·렌더·파일 저장 확인을 완료했다. 실제 목차 이동·키보드·터치·반응형 동작과 PDF 출력은 후속 구현·검증에서 확인한다. A4 시안과 실제 출력 검증은 아래에서 구별한다.

## A4 연속 시안 — Atomic #48

공통 라이브러리의 print 색을 웹과 같은 남색·청록색으로 바꾸고 본문 14px·행간 1.7, 큰 섹션 21px, 내부 제목 16px를 적용했다. print의 관련 간격은 12·16·24·32px로 조정했다. desktop/mobile 값은 유지했다. 라이브러리 저장 후 화면 파일을 다시 열어 `$u:` 참조가 새 값을 읽는 것을 확인했다.

794×1123px, 사방 60px, 본문 폭 674px의 연속 시안을 구성했다. 텍스트와 도식은 원본을 재사용하고 전체 열람의 텍스트 222개가 A4에 모두 포함되는지 대조했다. 도식과 사례는 페이지 안에서 유지하며 사례 사이에 페이지를 나눴다. 마지막 장의 교육·활동 간격은 16px로 조정해 쪽번호와 분리했다. 임시 조판 프레임은 최종 페이지 구성 후 제거했다.

| 장  | 내용                               | 렌더                                |
| --- | ---------------------------------- | ----------------------------------- |
| 1   | 소개·사진·프로젝트 목차            | [보기](full-read-pencil/PQBfG.png)  |
| 2   | ILOG 소개·링크·개요                | [보기](full-read-pencil/mjt0u.png)  |
| 3   | ILOG 아키텍처                      | [보기](full-read-pencil/O5jKw.png)  |
| 4   | ILOG 문제 해결 사례 1·2            | [보기](full-read-pencil/s7Mmj.png)  |
| 5   | ILOG 사례 3·결과·회고              | [보기](full-read-pencil/ThIHr.png)  |
| 6   | Lorekeeper 소개·링크·개요          | [보기](full-read-pencil/VY9ik.png)  |
| 7   | Lorekeeper 아키텍처·로그인 사례    | [보기](full-read-pencil/P67DB.png)  |
| 8   | Lorekeeper 작품·회차 사례·결과     | [보기](full-read-pencil/H9QZtv.png) |
| 9   | Matching SSAFY 소개·링크·개요      | [보기](full-read-pencil/B3DVPY.png) |
| 10  | Matching SSAFY 아키텍처·팀 사례    | [보기](full-read-pencil/w1eRz.png)  |
| 11  | 채팅 사례·결과·교육·활동·연락 경로 | [보기](full-read-pencil/PIiGg.png)  |

모든 페이지의 실제 렌더와 구조를 확인했다. A4 페이지는 작업용 placeholder를 해제했다. 사용자 저장 후 파일 변경과 MCP 재조회로 11장과 최종 배치의 저장을 확인했다. 11장은 현재 시안의 페이지 수이며 코드에 고정하지 않는다. Work #49·#52에서 실제 브라우저 PDF를 출력해 내용·글꼴·색·사진·도식·외부 링크·내부 목차 이동을 검증하고 최종 배치 차이를 기록한다.

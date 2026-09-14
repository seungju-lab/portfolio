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

사용자의 Ctrl+S 저장 후 파일 변경과 MCP 재조회로 두 프레임·목차·본문의 유지와 placeholder 해제를 확인했다. 캔버스 반영·렌더·파일 저장 확인을 완료했다. 실제 목차 이동·키보드·터치·반응형 동작과 PDF 출력은 후속 구현·검증에서 확인한다. A4 시안은 Atomic #48에서 구성한다.

// Public copy approved in docs/design/pages/{home,project-detail,print}.md.
// Detail and print views must render these same paragraph arrays.
export type ProjectSummary = {
  slug: string;
  title: string;
  period: string;
  role: string;
  summary: string;
  technologies: readonly string[];
};

export type Project = ProjectSummary & {
  detail: {
    period: string;
    role: string;
    team?: string;
    contribution: string;
    repositories: readonly { label: string; href: string }[];
    groups: readonly {
      id: "scope" | "implementation" | "verification";
      label: string;
      sections: readonly { title: string; paragraphs: readonly string[] }[];
    }[];
  };
};

export const profile = {
  name: "이승주",
  role: "Backend Developer",
  introduction: [
    "Java와 Spring으로 서비스를 만들고,",
    "요청이 흐르는 과정을 끝까지 살핍니다.",
  ],
  github: "https://github.com/ju1115",
  printHref: "/print/",
} as const;

export const homeNavigation = [
  {
    id: "about",
    label: "소개",
  },
  {
    id: "projects",
    label: "프로젝트",
  },
  {
    id: "education",
    label: "교육·활동",
  },
] as const;

export const introduction = [
  "Java와 Spring Boot로 백엔드를 개발하는 이승주입니다. 기계공학을 공부한 뒤 SSAFY에서 개발을 시작했고, 현재 SW마에스트로에서 Lorekeeper를 만들고 있습니다.",
  "로그인 이후 요청이 어디서 막히는지, 데이터와 권한의 경계를 어디에 둘지 고민하며 개발합니다. ILOG에서는 인증과 Gateway를, Matching SSAFY에서는 팀과 실시간 채팅을 담당했습니다.",
] as const;

export const projects = [
  {
    slug: "ilog",
    title: "ILOG",
    period: "2025.10 — 11",
    role: "인증·사용자·그룹·Gateway",
    summary:
      "일기와 감정 분석 서비스에서 네 서비스를 단독 설계·구현했습니다. 로그인 후 사용자 조회가 다시 로그인으로 돌아가던 문제를 인증 경계를 정리해 해결했습니다.",
    technologies: ["Java", "Spring Security", "Gateway"],
    detail: {
      period: "2025.10 — 2025.11",
      role: "인증·사용자·그룹·API Gateway",
      contribution: "6인 팀 · 네 서비스 단독 설계·구현",
      team: "6인 팀",
      repositories: [
        {
          label: "GitHub",
          href: "https://github.com/ju1115/ilog",
        },
      ],
      groups: [
        {
          id: "scope",
          label: "담당 범위",
          sections: [
            {
              title: "서비스와 담당 범위",
              paragraphs: [
                "일기와 일상을 기록하고 감정 분석 결과를 확인하는 서비스입니다. 저는 Java와 Spring Boot로 인증·사용자·그룹·API Gateway를 단독 설계하고 구현했습니다. 로그인과 토큰 발급, 사용자 조회, 그룹 초대·참여, 서비스 라우팅과 공통 인증을 맡았습니다.",
              ],
            },
          ],
        },
        {
          id: "implementation",
          label: "구현 과정",
          sections: [
            {
              title: "로그인했는데 다시 로그인으로 돌아간 이유",
              paragraphs: [
                "Google 로그인 이후 내 정보를 조회하면 User Service가 다시 로그인 화면으로 돌려보냈습니다. Gateway와 내부 서비스가 서로 다른 인증 방식을 적용하고 있었습니다. Gateway에서 쿠키의 액세스 토큰을 공개 키로 검증하고 X-User-Id 헤더로 사용자 식별자를 전달했습니다. User Service의 폼 로그인과 세션 인증을 비활성화하고, User·Group Service가 검증된 식별자를 사용하도록 정리했습니다.",
              ],
            },
            {
              title: "Google 로그인 흐름을 연결한 과정",
              paragraphs: [
                "Google은 OIDC 방식으로 동작해 기존 OAuth2 사용자 정보 처리 코드가 호출되지 않았습니다. OidcUserService를 사용해 사용자 정보 저장과 JWT 발급을 연결했습니다. 로그인 후 내부 주소인 auth-ms로 이동하던 문제는 Gateway의 PreserveHostHeader 필터로 외부 요청의 Host를 유지해 수정했습니다.",
              ],
            },
          ],
        },
        {
          id: "verification",
          label: "검증과 회고",
          sections: [
            {
              title: "확인한 결과와 남은 범위",
              paragraphs: [
                "Google 로그인 정상 동작을 직접 확인했습니다. Gateway 테스트에서는 인증 예외 경로와 토큰 누락·비유효 토큰 처리를 확인했습니다. 유효 토큰의 Gateway 통과 테스트는 비활성화된 상태였습니다. Jenkins·EC2 배포와 운영은 담당하지 않았습니다.",
              ],
            },
            {
              title: "서비스 분리에 대한 회고",
              paragraphs: [
                "팀에서는 프로젝트 규모에 비해 MSA가 과하다는 의견이 있었습니다. 저는 인증 서비스와 Gateway를 직접 구현해 보는 방향을 제안했습니다. 구현을 마친 뒤에는 기술적 도전뿐 아니라 팀과 서비스 규모에 맞는 선택인지 함께 검토해야 한다는 점을 배웠습니다.",
              ],
            },
          ],
        },
      ],
    },
  },
  {
    slug: "lorekeeper",
    title: "Lorekeeper",
    period: "2026.05 — 현재",
    role: "로그인·작품·회차",
    summary:
      "장편 창작자를 위한 작품 관리 서비스를 개발하고 있습니다. 로그인 프론트엔드·백엔드와 작품·회차 API, 원고 업로드 검증을 맡았습니다.",
    technologies: ["Spring Boot", "OAuth2", "JPA"],
    detail: {
      period: "2026.05 — 진행 중",
      role: "로그인 프론트엔드·백엔드, Work·Episode 백엔드 개발",
      contribution: "로그인 프론트엔드·백엔드\nWork·Episode 백엔드 개발",
      repositories: [
        {
          label: "Backend GitHub",
          href: "https://github.com/soma-lorekeeper/lorekeeper-backend",
        },
        {
          label: "Frontend GitHub",
          href: "https://github.com/soma-lorekeeper/lorekeeper-frontend",
        },
      ],
      groups: [
        {
          id: "scope",
          label: "담당 범위",
          sections: [
            {
              title: "서비스와 담당 범위",
              paragraphs: [
                "장편 창작자가 작품별 회차와 세계관을 관리하고 설정 오류 탐지 결과를 확인하는 서비스입니다. 저는 로그인 프론트엔드·백엔드와 작품·회차 API를 개발하고 있습니다. AI 설정 오류 탐지 엔진은 제 담당 범위에 포함하지 않습니다.",
              ],
            },
          ],
        },
        {
          id: "implementation",
          label: "구현 과정",
          sections: [
            {
              title: "브라우저와 서버의 로그인 상태 연결",
              paragraphs: [
                "Google OAuth 로그인 화면과 반환 처리, 보호된 화면 접근 제어를 구현했습니다. 서버에서는 JWT 발급·재발급, Redis 기반 OAuth 요청과 리프레시 토큰 관리, 쿠키 인증과 CSRF 처리를 맡았습니다. 로그아웃 이후 브라우저 상태와 현재 사용자 정보도 함께 동기화했습니다.",
              ],
            },
            {
              title: "작품과 회차를 다루는 API",
              paragraphs: [
                "Work에서는 작품 생성·조회·제목 수정과 사용자별 접근 처리를 구현했습니다. Episode에서는 회차 상태, 원고 수정·조회, UTF-8 다운로드와 여러 회차 업로드의 입력 검증·일괄 처리를 구현했습니다.",
              ],
            },
          ],
        },
        {
          id: "verification",
          label: "검증과 회고",
          sections: [
            {
              title: "진행 상황과 테스트",
              paragraphs: [
                "현재 개발을 진행하고 있으며, Work·Episode 도메인 테스트를 작성했습니다. 작품 접근과 회차 처리 규칙을 API 구현과 함께 다루고 있습니다.",
              ],
            },
          ],
        },
      ],
    },
  },
  {
    slug: "matching-ssafy",
    title: "Matching SSAFY",
    period: "2025.07 — 08",
    role: "팀·실시간 채팅",
    summary:
      "교육생의 프로젝트 팀 구성을 돕는 서비스입니다. 팀 초대·참여 API와 WebSocket·STOMP 채팅을 구현하고 프론트엔드 연동을 담당했습니다.",
    technologies: ["Spring Boot", "WebSocket", "STOMP"],
    detail: {
      period: "2025.07 — 2025.08",
      role: "백엔드 팀·채팅 도메인",
      contribution: "6인 팀 · 백엔드 팀·채팅 도메인",
      team: "6인 팀",
      repositories: [
        {
          label: "GitHub",
          href: "https://github.com/ju1115/Matching_SSAFY",
        },
      ],
      groups: [
        {
          id: "scope",
          label: "담당 범위",
          sections: [
            {
              title: "서비스와 담당 범위",
              paragraphs: [
                "SSAFY 교육생의 프로젝트 팀 구성을 지원하는 서비스입니다. 저는 팀 생성·조회·수정·삭제, 초대·참여 요청·거절·탈퇴와 팀 상태 잠금 기능을 개발했습니다. 팀 채팅과 1:1 채팅도 담당했습니다.",
              ],
            },
          ],
        },
        {
          id: "implementation",
          label: "구현 과정",
          sections: [
            {
              title: "실시간 메시지와 기록 조회",
              paragraphs: [
                "WebSocket과 STOMP로 팀·1:1 채팅 메시지를 송수신하고, 채팅방 생성과 메시지 기록 조회 API를 구현했습니다. 프론트엔드의 WebSocket 연결과 채팅 화면을 연동하며 연결·CORS 설정 오류, 1:1 채팅 상태 처리를 수정했습니다.",
              ],
            },
          ],
        },
        {
          id: "verification",
          label: "검증과 회고",
          sections: [
            {
              title: "테스트와 검증 범위",
              paragraphs: [
                "팀 서비스·컨트롤러와 채팅방·메시지·멤버 서비스의 단위 테스트 및 통합 테스트를 작성했습니다. 프론트엔드 연동 과정에서는 WebSocket 연결과 1:1 채팅 상태 처리를 수정했습니다.",
              ],
            },
          ],
        },
      ],
    },
  },
] as const satisfies readonly Project[];

export const education = [
  {
    period: "2026.05 — 2026.11 예정",
    title: "SW마에스트로 17기",
    description: ["연수생 · 참여 중", "Lorekeeper 로그인·Work·Episode 개발"],
  },
  {
    period: "2025.01 — 12",
    title: "삼성 청년 SW·AI 아카데미 13기",
    description: ["Java 백엔드 개발과 팀 프로젝트"],
  },
] as const;

export const workingPractice = {
  title: "개발 환경과 작업 방식",
  description:
    "개인 Linux 홈서버를 학습·개발에 활용합니다. AI 에이전트의 작업 분해와 완료 기준을 설계하고, 홈서버의 Terraform 전환 작업에 적용했습니다.",
} as const;

export const colophon = {
  credit: "Design inspired by Brittany Chiang.",
  href: "https://brittanychiang.com/",
  updated: "이승주 · 2026.09",
} as const;

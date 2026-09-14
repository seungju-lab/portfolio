// Home summaries. Full detail and print content share project-details.ts.
export type ProjectSummary = {
  slug: string;
  title: string;
  period: string;
  role: string;
  summary: string;
  technologies: readonly string[];
};

export type Project = ProjectSummary;

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
  },
  {
    slug: "lorekeeper",
    title: "Lorekeeper",
    period: "2026.05 — 현재",
    role: "로그인·작품·회차",
    summary:
      "장편 창작자를 위한 작품 관리 서비스를 개발하고 있습니다. 로그인 프론트엔드·백엔드와 작품·회차 API, 원고 업로드 검증을 맡았습니다.",
    technologies: ["Spring Boot", "OAuth2", "JPA"],
  },
  {
    slug: "matching-ssafy",
    title: "Matching SSAFY",
    period: "2025.07 — 08",
    role: "팀·실시간 채팅",
    summary:
      "교육생의 프로젝트 팀 구성을 돕는 서비스입니다. 팀 초대·참여 API와 WebSocket·STOMP 채팅을 구현하고 프론트엔드 연동을 담당했습니다.",
    technologies: ["Spring Boot", "WebSocket", "STOMP"],
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

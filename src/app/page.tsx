import {
  PortfolioShell,
  Profile,
  ProjectEntry,
  SectionLink,
  TextLink,
} from "@/components/portfolio";

export default function Home() {
  return (
    <PortfolioShell
      identity={
        <>
          <Profile name="이승주" role="Backend Developer">
            Java와 Spring으로 서비스를 만들고,
            <br />
            요청이 흐르는 과정을 끝까지 살핍니다.
          </Profile>
          <nav className="section-navigation" aria-label="본문 목차">
            <ul>
              <li>
                <SectionLink href="#about" current>
                  소개
                </SectionLink>
              </li>
              <li>
                <SectionLink href="#projects">프로젝트</SectionLink>
              </li>
            </ul>
          </nav>
          <ul className="profile-links">
            <li>
              <TextLink href="https://github.com/ju1115" external icon="github">
                GitHub
              </TextLink>
            </li>
            <li>
              <TextLink href="/print/" icon="print">
                전체 열람 · PDF
              </TextLink>
            </li>
          </ul>
        </>
      }
    >
      <section className="content-section" id="about">
        <h2 className="section-heading section-heading-desktop-hidden">소개</h2>
        <p>
          Java와 Spring Boot로 백엔드를 개발하는 이승주입니다. 기계공학을 공부한
          뒤 SSAFY에서 개발을 시작했고, 현재 SW마에스트로에서 Lorekeeper를
          만들고 있습니다.
        </p>
        <p>
          로그인 이후 요청이 어디서 막히는지, 데이터와 권한의 경계를 어디에 둘지
          고민하며 개발합니다. ILOG에서는 인증과 Gateway를, Matching SSAFY에서는
          팀과 실시간 채팅을 담당했습니다.
        </p>
      </section>
      <section className="content-section" id="projects">
        <h2 className="section-heading">프로젝트</h2>
        <ul className="entry-list">
          <li>
            <ProjectEntry
              project={{
                slug: "ilog",
                title: "ILOG",
                period: "2025.10 — 11",
                role: "인증·사용자·그룹·Gateway",
                summary:
                  "일기와 감정 분석 서비스에서 네 서비스를 단독 설계·구현했습니다. 로그인 후 사용자 조회가 다시 로그인으로 돌아가던 문제를 인증 경계를 정리해 해결했습니다.",
                technologies: ["Java", "Spring Security", "Gateway"],
              }}
            />
          </li>
        </ul>
      </section>
    </PortfolioShell>
  );
}

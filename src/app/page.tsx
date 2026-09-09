import { profile, introduction, projects } from "@/content/portfolio";
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
          <Profile name={profile.name} role={profile.role}>
            {profile.introduction[0]}
            <br />
            {profile.introduction[1]}
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
              <TextLink href={profile.github} external icon="github">
                GitHub
              </TextLink>
            </li>
            <li>
              <TextLink href={profile.printHref} icon="print">
                전체 열람 · PDF
              </TextLink>
            </li>
          </ul>
        </>
      }
    >
      <section className="content-section" id="about">
        <h2 className="section-heading section-heading-desktop-hidden">소개</h2>
        {introduction.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>
      <section className="content-section" id="projects">
        <h2 className="section-heading">프로젝트</h2>
        <ul className="entry-list">
          <li>
            <ProjectEntry project={projects[0]} />
          </li>
        </ul>
      </section>
    </PortfolioShell>
  );
}

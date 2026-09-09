import {
  colophon,
  education,
  homeNavigation,
  introduction,
  profile,
  projects,
  workingPractice,
} from "@/content/portfolio";
import {
  EducationEntry,
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
              {homeNavigation.map(({ id, label }) => (
                <li key={id}>
                  <SectionLink href={`#${id}`} current={id === "about"}>
                    {label}
                  </SectionLink>
                </li>
              ))}
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
      <section
        className="content-section about-section"
        id="about"
        aria-labelledby="about-heading"
      >
        <h2
          id="about-heading"
          className="section-heading section-heading-desktop-hidden"
          tabIndex={-1}
        >
          소개
        </h2>
        {introduction.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>
      <section
        className="content-section"
        id="projects"
        aria-labelledby="projects-heading"
      >
        <h2 id="projects-heading" className="section-heading" tabIndex={-1}>
          프로젝트
        </h2>
        <ul className="entry-list">
          {projects.map((project) => (
            <li key={project.slug}>
              <ProjectEntry project={project} />
            </li>
          ))}
        </ul>
      </section>
      <section
        className="content-section"
        id="education"
        aria-labelledby="education-heading"
      >
        <h2 id="education-heading" className="section-heading" tabIndex={-1}>
          교육·활동
        </h2>
        <ul className="entry-list">
          {education.map((entry) => (
            <li key={entry.title}>
              <EducationEntry period={entry.period} title={entry.title}>
                {entry.description.join("\n")}
              </EducationEntry>
            </li>
          ))}
        </ul>
        <div className="working-note">
          <h3>{workingPractice.title}</h3>
          <p>{workingPractice.description}</p>
        </div>
      </section>
      <footer className="portfolio-footer">
        <p lang="en">
          <a href={colophon.href} target="_blank" rel="noreferrer">
            {colophon.credit}
            <span className="visually-hidden" lang="ko">
              {" "}
              (새 탭)
            </span>
          </a>
        </p>
        <p>{colophon.updated}</p>
      </footer>
    </PortfolioShell>
  );
}

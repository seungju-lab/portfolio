import type { Project } from "@/content/portfolio";
import {
  ArticleSection,
  PortfolioShell,
  SectionLink,
  TextLink,
} from "@/components/portfolio";

export function ProjectDetail({ project }: { project: Project }) {
  return (
    <PortfolioShell
      variant="project"
      identity={
        <>
          <TextLink href="/#projects" icon="back">
            포트폴리오로
          </TextLink>
          <div className="project-overview">
            <h1
              className="project-name"
              id="project-heading"
              tabIndex={-1}
              lang="en"
            >
              {project.title}
            </h1>
            <p className="project-period">{project.detail.period}</p>
            <p className="project-role">{project.role}</p>
            <p className="project-contribution">
              {project.detail.contribution}
            </p>
          </div>
          <nav
            className="section-navigation project-navigation"
            aria-label="프로젝트 목차"
          >
            <ul>
              {project.detail.groups.map(({ id, label }) => (
                <li key={id}>
                  <SectionLink href={`#${id}`} current={id === "scope"}>
                    {label}
                  </SectionLink>
                </li>
              ))}
            </ul>
          </nav>
          <ul className="repository-links">
            {project.detail.repositories.map((repository) => (
              <li key={repository.href}>
                <TextLink href={repository.href} external icon="github">
                  {repository.label} 저장소
                </TextLink>
              </li>
            ))}
          </ul>
        </>
      }
    >
      <article className="project-article" aria-labelledby="project-heading">
        {project.detail.groups.map((group) => (
          <div className="article-group" id={group.id} key={group.id}>
            {group.sections.map((section, index) => (
              <ArticleSection
                key={section.title}
                title={section.title}
                headingId={index === 0 ? `${group.id}-heading` : undefined}
              >
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </ArticleSection>
            ))}
          </div>
        ))}
      </article>
    </PortfolioShell>
  );
}

import { ProjectArrivalFocus } from "@/components/project-arrival-focus";
import { ProjectSections } from "@/components/project-sections";
import type { Project } from "@/content/portfolio";
import { detailNavigation, projectDetails } from "@/content/project-details";
import { PortfolioShell, SectionLink, TextLink } from "@/components/portfolio";

export function ProjectDetail({
  project,
  previousProject,
  nextProject,
}: {
  project: Project;
  previousProject?: Pick<Project, "slug" | "title">;
  nextProject?: Pick<Project, "slug" | "title">;
}) {
  const detail = projectDetails[project.slug];
  return (
    <PortfolioShell
      variant="project"
      identity={
        <>
          <ProjectArrivalFocus />
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
            <p className="project-period">{detail.period}</p>
            <p className="project-role">{detail.role}</p>
            <p className="project-contribution">{detail.contribution}</p>
          </div>
          <nav
            className="section-navigation project-navigation"
            aria-label="프로젝트 목차"
          >
            <ul>
              {detailNavigation.map(({ id, label }) => (
                <li key={id}>
                  <SectionLink href={`#${id}`} current={id === "overview"}>
                    {label}
                  </SectionLink>
                </li>
              ))}
            </ul>
          </nav>
          <ul className="repository-links">
            {detail.repositories.map((repository) => (
              <li key={repository.href}>
                <TextLink href={repository.href} external icon="github">
                  {repository.label}
                </TextLink>
              </li>
            ))}
          </ul>
        </>
      }
    >
      <article className="project-article" aria-labelledby="project-heading">
        <ProjectSections project={project} />
      </article>
      <nav className="case-navigation" aria-label="프로젝트 사이 이동">
        {previousProject && (
          <TextLink href={`/projects/${previousProject.slug}/`} icon="back">
            이전 프로젝트 · {previousProject.title}
          </TextLink>
        )}
        {nextProject && (
          <TextLink href={`/projects/${nextProject.slug}/`}>
            다음 프로젝트 · {nextProject.title}
          </TextLink>
        )}
      </nav>
    </PortfolioShell>
  );
}

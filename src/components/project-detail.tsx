import { ProjectArrivalFocus } from "@/components/project-arrival-focus";
import type { Project } from "@/content/portfolio";
import {
  detailNavigation,
  projectDetails,
  type DetailSectionId,
} from "@/content/project-details";
import type { ReactNode } from "react";
import {
  PortfolioShell,
  SectionLink,
  SkillTag,
  TextLink,
} from "@/components/portfolio";

function DetailSection({
  id,
  children,
}: {
  id: DetailSectionId;
  children: ReactNode;
}) {
  return (
    <section
      className="detail-section"
      id={id}
      aria-labelledby={`${id}-heading`}
    >
      <h2 id={`${id}-heading`} tabIndex={-1}>
        {detailNavigation.find((section) => section.id === id)?.label}
      </h2>
      {children}
    </section>
  );
}

function DetailList({
  title,
  items,
}: {
  title: string;
  items: readonly string[];
}) {
  return (
    <div className="detail-list">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function ProjectDetail({
  project,
  nextProject,
}: {
  project: Project;
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
            {project.print.repositories.map((repository) => (
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
        <DetailSection id="overview">
          <p>{detail.overview.introduction}</p>
          <DetailList title="주요 기능" items={detail.overview.features} />
          <DetailList
            title="담당 범위"
            items={detail.overview.responsibilities}
          />
          <ul className="skill-list detail-skills" aria-label="사용 기술">
            {project.technologies.map((technology) => (
              <li key={technology}>
                <SkillTag>{technology}</SkillTag>
              </li>
            ))}
          </ul>
        </DetailSection>
        <DetailSection id="architecture">
          <div className="architecture-description">
            {detail.architecture.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </DetailSection>
        <DetailSection id="challenges">
          {detail.challenges.map((challenge) => (
            <section className="challenge-block" key={challenge.title}>
              <h3>{challenge.title}</h3>
              <dl>
                {challenge.parts.map((part) => (
                  <div key={part.label}>
                    <dt>{part.label}</dt>
                    <dd>{part.text}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </DetailSection>
        <DetailSection id="results">
          <div className="detail-results">
            {detail.results.map((result) => (
              <section className="result-item" key={result.title}>
                <h3>{result.title}</h3>
                <p>{result.text}</p>
              </section>
            ))}
          </div>
          <div className="detail-result-note">
            <h3>검증 범위</h3>
            <p>{detail.limitations}</p>
          </div>
          {detail.reflection && (
            <div className="detail-result-note">
              <h3>{detail.reflection.title}</h3>
              <p>{detail.reflection.text}</p>
            </div>
          )}
        </DetailSection>
      </article>
      <nav className="case-navigation" aria-label="프로젝트 관련 링크">
        {project.print.repositories.map((repository) => (
          <TextLink key={repository.href} href={repository.href} external>
            {project.print.repositories.length === 1
              ? "코드에서 확인하기"
              : `${repository.label}에서 코드 확인하기`}
          </TextLink>
        ))}
        {nextProject ? (
          <TextLink href={`/projects/${nextProject.slug}/`}>
            다음 프로젝트 · {nextProject.title}
          </TextLink>
        ) : (
          <TextLink href="/#projects" icon="back">
            프로젝트 목록으로
          </TextLink>
        )}
      </nav>
    </PortfolioShell>
  );
}

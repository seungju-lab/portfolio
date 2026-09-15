import { SystemDiagram } from "@/components/system-diagram";
import { SkillTag } from "@/components/portfolio";
import type { Project } from "@/content/portfolio";
import {
  detailNavigation,
  projectDetails,
  type DetailSectionId,
} from "@/content/project-details";
import type { ReactNode } from "react";

function DetailSection({
  id,
  children,
  headingLevel,
  prefix,
  projectTitle,
}: {
  headingLevel: 2 | 3;
  prefix: string;
  projectTitle?: string;
  id: DetailSectionId;
  children: ReactNode;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const anchor = `${prefix}${id}`;
  return (
    <section
      className="detail-section"
      data-project={projectTitle}
      id={anchor}
      aria-labelledby={`${anchor}-heading`}
    >
      <Heading
        className="detail-heading"
        id={`${anchor}-heading`}
        tabIndex={-1}
      >
        {detailNavigation.find((section) => section.id === id)?.label}
      </Heading>
      {children}
    </section>
  );
}

function DetailList({
  title,
  items,
  headingLevel,
}: {
  headingLevel: 2 | 3;
  title: string;
  items: readonly string[];
}) {
  const Subheading = headingLevel === 2 ? "h3" : "h4";
  return (
    <div className="detail-list">
      <Subheading className="detail-subheading">{title}</Subheading>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function ProjectSections({
  project,
  headingLevel = 2,
  prefix = "",
}: {
  project: Project;
  headingLevel?: 2 | 3;
  prefix?: string;
}) {
  const detail = projectDetails[project.slug];
  const Subheading = headingLevel === 2 ? "h3" : "h4";
  return (
    <>
      <DetailSection headingLevel={headingLevel} prefix={prefix} id="overview">
        <p>{detail.overview.introduction}</p>
        <DetailList
          headingLevel={headingLevel}
          title="주요 기능"
          items={detail.overview.features}
        />
        <DetailList
          headingLevel={headingLevel}
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
      <DetailSection
        headingLevel={headingLevel}
        prefix={prefix}
        id="architecture"
      >
        <SystemDiagram
          slug={project.slug}
          headingLevel={headingLevel === 2 ? 3 : 4}
        />
        <div className="architecture-description">
          {detail.architecture.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </DetailSection>
      <DetailSection
        headingLevel={headingLevel}
        prefix={prefix}
        id="challenges"
        projectTitle={project.title}
      >
        {detail.challenges.map((challenge) => (
          <section
            className="challenge-block"
            data-project={project.title}
            key={challenge.title}
          >
            <Subheading className="detail-subheading">
              {challenge.title}
            </Subheading>
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
      <DetailSection headingLevel={headingLevel} prefix={prefix} id="results">
        <div className="detail-results">
          {detail.results.map((result) => (
            <section className="result-item" key={result.title}>
              <Subheading className="detail-subheading">
                {result.title}
              </Subheading>
              <p>{result.text}</p>
            </section>
          ))}
        </div>
        <div className="detail-result-note">
          <Subheading className="detail-subheading">검증 범위</Subheading>
          <p>{detail.limitations}</p>
        </div>
        {detail.reflection && (
          <div className="detail-result-note">
            <Subheading className="detail-subheading">
              {detail.reflection.title}
            </Subheading>
            <p>{detail.reflection.text}</p>
          </div>
        )}
      </DetailSection>
    </>
  );
}

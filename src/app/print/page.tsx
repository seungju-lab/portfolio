import type { Metadata } from "next";
import type { Project } from "@/content/portfolio";
import { PrintToolbar } from "@/components/print-toolbar";
import { EducationEntry, TextLink } from "@/components/portfolio";
import {
  education,
  introduction,
  profile,
  projects,
  workingPractice,
} from "@/content/portfolio";

export const metadata: Metadata = {
  title: "전체 열람 · PDF | 이승주",
  description:
    "이승주의 소개와 세 프로젝트의 담당 범위·구현 과정·검증 기록을 한 문서로 읽습니다.",
};

export default function PrintPage() {
  return (
    <div className="print-shell">
      <PrintToolbar />
      <main id="main-content" className="print-document">
        <header className="print-introduction">
          <h1 className="profile-name">{profile.name}</h1>
          <p className="profile-role" lang="en">
            {profile.role}
          </p>
          {introduction.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </header>
        {projects.map((project: Project) => (
          <article
            className="print-project"
            id={project.slug}
            key={project.slug}
            aria-labelledby={`${project.slug}-heading`}
          >
            <header className="print-project-heading">
              <h2 id={`${project.slug}-heading`} lang="en">
                {project.title}
              </h2>
              <p className="project-period">{project.detail.period}</p>
              <p className="project-contribution">
                {project.detail.contribution}
              </p>
            </header>
            {project.detail.groups
              .flatMap((group) => group.sections)
              .map((section) => (
                <section className="print-article-section" key={section.title}>
                  <h3>{section.title}</h3>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </section>
              ))}
            <ul className="repository-links print-repositories">
              {project.detail.repositories.map((repository) => (
                <li key={repository.href}>
                  <TextLink href={repository.href} external icon="github">
                    {repository.label} 저장소
                  </TextLink>
                  <a
                    className="print-repository-address"
                    href={repository.href}
                  >
                    {repository.href}
                  </a>
                </li>
              ))}
            </ul>
          </article>
        ))}
        <section
          className="print-education"
          aria-labelledby="education-heading"
        >
          <h2 id="education-heading" className="section-heading">
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
      </main>
    </div>
  );
}

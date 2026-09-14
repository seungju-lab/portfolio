import type { Metadata } from "next";
import Image from "next/image";
import profilePortrait from "@/assets/profile-portrait.webp";
import { PrintToolbar } from "@/components/print-toolbar";
import { EducationEntry, TextLink } from "@/components/portfolio";
import { ProjectSections } from "@/components/project-sections";
import { projectDetails } from "@/content/project-details";
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
    "이승주의 소개와 세 프로젝트의 담당 범위·아키텍처·문제 해결·결과를 한 문서로 읽습니다.",
};

export default function PrintPage() {
  return (
    <div className="print-shell">
      <PrintToolbar />
      <main id="main-content" className="print-document">
        <header className="print-introduction">
          <div className="print-profile">
            <div>
              <h1 className="profile-name">{profile.name}</h1>
              <p className="profile-role" lang="en">
                {profile.role}
              </p>
            </div>
            <Image
              className="print-portrait"
              src={profilePortrait}
              alt={`${profile.name} 프로필 사진`}
              width={96}
              height={120}
              preload
            />
          </div>
          {introduction.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </header>
        <nav className="print-contents" aria-labelledby="contents-heading">
          <h2 id="contents-heading">프로젝트</h2>
          <ol>
            {projects.map((project, index) => (
              <li key={project.slug}>
                <TextLink href={`#${project.slug}`}>
                  <span lang="en">
                    {String(index + 1).padStart(2, "0")} · {project.title}
                  </span>
                </TextLink>
                <p>
                  {projectDetails[project.slug].period}
                  <br />
                  {projectDetails[project.slug].role}
                </p>
              </li>
            ))}
          </ol>
        </nav>
        {projects.map((project) => {
          const detail = projectDetails[project.slug];
          return (
            <article
              className="print-project"
              id={project.slug}
              key={project.slug}
              aria-labelledby={`${project.slug}-heading`}
            >
              <header className="print-project-heading">
                <h2 id={`${project.slug}-heading`} lang="en" tabIndex={-1}>
                  {project.title}
                </h2>
                <p className="project-period">{detail.period}</p>
                <p className="project-role">{detail.role}</p>
                <p className="project-contribution">{detail.contribution}</p>
                <ul className="repository-links print-repositories">
                  {detail.repositories.map((repository) => (
                    <li key={repository.href}>
                      <TextLink href={repository.href} external icon="github">
                        {repository.label}
                      </TextLink>
                    </li>
                  ))}
                  <li>
                    <TextLink
                      href={`https://portfolio.seungju.dev/projects/${project.slug}/`}
                      external
                    >
                      상세 웹페이지
                    </TextLink>
                  </li>
                </ul>
              </header>
              <div className="print-project-body">
                <ProjectSections
                  project={project}
                  headingLevel={3}
                  prefix={`${project.slug}-`}
                />
              </div>
            </article>
          );
        })}
        <section
          className="print-education"
          aria-labelledby="education-heading"
        >
          <h2 id="education-heading">교육·활동</h2>
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
          <p className="print-contact">
            <TextLink href={profile.github} external icon="github">
              {profile.github.replace("https://", "")}
            </TextLink>
          </p>
        </section>
      </main>
    </div>
  );
}
